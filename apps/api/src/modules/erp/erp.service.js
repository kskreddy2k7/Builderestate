"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ErpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const redis_service_1 = require("../../shared/cache/redis.service");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const payments_service_1 = require("../../shared/payments/payments.service");
const client_1 = require("@prisma/client");
let ErpService = ErpService_1 = class ErpService {
    prisma;
    redis;
    notifications;
    payments;
    logger = new common_1.Logger(ErpService_1.name);
    constructor(prisma, redis, notifications, payments) {
        this.prisma = prisma;
        this.redis = redis;
        this.notifications = notifications;
        this.payments = payments;
    }
    // ─── Bookings ─────────────────────────────────────────────────────────────
    async createBooking(dto, user) {
        const unit = await this.prisma.unit.findUnique({ where: { id: dto.unitId }, include: { floor: { include: { tower: true } } } });
        if (!unit)
            throw new common_1.NotFoundException('Unit not found');
        if (unit.status !== client_1.UnitStatus.AVAILABLE)
            throw new common_1.BadRequestException(`Unit is ${unit.status.toLowerCase()}, not available`);
        const bookingNumber = `BK${new Date().getFullYear().toString().slice(2)}${Math.floor(100000 + Math.random() * 900000)}`;
        const gstRate = 0.05;
        const baseAmount = Number(unit.finalPrice ?? unit.basePrice);
        const gstAmount = baseAmount * gstRate;
        const discountAmount = dto.discountAmount ?? 0;
        const finalAmount = baseAmount + gstAmount - discountAmount;
        const booking = await this.prisma.$transaction(async (tx) => {
            // Mark unit as booked
            await tx.unit.update({ where: { id: dto.unitId }, data: { status: client_1.UnitStatus.BOOKED } });
            const newBooking = await tx.booking.create({
                data: {
                    bookingNumber, unitId: dto.unitId,
                    projectId: unit.floor.tower.projectId,
                    buyerId: dto.buyerId, brokerId: dto.brokerId, agentId: dto.agentId,
                    totalAmount: baseAmount, discountAmount, gstAmount, finalAmount,
                    bookingAmount: dto.bookingAmount,
                    bookingDate: dto.bookingDate ? new Date(dto.bookingDate) : new Date(),
                    status: client_1.BookingStatus.CONFIRMED,
                    remarks: dto.remarks,
                },
            });
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
                });
            }
            return newBooking;
        });
        await this.notifications.create({
            userId: dto.buyerId,
            type: client_1.NotificationType.BOOKING_CONFIRMED,
            title: 'Booking confirmed!',
            body: `Your booking for Unit ${unit.unitNumber} has been confirmed. Booking No: ${bookingNumber}`,
            data: { bookingId: booking.id, unitId: dto.unitId },
            sendEmail: true,
            emailOptions: {
                subject: `Booking Confirmation — ${bookingNumber}`,
                html: `<p>Your booking has been confirmed.</p><p><strong>Booking No:</strong> ${bookingNumber}</p><p><strong>Unit:</strong> ${unit.unitNumber}</p><p><strong>Amount:</strong> ₹${finalAmount.toLocaleString('en-IN')}</p>`,
            },
        });
        await this.redis.del(this.redis.key('project', unit.floor.tower.projectId, 'inventory'));
        return this.getBookingById(booking.id);
    }
    async getBookings(orgId, filters = {}) {
        const { page = 1, limit = 20, status, projectId } = filters;
        const where = {
            unit: { floor: { tower: { project: { orgId } } } },
            ...(status && { status }),
            ...(projectId && { projectId }),
        };
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
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getBookingById(id) {
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
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
    async updateBookingStatus(id, dto) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return this.prisma.booking.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.agreementDate && { agreementDate: new Date(dto.agreementDate) }),
                ...(dto.registrationDate && { registrationDate: new Date(dto.registrationDate) }),
                ...(dto.remarks && { remarks: dto.remarks }),
            },
        });
    }
    async cancelBooking(id, dto) {
        const booking = await this.prisma.booking.findUnique({ where: { id } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.status === client_1.BookingStatus.CANCELLED)
            throw new common_1.BadRequestException('Already cancelled');
        await this.prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id },
                data: { status: client_1.BookingStatus.CANCELLED, cancelledAt: new Date(), cancellationReason: dto.reason },
            });
            await tx.unit.update({ where: { id: booking.unitId }, data: { status: client_1.UnitStatus.AVAILABLE } });
        });
        await this.notifications.create({
            userId: booking.buyerId,
            type: client_1.NotificationType.BOOKING_CONFIRMED,
            title: 'Booking cancelled',
            body: `Your booking ${booking.bookingNumber} has been cancelled.`,
            data: { bookingId: id },
        });
        return { message: 'Booking cancelled' };
    }
    // ─── Payments ─────────────────────────────────────────────────────────────
    async createPaymentOrder(dto) {
        const item = await this.prisma.paymentScheduleItem.findUnique({ where: { id: dto.scheduleItemId } });
        if (!item)
            throw new common_1.NotFoundException('Payment schedule item not found');
        if (item.status === 'PAID')
            throw new common_1.BadRequestException('Already paid');
        return this.payments.createOrder({
            bookingId: dto.bookingId,
            scheduleItemId: dto.scheduleItemId,
            amount: Number(item.amount),
        });
    }
    async verifyPayment(dto) {
        await this.payments.verifyAndCapture(dto);
        return { message: 'Payment verified and captured' };
    }
    async recordOfflinePayment(dto, user) {
        const item = await this.prisma.paymentScheduleItem.findUnique({ where: { id: dto.scheduleItemId } });
        if (!item)
            throw new common_1.NotFoundException('Schedule item not found');
        const payment = await this.prisma.payment.create({
            data: {
                paymentNumber: `PAY${Date.now().toString(36).toUpperCase()}`,
                bookingId: dto.bookingId,
                scheduleItemId: dto.scheduleItemId,
                amount: dto.amount, gstAmount: dto.amount * 0.05,
                totalAmount: dto.amount,
                status: client_1.PaymentStatus.COMPLETED,
                method: dto.method,
                transactionRef: dto.transactionRef,
                chequeNumber: dto.chequeNumber, bankName: dto.bankName,
                paidAt: new Date(dto.paidAt),
            },
        });
        await this.prisma.paymentScheduleItem.update({
            where: { id: dto.scheduleItemId },
            data: { status: 'PAID', paidDate: new Date(dto.paidAt), paidAmount: dto.amount },
        });
        await this.notifications.create({
            userId: (await this.prisma.booking.findUnique({ where: { id: dto.bookingId }, select: { buyerId: true } })).buyerId,
            type: client_1.NotificationType.PAYMENT_RECEIVED,
            title: 'Payment recorded',
            body: `Offline payment of ₹${dto.amount.toLocaleString('en-IN')} has been recorded.`,
            data: { paymentId: payment.id },
        });
        return payment;
    }
    async getPaymentHistory(bookingId) {
        return this.prisma.payment.findMany({
            where: { bookingId },
            orderBy: { createdAt: 'desc' },
        });
    }
    // ─── Demand Letters ───────────────────────────────────────────────────────
    async issueDemandLetter(dto) {
        const item = await this.prisma.paymentScheduleItem.findUnique({
            where: { id: dto.scheduleItemId },
            include: { booking: { include: { buyer: true } } },
        });
        if (!item)
            throw new common_1.NotFoundException('Schedule item not found');
        const seq = await this.prisma.demandLetter.count({ where: { bookingId: dto.bookingId } });
        const letterNumber = `DL-${item.booking.bookingNumber}-${String(seq + 1).padStart(3, '0')}`;
        const gstAmount = Number(item.amount) * 0.05;
        const letter = await this.prisma.demandLetter.create({
            data: {
                bookingId: dto.bookingId, scheduleItemId: dto.scheduleItemId,
                letterNumber, amount: item.amount, gstAmount,
                totalAmount: Number(item.amount) + gstAmount,
                dueDate: new Date(dto.dueDate),
                status: 'ISSUED',
            },
        });
        await this.prisma.paymentScheduleItem.update({
            where: { id: dto.scheduleItemId },
            data: { status: 'DEMAND_RAISED', demandLetterDate: new Date() },
        });
        await this.notifications.create({
            userId: item.booking.buyerId,
            type: client_1.NotificationType.DEMAND_LETTER,
            title: 'Payment demand raised',
            body: `Demand letter ${letterNumber} for ₹${(Number(item.amount) + gstAmount).toLocaleString('en-IN')} has been issued. Due: ${new Date(dto.dueDate).toLocaleDateString('en-IN')}.`,
            data: { letterId: letter.id, bookingId: dto.bookingId },
            sendEmail: true,
            emailOptions: {
                subject: `Payment Demand — ${letterNumber}`,
                html: `<p>Dear ${item.booking.buyer.name},</p><p>A payment demand of <strong>₹${(Number(item.amount) + gstAmount).toLocaleString('en-IN')}</strong> has been raised.</p><p>Due Date: ${new Date(dto.dueDate).toLocaleDateString('en-IN')}</p>`,
            },
        });
        return letter;
    }
    // ─── Budget ───────────────────────────────────────────────────────────────
    async createBudget(projectId, dto) {
        const existing = await this.prisma.projectBudget.findUnique({ where: { projectId } });
        if (existing)
            throw new common_1.BadRequestException('Budget already exists for this project. Use update instead.');
        return this.prisma.projectBudget.create({
            data: {
                projectId, fiscalYear: dto.fiscalYear,
                totalBudget: dto.totalBudget, sanctionedBudget: dto.totalBudget,
                heads: dto.heads?.length ? {
                    create: dto.heads.map((h) => ({ name: h.name, category: h.category, allocatedAmount: h.allocatedAmount })),
                } : undefined,
            },
            include: { heads: true },
        });
    }
    async getBudget(projectId) {
        const budget = await this.prisma.projectBudget.findUnique({
            where: { projectId },
            include: {
                heads: { include: { expenditures: { orderBy: { createdAt: 'desc' }, take: 5 } } },
            },
        });
        if (!budget)
            throw new common_1.NotFoundException('No budget found for this project');
        const varianceHeads = budget.heads.map((h) => ({
            ...h,
            varianceAmount: Number(h.allocatedAmount) - Number(h.spentAmount),
            variancePercentage: Number(h.allocatedAmount) > 0
                ? ((Number(h.allocatedAmount) - Number(h.spentAmount)) / Number(h.allocatedAmount)) * 100
                : 0,
        }));
        return { ...budget, heads: varianceHeads };
    }
    async createExpenditure(projectId, dto, user) {
        const gstAmount = dto.gstAmount ?? 0;
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
            });
            await tx.budgetHead.update({
                where: { id: dto.budgetHeadId },
                data: { spentAmount: { increment: dto.amount + gstAmount } },
            });
            await tx.projectBudget.update({
                where: { projectId },
                data: { spentAmount: { increment: dto.amount + gstAmount } },
            });
            return expenditure;
        });
    }
    // ─── Financial Dashboard ──────────────────────────────────────────────────
    async getFinancialSummary(projectId) {
        const cacheKey = this.redis.key('project', projectId, 'finance');
        return this.redis.cached(cacheKey, async () => {
            const [bookings, payments, budget, overdue] = await Promise.all([
                this.prisma.booking.aggregate({
                    where: { projectId, status: { not: client_1.BookingStatus.CANCELLED } },
                    _count: { id: true }, _sum: { finalAmount: true },
                }),
                this.prisma.payment.aggregate({
                    where: { booking: { projectId }, status: client_1.PaymentStatus.COMPLETED },
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
            ]);
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
            };
        }, 180);
    }
    // ─── Unit Pricing ─────────────────────────────────────────────────────────
    async updateUnitPricing(unitId, dto) {
        const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
        if (!unit)
            throw new common_1.NotFoundException('Unit not found');
        const basePrice = dto.basePrice ?? Number(unit.basePrice);
        const floorRise = dto.floorRisePremium ?? Number(unit.floorRisePremium ?? 0);
        const facingPremium = dto.facingPremium ?? Number(unit.facingPremium ?? 0);
        return this.prisma.unit.update({
            where: { id: unitId },
            data: {
                basePrice, floorRisePremium: floorRise, facingPremium,
                finalPrice: basePrice + floorRise + facingPremium,
            },
        });
    }
};
exports.ErpService = ErpService;
exports.ErpService = ErpService = ErpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        notifications_service_1.NotificationsService,
        payments_service_1.PaymentsService])
], ErpService);
//# sourceMappingURL=erp.service.js.map