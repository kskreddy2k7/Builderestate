import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import { NotificationsService } from '@/shared/notifications/notifications.service'
import { PaymentsService } from '@/shared/payments/payments.service'
import { BookingStatus, PaymentStatus, PaymentMethod, NotificationType, UnitStatus } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import type { RequestUser } from '@/common/decorators'
import type {
  CreateBookingDto, UpdateBookingStatusDto, CancelBookingDto,
  CreatePaymentOrderDto, VerifyPaymentDto, RecordOfflinePaymentDto,
  IssueDemandLetterDto, CreateProjectBudgetDto, CreateExpenditureDto, UpdateUnitPricingDto,
} from './dto/erp.dto'

@Injectable()
export class ErpService {
  private readonly logger = new Logger(ErpService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
    private readonly payments: PaymentsService,
  ) {}

  // ─── Bookings ─────────────────────────────────────────────────────────────

  async createBooking(dto: CreateBookingDto, user: RequestUser) {
    const unit = await this.prisma.unit.findUnique({ where: { id: dto.unitId }, include: { floor: { include: { tower: true } } } })
    if (!unit) throw new NotFoundException('Unit not found')
    if (unit.status !== UnitStatus.AVAILABLE) throw new BadRequestException(`Unit is ${unit.status.toLowerCase()}, not available`)

    const bookingNumber = `BK${new Date().getFullYear().toString().slice(2)}${Math.floor(100000 + Math.random() * 900000)}`
    const gstRate = 0.05
    const baseAmount = Number(unit.finalPrice ?? unit.basePrice)
    const gstAmount = baseAmount * gstRate
    const discountAmount = dto.discountAmount ?? 0
    const finalAmount = baseAmount + gstAmount - discountAmount

    const booking = await this.prisma.$transaction(async (tx) => {
      // Mark unit as booked
      await tx.unit.update({ where: { id: dto.unitId }, data: { status: UnitStatus.BOOKED } })

      const newBooking = await tx.booking.create({
        data: {
          bookingNumber, unitId: dto.unitId,
          projectId: unit.floor.tower.projectId,
          buyerId: dto.buyerId, brokerId: dto.brokerId, agentId: dto.agentId,
          totalAmount: baseAmount, discountAmount, gstAmount, finalAmount,
          bookingAmount: dto.bookingAmount,
          bookingDate: dto.bookingDate ? new Date(dto.bookingDate) : new Date(),
          status: BookingStatus.CONFIRMED,
          remarks: dto.remarks,
        },
      })

      // Create payment schedule
      if (dto.paymentSchedule?.length) {
        await tx.paymentScheduleItem.createMany({
          data: dto.paymentSchedule.map((s) => ({
            bookingId: newBooking.id,
            unitId: dto.unitId,
            milestoneId: s.milestoneId,
            milestone: s.milestone,
            percentage: s.percentage,
            amount: (finalAmount * s.percentage) / 100,
            dueDate: new Date(s.dueDate),
            status: 'PENDING',
          })),
        })
      }

      return newBooking
    })

    await this.notifications.create({
      userId: dto.buyerId,
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'Booking confirmed!',
      body: `Your booking for Unit ${unit.unitNumber} has been confirmed. Booking No: ${bookingNumber}`,
      data: { bookingId: booking.id, unitId: dto.unitId },
      sendEmail: true,
      emailOptions: {
        subject: `Booking Confirmation — ${bookingNumber}`,
        html: `<p>Your booking has been confirmed.</p><p><strong>Booking No:</strong> ${bookingNumber}</p><p><strong>Unit:</strong> ${unit.unitNumber}</p><p><strong>Amount:</strong> ₹${finalAmount.toLocaleString('en-IN')}</p>`,
      },
    })

    await this.redis.del(this.redis.key('project', unit.floor.tower.projectId, 'inventory'))
    return this.getBookingById(booking.id)
  }

  async getBookings(orgId: string, filters: { page?: number; limit?: number; status?: BookingStatus; projectId?: string } = {}) {
    const { page = 1, limit = 20, status, projectId } = filters
    const where: Prisma.BookingWhereInput = {
      unit: { floor: { tower: { project: { orgId } } } },
      ...(status && { status }),
      ...(projectId && { projectId }),
    }
    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: {
          unit: { select: { unitNumber: true, bhkType: true, area: true } },
          buyer: { select: { id: true, name: true, email: true, phone: true } },
          broker: { select: { id: true, name: true } },
          _count: { select: { payments: true } },
        },
      }),
      this.prisma.booking.count({ where }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        unit: { include: { floor: { include: { tower: { include: { project: { select: { id: true, name: true } } } } } } } },
        buyer: { select: { id: true, name: true, email: true, phone: true } },
        broker: { select: { id: true, name: true } },
        paymentSchedule: { orderBy: { dueDate: 'asc' } },
        payments: { orderBy: { createdAt: 'desc' }, take: 10 },
        documents: true,
        commission: true,
      },
    })
    if (!booking) throw new NotFoundException('Booking not found')
    return booking
  }

  async updateBookingStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } })
    if (!booking) throw new NotFoundException('Booking not found')
    return this.prisma.booking.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.agreementDate && { agreementDate: new Date(dto.agreementDate) }),
        ...(dto.registrationDate && { registrationDate: new Date(dto.registrationDate) }),
        ...(dto.remarks && { remarks: dto.remarks }),
      },
    })
  }

  async cancelBooking(id: string, dto: CancelBookingDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } })
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.status === BookingStatus.CANCELLED) throw new BadRequestException('Already cancelled')

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED, cancelledAt: new Date(), cancellationReason: dto.reason },
      })
      await tx.unit.update({ where: { id: booking.unitId }, data: { status: UnitStatus.AVAILABLE } })
    })

    await this.notifications.create({
      userId: booking.buyerId,
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'Booking cancelled',
      body: `Your booking ${booking.bookingNumber} has been cancelled.`,
      data: { bookingId: id },
    })

    return { message: 'Booking cancelled' }
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  async createPaymentOrder(dto: CreatePaymentOrderDto) {
    const item = await this.prisma.paymentScheduleItem.findUnique({ where: { id: dto.scheduleItemId } })
    if (!item) throw new NotFoundException('Payment schedule item not found')
    if (item.status === 'PAID') throw new BadRequestException('Already paid')
    return this.payments.createOrder({
      bookingId: dto.bookingId,
      scheduleItemId: dto.scheduleItemId,
      amount: Number(item.amount),
    })
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    await this.payments.verifyAndCapture(dto)
    return { message: 'Payment verified and captured' }
  }

  async recordOfflinePayment(dto: RecordOfflinePaymentDto, user: RequestUser) {
    const item = await this.prisma.paymentScheduleItem.findUnique({ where: { id: dto.scheduleItemId } })
    if (!item) throw new NotFoundException('Schedule item not found')

    const payment = await this.prisma.payment.create({
      data: {
        paymentNumber: `PAY${Date.now().toString(36).toUpperCase()}`,
        bookingId: dto.bookingId,
        scheduleItemId: dto.scheduleItemId,
        amount: dto.amount, gstAmount: dto.amount * 0.05,
        totalAmount: dto.amount,
        status: PaymentStatus.COMPLETED,
        method: dto.method,
        transactionRef: dto.transactionRef,
        chequeNumber: dto.chequeNumber, bankName: dto.bankName,
        paidAt: new Date(dto.paidAt),
      },
    })

    await this.prisma.paymentScheduleItem.update({
      where: { id: dto.scheduleItemId },
      data: { status: 'PAID', paidDate: new Date(dto.paidAt), paidAmount: dto.amount },
    })

    await this.notifications.create({
      userId: (await this.prisma.booking.findUnique({ where: { id: dto.bookingId }, select: { buyerId: true } }))!.buyerId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment recorded',
      body: `Offline payment of ₹${dto.amount.toLocaleString('en-IN')} has been recorded.`,
      data: { paymentId: payment.id },
    })

    return payment
  }

  async getPaymentHistory(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    })
  }

  // ─── Demand Letters ───────────────────────────────────────────────────────

  async issueDemandLetter(dto: IssueDemandLetterDto) {
    const item = await this.prisma.paymentScheduleItem.findUnique({
      where: { id: dto.scheduleItemId },
      include: { booking: { include: { buyer: true } } },
    })
    if (!item) throw new NotFoundException('Schedule item not found')

    const seq = await this.prisma.demandLetter.count({ where: { bookingId: dto.bookingId } })
    const letterNumber = `DL-${item.booking.bookingNumber}-${String(seq + 1).padStart(3, '0')}`

    const gstAmount = Number(item.amount) * 0.05
    const letter = await this.prisma.demandLetter.create({
      data: {
        bookingId: dto.bookingId, scheduleItemId: dto.scheduleItemId,
        letterNumber, amount: item.amount, gstAmount,
        totalAmount: Number(item.amount) + gstAmount,
        dueDate: new Date(dto.dueDate),
        status: 'ISSUED',
      },
    })

    await this.prisma.paymentScheduleItem.update({
      where: { id: dto.scheduleItemId },
      data: { status: 'DEMAND_RAISED', demandLetterDate: new Date() },
    })

    await this.notifications.create({
      userId: item.booking.buyerId,
      type: NotificationType.DEMAND_LETTER,
      title: 'Payment demand raised',
      body: `Demand letter ${letterNumber} for ₹${(Number(item.amount) + gstAmount).toLocaleString('en-IN')} has been issued. Due: ${new Date(dto.dueDate).toLocaleDateString('en-IN')}.`,
      data: { letterId: letter.id, bookingId: dto.bookingId },
      sendEmail: true,
      emailOptions: {
        subject: `Payment Demand — ${letterNumber}`,
        html: `<p>Dear ${item.booking.buyer.name},</p><p>A payment demand of <strong>₹${(Number(item.amount) + gstAmount).toLocaleString('en-IN')}</strong> has been raised.</p><p>Due Date: ${new Date(dto.dueDate).toLocaleDateString('en-IN')}</p>`,
      },
    })

    return letter
  }

  // ─── Budget ───────────────────────────────────────────────────────────────

  async createBudget(projectId: string, dto: CreateProjectBudgetDto) {
    const existing = await this.prisma.projectBudget.findUnique({ where: { projectId } })
    if (existing) throw new BadRequestException('Budget already exists for this project. Use update instead.')

    return this.prisma.projectBudget.create({
      data: {
        projectId, fiscalYear: dto.fiscalYear,
        totalBudget: dto.totalBudget, sanctionedBudget: dto.totalBudget,
        heads: dto.heads?.length ? {
          create: dto.heads.map((h) => ({ name: h.name, category: h.category, allocatedAmount: h.allocatedAmount })),
        } : undefined,
      },
      include: { heads: true },
    })
  }

  async getBudget(projectId: string) {
    const budget = await this.prisma.projectBudget.findUnique({
      where: { projectId },
      include: {
        heads: { include: { expenditures: { orderBy: { createdAt: 'desc' }, take: 5 } } },
      },
    })
    if (!budget) throw new NotFoundException('No budget found for this project')

    const varianceHeads = budget.heads.map((h) => ({
      ...h,
      varianceAmount: Number(h.allocatedAmount) - Number(h.spentAmount),
      variancePercentage: Number(h.allocatedAmount) > 0
        ? ((Number(h.allocatedAmount) - Number(h.spentAmount)) / Number(h.allocatedAmount)) * 100
        : 0,
    }))

    return { ...budget, heads: varianceHeads }
  }

  async createExpenditure(projectId: string, dto: CreateExpenditureDto, user: RequestUser) {
    const gstAmount = dto.gstAmount ?? 0
    return this.prisma.$transaction(async (tx) => {
      const expenditure = await tx.expenditure.create({
        data: {
          projectId, budgetHeadId: dto.budgetHeadId,
          description: dto.description, amount: dto.amount,
          gstAmount, totalAmount: dto.amount + gstAmount,
          vendorId: dto.vendorId, invoiceNumber: dto.invoiceNumber,
          invoiceDate: new Date(dto.invoiceDate),
          approvedById: user.id,
        },
      })
      await tx.budgetHead.update({
        where: { id: dto.budgetHeadId },
        data: { spentAmount: { increment: dto.amount + gstAmount } },
      })
      await tx.projectBudget.update({
        where: { projectId },
        data: { spentAmount: { increment: dto.amount + gstAmount } },
      })
      return expenditure
    })
  }

  // ─── Financial Dashboard ──────────────────────────────────────────────────

  async getFinancialSummary(projectId: string) {
    const cacheKey = this.redis.key('project', projectId, 'finance')
    return this.redis.cached(cacheKey, async () => {
      const [bookings, payments, budget, overdue] = await Promise.all([
        this.prisma.booking.aggregate({
          where: { projectId, status: { not: BookingStatus.CANCELLED } },
          _count: { id: true }, _sum: { finalAmount: true },
        }),
        this.prisma.payment.aggregate({
          where: { booking: { projectId }, status: PaymentStatus.COMPLETED },
          _sum: { totalAmount: true }, _count: { id: true },
        }),
        this.prisma.projectBudget.findUnique({
          where: { projectId }, select: { totalBudget: true, spentAmount: true },
        }),
        this.prisma.paymentScheduleItem.aggregate({
          where: {
            booking: { projectId },
            status: { in: ['PENDING', 'DEMAND_RAISED'] },
            dueDate: { lt: new Date() },
          },
          _count: { id: true }, _sum: { amount: true },
        }),
      ])

      return {
        bookings: {
          count: bookings._count.id,
          totalValue: Number(bookings._sum.finalAmount ?? 0),
        },
        collected: Number(payments._sum.totalAmount ?? 0),
        budget: {
          total: Number(budget?.totalBudget ?? 0),
          spent: Number(budget?.spentAmount ?? 0),
        },
        overdue: {
          count: overdue._count.id,
          amount: Number(overdue._sum.amount ?? 0),
        },
      }
    }, 180)
  }

  // ─── Unit Pricing ─────────────────────────────────────────────────────────

  async updateUnitPricing(unitId: string, dto: UpdateUnitPricingDto) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } })
    if (!unit) throw new NotFoundException('Unit not found')

    const basePrice = dto.basePrice ?? Number(unit.basePrice)
    const floorRise = dto.floorRisePremium ?? Number(unit.floorRisePremium ?? 0)
    const facingPremium = dto.facingPremium ?? Number(unit.facingPremium ?? 0)

    return this.prisma.unit.update({
      where: { id: unitId },
      data: {
        basePrice, floorRisePremium: floorRise, facingPremium,
        finalPrice: basePrice + floorRise + facingPremium,
      },
    })
  }
}
