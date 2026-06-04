import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import { NotificationsService } from '@/shared/notifications/notifications.service'
import { FilesService } from '@/shared/files/files.service'
import { PaymentsService } from '@/shared/payments/payments.service'
import { NotificationType } from '@prisma/client'
import type { RequestUser } from '@/common/decorators'
import type {
  CreateComplaintDto, UpdateComplaintDto, AddComplaintUpdateDto,
  CreateSnagItemDto, UpdateSnagItemDto,
} from './dto/buyer.dto'

@Injectable()
export class BuyerService {
  private readonly logger = new Logger(BuyerService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
    private readonly files: FilesService,
    private readonly payments: PaymentsService,
  ) {}

  // ─── Dashboard ────────────────────────────────────────────────────────────

  async getDashboard(userId: string) {
    const cacheKey = this.redis.key('buyer', userId, 'dashboard')
    return this.redis.cached(cacheKey, async () => {
      const bookings = await this.prisma.booking.findMany({
        where: { buyerId: userId, status: { not: 'CANCELLED' } },
        include: {
          unit: {
            include: {
              floor: {
                include: {
                  tower: {
                    include: {
                      project: {
                        include: {
                          milestones: { orderBy: { plannedEndDate: 'asc' }, take: 3 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          paymentSchedule: { where: { status: { in: ['PENDING', 'DEMAND_RAISED'] } }, orderBy: { dueDate: 'asc' }, take: 3 },
          _count: { select: { payments: true, complaints: true } },
        },
        orderBy: { bookingDate: 'desc' },
      })

      const [totalPaid, pendingPayments, openComplaints] = await Promise.all([
        this.prisma.payment.aggregate({
          where: { booking: { buyerId: userId }, status: 'COMPLETED' },
          _sum: { totalAmount: true },
        }),
        this.prisma.paymentScheduleItem.count({
          where: { booking: { buyerId: userId }, status: { in: ['PENDING', 'DEMAND_RAISED'] } },
        }),
        this.prisma.complaint.count({
          where: { booking: { buyerId: userId }, status: { not: 'CLOSED' } },
        }),
      ])

      return {
        bookings,
        stats: {
          totalBookings: bookings.length,
          totalPaid: Number(totalPaid._sum.totalAmount ?? 0),
          pendingPayments,
          openComplaints,
        },
      }
    }, 120)
  }

  // ─── Bookings ─────────────────────────────────────────────────────────────

  async getMyBookings(userId: string, page = 1, limit = 10) {
    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where: { buyerId: userId },
        skip: (page - 1) * limit, take: limit,
        orderBy: { bookingDate: 'desc' },
        include: {
          unit: {
            include: {
              floor: {
                include: {
                  tower: { include: { project: { select: { id: true, name: true, city: true, coverImage: true } } } },
                },
              },
            },
          },
          paymentSchedule: { orderBy: { dueDate: 'asc' } },
        },
      }),
      this.prisma.booking.count({ where: { buyerId: userId } }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getBookingDetail(id: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        unit: {
          include: {
            floor: {
              include: {
                tower: {
                  include: {
                    project: {
                      include: {
                        milestones: { orderBy: { plannedStartDate: 'asc' } },
                        progressUpdates: {
                          where: { isVisibleToBuyers: true },
                          orderBy: { createdAt: 'desc' }, take: 10,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        paymentSchedule: { orderBy: { dueDate: 'asc' }, include: { demandLetters: { orderBy: { issuedAt: 'desc' }, take: 1 } } },
        payments: { orderBy: { paidAt: 'desc' } },
        documents: { where: { isCustomerVisible: true } },
        demandLetters: { orderBy: { issuedAt: 'desc' } },
        complaints: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.buyerId !== userId) throw new ForbiddenException('Access denied')
    return booking
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  async getPaymentSummary(userId: string, bookingId?: string) {
    const where = bookingId
      ? { id: bookingId, buyerId: userId }
      : { buyerId: userId }

    const bookings = await this.prisma.booking.findMany({
      where,
      include: {
        paymentSchedule: { orderBy: { dueDate: 'asc' } },
        payments: { where: { status: 'COMPLETED' }, orderBy: { paidAt: 'desc' } },
        unit: { select: { unitNumber: true, bhkType: true } },
      },
    })

    return bookings.map((booking) => {
      const paid = booking.payments.reduce((sum, p) => sum + Number(p.totalAmount), 0)
      const total = Number(booking.finalAmount)
      const overdue = booking.paymentSchedule.filter(
        (s) => s.status !== 'PAID' && new Date(s.dueDate) < new Date(),
      )
      return {
        bookingId: booking.id, bookingNumber: booking.bookingNumber,
        unit: booking.unit,
        totalAmount: total, paid, balance: total - paid,
        collectionPercentage: total > 0 ? Math.round((paid / total) * 100) : 0,
        overdueCount: overdue.length,
        overdueAmount: overdue.reduce((sum, s) => sum + Number(s.amount), 0),
        schedule: booking.paymentSchedule,
        recentPayments: booking.payments.slice(0, 5),
      }
    })
  }

  async initiatePayment(bookingId: string, scheduleItemId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.buyerId !== userId) throw new ForbiddenException('Access denied')

    const item = await this.prisma.paymentScheduleItem.findUnique({ where: { id: scheduleItemId } })
    if (!item) throw new NotFoundException('Payment schedule item not found')

    return this.payments.createOrder({ bookingId, scheduleItemId, amount: Number(item.amount) * 1.05 })
  }

  async verifyPayment(data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    await this.payments.verifyAndCapture(data)
    return { success: true, message: 'Payment verified and recorded' }
  }

  // ─── Documents ────────────────────────────────────────────────────────────

  async getDocuments(userId: string, bookingId?: string) {
    const bookingIds = bookingId
      ? [bookingId]
      : (await this.prisma.booking.findMany({ where: { buyerId: userId }, select: { id: true } })).map((b) => b.id)

    return this.prisma.bookingDocument.findMany({
      where: { bookingId: { in: bookingIds }, isCustomerVisible: true },
      orderBy: { uploadedAt: 'desc' },
    })
  }

  async getDemandLetters(userId: string, bookingId?: string) {
    const where = bookingId
      ? { bookingId, booking: { buyerId: userId } }
      : { booking: { buyerId: userId } }

    return this.prisma.demandLetter.findMany({
      where,
      orderBy: { issuedAt: 'desc' },
      include: { scheduleItem: { select: { milestone: true, percentage: true } } },
    })
  }

  // ─── Construction Progress ────────────────────────────────────────────────

  async getConstructionUpdates(userId: string, bookingId: string, page = 1, limit = 20) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.buyerId !== userId) throw new ForbiddenException('Access denied')

    const [items, total] = await Promise.all([
      this.prisma.progressUpdate.findMany({
        where: { projectId: booking.projectId, isVisibleToBuyers: true },
        skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { postedBy: { select: { name: true, avatar: true } } },
      }),
      this.prisma.progressUpdate.count({
        where: { projectId: booking.projectId, isVisibleToBuyers: true },
      }),
    ])

    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getMilestones(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.buyerId !== userId) throw new ForbiddenException('Access denied')

    return this.prisma.milestone.findMany({
      where: { projectId: booking.projectId },
      orderBy: { plannedStartDate: 'asc' },
    })
  }

  // ─── Complaints ───────────────────────────────────────────────────────────

  async createComplaint(dto: CreateComplaintDto, user: RequestUser, files?: Express.Multer.File[]) {
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } })
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.buyerId !== user.id) throw new ForbiddenException('Access denied')

    let mediaUrls: string[] = []
    if (files?.length) {
      const results = await this.files.uploadMultiple(files, {
        folder: `complaints`, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'], maxSizeMB: 10,
      })
      mediaUrls = results.map((r) => r.url)
    }

    const seq = await this.prisma.complaint.count({ where: { bookingId: dto.bookingId } })
    const complaintNumber = `CMP-${booking.bookingNumber}-${String(seq + 1).padStart(3, '0')}`

    const slaHours: Record<string, number> = { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 4 }
    const slaDeadline = new Date(Date.now() + (slaHours[dto.priority] ?? 48) * 3600 * 1000)

    const complaint = await this.prisma.complaint.create({
      data: {
        complaintNumber, bookingId: dto.bookingId, raisedById: user.id,
        category: dto.category, subject: dto.subject, description: dto.description,
        priority: dto.priority, mediaUrls, slaDeadline,
      },
    })

    // Notify builder org
    const buildersInOrg = await this.prisma.user.findMany({
      where: { orgMemberships: { some: { orgId: booking.projectId } }, roles: { has: 'BUILDER' } },
      select: { id: true },
    })
    if (buildersInOrg.length > 0) {
      await this.notifications.createBulk(
        buildersInOrg.map((b) => b.id),
        {
          type: NotificationType.COMPLAINT_RAISED,
          title: `${dto.priority} complaint raised`,
          body: `${dto.subject} — ${complaintNumber}`,
          data: { complaintId: complaint.id },
        },
      )
    }

    return complaint
  }

  async getComplaints(userId: string, page = 1, limit = 20, status?: string) {
    const where = {
      booking: { buyerId: userId },
      ...(status && { status }),
    }
    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
        include: { updates: { orderBy: { createdAt: 'desc' }, where: { isInternal: false }, take: 1 } },
      }),
      this.prisma.complaint.count({ where }),
    ])
    return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getComplaintById(id: string, userId: string) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        updates: { where: { isInternal: false }, orderBy: { createdAt: 'asc' } },
        booking: { select: { buyerId: true, bookingNumber: true } },
      },
    })
    if (!complaint) throw new NotFoundException('Complaint not found')
    if (complaint.booking.buyerId !== userId) throw new ForbiddenException('Access denied')
    return complaint
  }

  async addComplaintUpdate(id: string, dto: AddComplaintUpdateDto, user: RequestUser) {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id }, include: { booking: { select: { buyerId: true } } },
    })
    if (!complaint) throw new NotFoundException('Complaint not found')

    return this.prisma.complaintUpdate.create({
      data: {
        complaintId: id, message: dto.message,
        updatedById: user.id, isInternal: dto.isInternal ?? false,
      },
    })
  }

  async updateComplaintStatus(id: string, dto: UpdateComplaintDto, user: RequestUser) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } })
    if (!complaint) throw new NotFoundException('Complaint not found')

    const updated = await this.prisma.complaint.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.resolutionNote && { resolutionNote: dto.resolutionNote }),
        ...(dto.assignedToId && { assignedToId: dto.assignedToId }),
        ...(dto.status === 'RESOLVED' && { resolvedAt: new Date() }),
      },
    })

    if (dto.status === 'RESOLVED') {
      await this.notifications.create({
        userId: complaint.raisedById,
        type: NotificationType.COMPLAINT_RESOLVED,
        title: 'Complaint resolved',
        body: `Your complaint "${complaint.subject}" has been resolved.`,
        data: { complaintId: id },
      })
    }

    return updated
  }

  // ─── Snag Items ───────────────────────────────────────────────────────────

  async createSnagItem(dto: CreateSnagItemDto, user: RequestUser) {
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } })
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.buyerId !== user.id) throw new ForbiddenException('Access denied')

    return this.prisma.snagItem.create({
      data: {
        bookingId: dto.bookingId, unit: dto.unit,
        description: dto.description, location: dto.location,
        beforePhoto: dto.beforePhoto,
      },
    })
  }

  async getSnagItems(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new NotFoundException('Booking not found')
    if (booking.buyerId !== userId) throw new ForbiddenException('Access denied')
    return this.prisma.snagItem.findMany({ where: { bookingId }, orderBy: { raisedAt: 'desc' } })
  }

  async updateSnagItem(id: string, dto: UpdateSnagItemDto) {
    return this.prisma.snagItem.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.afterPhoto && { afterPhoto: dto.afterPhoto }),
        ...(dto.status === 'FIXED' && { fixedAt: new Date() }),
      },
    })
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  async getNotifications(userId: string, page = 1, limit = 30) {
    const [items, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ])
    return { items, meta: { total, page, limit }, unreadCount }
  }

  async markNotificationRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId }, data: { isRead: true, readAt: new Date() },
    })
    return { success: true }
  }

  async markAllNotificationsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() },
    })
    return { success: true }
  }
}
