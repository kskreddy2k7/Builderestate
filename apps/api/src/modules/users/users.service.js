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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const redis_service_1 = require("../../shared/cache/redis.service");
const files_service_1 = require("../../shared/files/files.service");
let UsersService = class UsersService {
    prisma;
    redis;
    files;
    constructor(prisma, redis, files) {
        this.prisma = prisma;
        this.redis = redis;
        this.files = files;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { orgMemberships: { include: { org: true } } },
            omit: { passwordHash: true, emailVerifyToken: true, phoneOtp: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateProfile(userId, data) {
        if (data.phone) {
            const existing = await this.prisma.user.findFirst({
                where: { phone: data.phone, id: { not: userId } },
            });
            if (existing)
                throw new common_1.ConflictException('Phone number already in use');
        }
        return this.prisma.user.update({
            where: { id: userId },
            data: { ...(data.name && { name: data.name }), ...(data.phone && { phone: data.phone }) },
            omit: { passwordHash: true, emailVerifyToken: true, phoneOtp: true },
        });
    }
    async uploadAvatar(userId, file) {
        const result = await this.files.uploadFile(file, {
            folder: `avatars/${userId}`,
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
            maxSizeMB: 5,
            resize: { width: 400, height: 400, fit: 'cover' },
        });
        return this.prisma.user.update({
            where: { id: userId },
            data: { avatar: result.url },
            select: { id: true, avatar: true },
        });
    }
    async getOrganisation(orgId) {
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
            include: {
                members: { include: { user: { select: { id: true, name: true, email: true, avatar: true, roles: true } } } },
            },
        });
        if (!org)
            throw new common_1.NotFoundException('Organisation not found');
        return org;
    }
    async getNotifications(userId, page = 1, limit = 30) {
        const [items, total, unread] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);
        return { items, meta: { total, page, limit }, unreadCount: unread };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService,
        files_service_1.FilesService])
], UsersService);
//# sourceMappingURL=users.service.js.map