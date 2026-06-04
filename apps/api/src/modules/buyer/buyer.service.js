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
var BuyerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const redis_service_1 = require("../../shared/cache/redis.service");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const files_service_1 = require("../../shared/files/files.service");
const payments_service_1 = require("../../shared/payments/payments.service");
const client_1 = require("@prisma/client");
let BuyerService = BuyerService_1 = class BuyerService {
    prisma;
    redis;
    notifications;
    files;
    payments;
    logger = new common_1.Logger(BuyerService_1.name);
    constructor(prisma, redis, notifications, files, payments) {
        this.prisma = prisma;
        this.redis = redis;
        this.notifications = notifications;
        this.files = files;
        this.payments = payments;
    }
    // ─── Dashboard ────────────────────────────────────────────────────────────
    async getDashboard(userId) {
        const cacheKey = this.redis.key('buyer', userId, 'dashboard');
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
            });
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
            ]);
            return {
                bookings,
                stats: {
                    totalBookings: bookings.length,
                    totalPaid: Number(totalPaid._sum.totalAmount ?? 0),
                    pendingPayments,
                    openComplaints,
                },
            };
        }, 120);
    }
    // ─── Bookings ─────────────────────────────────────────────────────────────
    async getMyBookings(userId, page = 1, limit = 10) {
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
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getBookingDetail(id, userId) {
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
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.buyerId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return booking;
    }
    // ─── Payments ─────────────────────────────────────────────────────────────
    async getPaymentSummary(userId, bookingId) {
        const where = bookingId
            ? { id: bookingId, buyerId: userId }
            : { buyerId: userId };
        const bookings = await this.prisma.booking.findMany({
            where,
            include: {
                paymentSchedule: { orderBy: { dueDate: 'asc' } },
                payments: { where: { status: 'COMPLETED' }, orderBy: { paidAt: 'desc' } },
                unit: { select: { unitNumber: true, bhkType: true } },
            },
        });
        return bookings.map((booking) => {
            const paid = booking.payments.reduce((sum, p) => sum + Number(p.totalAmount), 0);
            const total = Number(booking.finalAmount);
            const overdue = booking.paymentSchedule.filter((s) => s.status !== 'PAID' && new Date(s.dueDate) < new Date());
            return {
                bookingId: booking.id, bookingNumber: booking.bookingNumber,
                unit: booking.unit,
                totalAmount: total, paid, balance: total - paid,
                collectionPercentage: total > 0 ? Math.round((paid / total) * 100) : 0,
                overdueCount: overdue.length,
                overdueAmount: overdue.reduce((sum, s) => sum + Number(s.amount), 0),
                schedule: booking.paymentSchedule,
                recentPayments: booking.payments.slice(0, 5),
            };
        });
    }
    async initiatePayment(bookingId, scheduleItemId, userId) {
        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.buyerId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        const item = await this.prisma.paymentScheduleItem.findUnique({ where: { id: scheduleItemId } });
        if (!item)
            throw new common_1.NotFoundException('Payment schedule item not found');
        return this.payments.createOrder({ bookingId, scheduleItemId, amount: Number(item.amount) * 1.05 });
    }
    async verifyPayment(data) {
        await this.payments.verifyAndCapture(data);
        return { success: true, message: 'Payment verified and recorded' };
    }
    // ─── Documents ────────────────────────────────────────────────────────────
    async getDocuments(userId, bookingId) {
        const bookingIds = bookingId
            ? [bookingId]
            : (await this.prisma.booking.findMany({ where: { buyerId: userId }, select: { id: true } })).map((b) => b.id);
        return this.prisma.bookingDocument.findMany({
            where: { bookingId: { in: bookingIds }, isCustomerVisible: true },
            orderBy: { uploadedAt: 'desc' },
        });
    }
    async getDemandLetters(userId, bookingId) {
        const where = bookingId
            ? { bookingId, booking: { buyerId: userId } }
            : { booking: { buyerId: userId } };
        return this.prisma.demandLetter.findMany({
            where,
            orderBy: { issuedAt: 'desc' },
            include: { scheduleItem: { select: { milestone: true, percentage: true } } },
        });
    }
    // ─── Construction Progress ────────────────────────────────────────────────
    async getConstructionUpdates(userId, bookingId, page = 1, limit = 20) {
        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.buyerId !== userId)
            throw new common_1.ForbiddenException('Access denied');
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
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getMilestones(userId, bookingId) {
        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.buyerId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return this.prisma.milestone.findMany({
            where: { projectId: booking.projectId },
            orderBy: { plannedStartDate: 'asc' },
        });
    }
    // ─── Complaints ───────────────────────────────────────────────────────────
    async createComplaint(dto, user, files) {
        const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.buyerId !== user.id)
            throw new common_1.ForbiddenException('Access denied');
        let mediaUrls = [];
        if (files?.length) {
            const results = await this.files.uploadMultiple(files, {
                folder: `complaints`, allowedTypes: ['image/jpeg', 'image/png', 'image/webp'], maxSizeMB: 10,
            });
            mediaUrls = results.map((r) => r.url);
        }
        const seq = await this.prisma.complaint.count({ where: { bookingId: dto.bookingId } });
        const complaintNumber = `CMP-${booking.bookingNumber}-${String(seq + 1).padStart(3, '0')}`;
        const slaHours = { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 4 };
        const slaDeadline = new Date(Date.now() + (slaHours[dto.priority] ?? 48) * 3600 * 1000);
        const complaint = await this.prisma.complaint.create({
            data: {
                complaintNumber, bookingId: dto.bookingId, raisedById: user.id,
                category: dto.category, subject: dto.subject, description: dto.description,
                priority: dto.priority, mediaUrls, slaDeadline,
            },
        });
        // Notify builder org
        const buildersInOrg = await this.prisma.user.findMany({
            where: { orgMemberships: { some: { orgId: booking.projectId } }, roles: { has: 'BUILDER' } },
            select: { id: true },
        });
        if (buildersInOrg.length > 0) {
            await this.notifications.createBulk(buildersInOrg.map((b) => b.id), {
                type: client_1.NotificationType.COMPLAINT_RAISED,
                title: `${dto.priority} complaint raised`,
                body: `${dto.subject} — ${complaintNumber}`,
                data: { complaintId: complaint.id },
            });
        }
        return complaint;
    }
    async getComplaints(userId, page = 1, limit = 20, status) {
        const where = {
            booking: { buyerId: userId },
            ...(status && { status }),
        };
        const [items, total] = await Promise.all([
            this.prisma.complaint.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
                include: { updates: { orderBy: { createdAt: 'desc' }, where: { isInternal: false }, take: 1 } },
            }),
            this.prisma.complaint.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getComplaintById(id, userId) {
        const complaint = await this.prisma.complaint.findUnique({
            where: { id },
            include: {
                updates: { where: { isInternal: false }, orderBy: { createdAt: 'asc' } },
                booking: { select: { buyerId: true, bookingNumber: true } },
            },
        });
        if (!complaint)
            throw new common_1.NotFoundException('Complaint not found');
        if (complaint.booking.buyerId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return complaint;
    }
    async addComplaintUpdate(id, dto, user) {
        const complaint = await this.prisma.complaint.findUnique({
            where: { id }, include: { booking: { select: { buyerId: true } } },
        });
        if (!complaint)
            throw new common_1.NotFoundException('Complaint not found');
        return this.prisma.complaintUpdate.create({
            data: {
                complaintId: id, message: dto.message,
                updatedById: user.id, isInternal: dto.isInternal ?? false,
            },
        });
    }
    async updateComplaintStatus(id, dto, user) {
        const complaint = await this.prisma.complaint.findUnique({ where: { id } });
        if (!complaint)
            throw new common_1.NotFoundException('Complaint not found');
        const updated = await this.prisma.complaint.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.resolutionNote && { resolutionNote: dto.resolutionNote }),
                ...(dto.assignedToId && { assignedToId: dto.assignedToId }),
                ...(dto.status === 'RESOLVED' && { resolvedAt: new Date() }),
            },
        });
        if (dto.status === 'RESOLVED') {
            await this.notifications.create({
                userId: complaint.raisedById,
                type: client_1.NotificationType.COMPLAINT_RESOLVED,
                title: 'Complaint resolved',
                body: `Your complaint "${complaint.subject}" has been resolved.`,
                data: { complaintId: id },
            });
        }
        return updated;
    }
    // ─── Snag Items ───────────────────────────────────────────────────────────
    async createSnagItem(dto, user) {
        const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.buyerId !== user.id)
            throw new common_1.ForbiddenException('Access denied');
        return this.prisma.snagItem.create({
            data: {
                bookingId: dto.bookingId, unit: dto.unit,
                description: dto.description, location: dto.location,
                beforePhoto: dto.beforePhoto,
            },
        });
    }
    async getSnagItems(bookingId, userId) {
        const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.buyerId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return this.prisma.snagItem.findMany({ where: { bookingId }, orderBy: { raisedAt: 'desc' } });
    }
    async updateSnagItem(id, dto) {
        return this.prisma.snagItem.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.afterPhoto && { afterPhoto: dto.afterPhoto }),
                ...(dto.status === 'FIXED' && { fixedAt: new Date() }),
            },
        });
    }
    // ─── Notifications ────────────────────────────────────────────────────────
    async getNotifications(userId, page = 1, limit = 30) {
        const [items, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return { items, meta: { total, page, limit }, unreadCount };
    }
    async markNotificationRead(id, userId) {
        await this.prisma.notification.updateMany({
            where: { id, userId }, data: { isRead: true, readAt: new Date() },
        });
        return { success: true };
    }
    async markAllNotificationsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false }, data: { isRead: true, readAt: new Date() },
        });
        return { success: true };
    }
};
exports.BuyerService = BuyerService;
exports.BuyerService = BuyerService = BuyerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        notifications_service_1.NotificationsService,
        files_service_1.FilesService,
        payments_service_1.PaymentsService])
], BuyerService);
//# sourceMappingURL=buyer.service.js.map