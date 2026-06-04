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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const redis_service_1 = require("../../shared/cache/redis.service");
const client_1 = require("@prisma/client");
let AdminService = AdminService_1 = class AdminService {
    prisma;
    redis;
    logger = new common_1.Logger(AdminService_1.name);
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    // ─── Platform Analytics ───────────────────────────────────────────────────
    async getPlatformStats() {
        return this.redis.cached(this.redis.key('admin:stats'), async () => {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const [totalUsers, activeUsers, newUsersThisMonth, totalProperties, activeProperties, pendingVerifications, totalProjects, activeProjects, bookingsThisMonth, bookingsValue, totalPayments, paymentsThisMonth, openComplaints, openNCRs,] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.user.count({ where: { status: client_1.UserStatus.ACTIVE } }),
                this.prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
                this.prisma.property.count({ where: { deletedAt: null } }),
                this.prisma.property.count({ where: { status: client_1.PropertyStatus.ACTIVE } }),
                this.prisma.property.count({ where: { status: client_1.PropertyStatus.UNDER_REVIEW } }),
                this.prisma.project.count(),
                this.prisma.project.count({ where: { status: { in: ['UNDER_CONSTRUCTION', 'APPROVED'] } } }),
                this.prisma.booking.count({ where: { createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } } }),
                this.prisma.booking.aggregate({
                    where: { status: { not: 'CANCELLED' } }, _sum: { finalAmount: true },
                }),
                this.prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { totalAmount: true } }),
                this.prisma.payment.aggregate({
                    where: { status: 'COMPLETED', paidAt: { gte: monthStart } }, _sum: { totalAmount: true },
                }),
                this.prisma.complaint.count({ where: { status: { not: 'CLOSED' } } }),
                this.prisma.nCReport.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } } }),
            ]);
            return {
                users: { total: totalUsers, active: activeUsers, newThisMonth: newUsersThisMonth },
                properties: { total: totalProperties, active: activeProperties, pendingVerifications },
                projects: { total: totalProjects, active: activeProjects },
                bookings: { thisMonth: bookingsThisMonth, totalValue: Number(bookingsValue._sum.finalAmount ?? 0) },
                payments: { totalCollected: Number(totalPayments._sum.totalAmount ?? 0), thisMonth: Number(paymentsThisMonth._sum.totalAmount ?? 0) },
                operations: { openComplaints, openNCRs },
            };
        }, 300);
    }
    // ─── User Management ──────────────────────────────────────────────────────
    async getUsers(page = 1, limit = 20, filters = {}) {
        const where = {
            ...(filters.search && {
                OR: [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { email: { contains: filters.search, mode: 'insensitive' } },
                    { phone: { contains: filters.search } },
                ],
            }),
            ...(filters.status && { status: filters.status }),
            ...(filters.role && { roles: { has: filters.role } }),
        };
        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
                include: {
                    orgMemberships: { include: { org: { select: { id: true, name: true, type: true } } } },
                },
                omit: { passwordHash: true, emailVerifyToken: true, phoneOtp: true },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getUserById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                orgMemberships: { include: { org: true } },
                _count: { select: { notifications: true } },
            },
            omit: { passwordHash: true, emailVerifyToken: true, phoneOtp: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateUserStatus(id, status, reason) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.user.update({ where: { id }, data: { status } });
    }
    // ─── Property Verification Queue ─────────────────────────────────────────
    async getVerificationQueue(page = 1, limit = 20, type) {
        const results = {};
        if (!type || type === 'property') {
            const [items, total] = await Promise.all([
                this.prisma.property.findMany({
                    where: { status: client_1.PropertyStatus.UNDER_REVIEW, deletedAt: null },
                    skip: (page - 1) * limit, take: limit, orderBy: { updatedAt: 'asc' },
                    include: {
                        listedBy: { select: { name: true, email: true, phone: true } },
                        org: { select: { name: true, reraNumber: true } },
                        media: { where: { isPrimary: true }, take: 1 },
                    },
                }),
                this.prisma.property.count({ where: { status: client_1.PropertyStatus.UNDER_REVIEW } }),
            ]);
            results['properties'] = { items, meta: { total, page, limit } };
        }
        if (!type || type === 'org') {
            const [items, total] = await Promise.all([
                this.prisma.organization.findMany({
                    where: { verificationStatus: client_1.VerificationStatus.PENDING },
                    skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'asc' },
                }),
                this.prisma.organization.count({ where: { verificationStatus: client_1.VerificationStatus.PENDING } }),
            ]);
            results['orgs'] = { items, meta: { total, page, limit } };
        }
        return results;
    }
    // ─── Audit Logs ───────────────────────────────────────────────────────────
    async getAuditLogs(page = 1, limit = 50, filters = {}) {
        const where = {
            ...(filters.userId && { userId: filters.userId }),
            ...(filters.resource && { resource: filters.resource }),
            ...(filters.from && { createdAt: { gte: new Date(filters.from) } }),
            ...(filters.to && { createdAt: { lte: new Date(filters.to) } }),
        };
        const [items, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true, email: true } } },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    // ─── Organisation Verification ────────────────────────────────────────────
    async verifyOrganization(id, decision, adminId, reason) {
        const org = await this.prisma.organization.findUnique({ where: { id } });
        if (!org)
            throw new common_1.NotFoundException('Organisation not found');
        return this.prisma.organization.update({
            where: { id },
            data: {
                verificationStatus: decision === 'VERIFIED' ? client_1.VerificationStatus.VERIFIED : client_1.VerificationStatus.REJECTED,
                ...(decision === 'VERIFIED' && { verifiedAt: new Date(), verifiedBy: adminId }),
            },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], AdminService);
//# sourceMappingURL=admin.service.js.map