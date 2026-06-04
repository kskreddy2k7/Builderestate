"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const redis_service_1 = require("../../shared/cache/redis.service");
const notifications_service_1 = require("../../shared/notifications/notifications.service");
const client_1 = require("@prisma/client");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    config;
    redis;
    notifications;
    logger = new common_1.Logger(AuthService_1.name);
    SALT_ROUNDS = 12;
    RESET_TOKEN_TTL = 3600; // 1 hour
    VERIFY_TOKEN_TTL = 86400; // 24 hours
    constructor(prisma, jwtService, config, redis, notifications) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
        this.redis = redis;
        this.notifications = notifications;
    }
    // ─── Register ─────────────────────────────────────────────────────────────
    async register(dto) {
        const existing = await this.prisma.user.findFirst({
            where: { OR: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }] },
        });
        if (existing) {
            if (existing.email === dto.email.toLowerCase()) {
                throw new common_1.ConflictException('Email already registered');
            }
            throw new common_1.ConflictException('Phone number already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
        const emailVerifyToken = (0, uuid_1.v4)();
        const user = await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name: dto.name,
                    email: dto.email.toLowerCase(),
                    phone: dto.phone,
                    passwordHash,
                    roles: [dto.role],
                    emailVerifyToken,
                },
            });
            // Create org if needed
            if (dto.orgName) {
                const orgType = this.roleToOrgType(dto.role);
                const slug = `${dto.orgName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
                const org = await tx.organization.create({
                    data: {
                        name: dto.orgName,
                        slug,
                        type: orgType,
                        members: {
                            create: { userId: newUser.id, role: dto.role },
                        },
                    },
                });
                await tx.user.update({
                    where: { id: newUser.id },
                    data: { orgMemberships: { connect: { id: org.id } } },
                });
            }
            return tx.user.findUniqueOrThrow({
                where: { id: newUser.id },
                include: { orgMemberships: { include: { org: true } } },
            });
        });
        // Queue verification email
        await this.redis.set(this.redis.key('email-verify', emailVerifyToken), user.id, this.VERIFY_TOKEN_TTL);
        await this.notifications.queueEmail({
            to: user.email,
            subject: 'Verify your BuildEstate account',
            html: this.buildVerifyEmailHtml(user.name, emailVerifyToken),
        });
        const orgMembership = user.orgMemberships[0];
        return this.buildAuthResponse(user, orgMembership?.org?.name);
    }
    // ─── Login ────────────────────────────────────────────────────────────────
    async login(dto, ipAddress) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            include: { orgMemberships: { include: { org: true } } },
        });
        if (!user?.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid)
            throw new common_1.UnauthorizedException('Invalid email or password');
        if (user.status === client_1.UserStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Your account has been suspended');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const orgMembership = user.orgMemberships[0];
        const response = await this.buildAuthResponse(user, orgMembership?.org?.name);
        // Store refresh token
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: response.tokens.refreshToken,
                ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return response;
    }
    // ─── Google OAuth ─────────────────────────────────────────────────────────
    async googleLogin(googleUser) {
        let user = await this.prisma.user.findUnique({
            where: { email: googleUser.email.toLowerCase() },
            include: { orgMemberships: { include: { org: true } } },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    name: googleUser.name,
                    email: googleUser.email.toLowerCase(),
                    phone: '',
                    avatar: googleUser.avatar,
                    isEmailVerified: true,
                    status: client_1.UserStatus.ACTIVE,
                    roles: [client_1.UserRole.BUYER],
                },
                include: { orgMemberships: { include: { org: true } } },
            });
        }
        return this.buildAuthResponse(user, user.orgMemberships[0]?.org?.name);
    }
    // ─── Refresh Token ────────────────────────────────────────────────────────
    async refresh(dto) {
        const stored = await this.prisma.refreshToken.findUnique({
            where: { token: dto.refreshToken },
            include: { user: { include: { orgMemberships: true } } },
        });
        if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token is invalid or expired');
        }
        // Rotate refresh token
        const newRefreshToken = (0, uuid_1.v4)();
        await this.prisma.refreshToken.update({
            where: { id: stored.id },
            data: { revokedAt: new Date() },
        });
        await this.prisma.refreshToken.create({
            data: {
                userId: stored.userId,
                token: newRefreshToken,
                ipAddress: stored.ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        const orgId = stored.user.orgMemberships[0]?.orgId;
        const sessionId = (0, uuid_1.v4)();
        const accessToken = this.signAccessToken(stored.user, orgId, sessionId);
        return { accessToken, refreshToken: newRefreshToken, expiresIn: 900 };
    }
    // ─── Logout ───────────────────────────────────────────────────────────────
    async logout(user, refreshToken) {
        // Revoke session
        await this.redis.sadd(this.redis.key('revoked-sessions'), user.sessionId);
        await this.redis.expire(this.redis.key('revoked-sessions'), 900);
        if (refreshToken) {
            await this.prisma.refreshToken.updateMany({
                where: { token: refreshToken, userId: user.id },
                data: { revokedAt: new Date() },
            });
        }
    }
    // ─── Password Reset ───────────────────────────────────────────────────────
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        // Always return success to prevent email enumeration
        if (!user)
            return;
        const token = (0, uuid_1.v4)();
        await this.redis.set(this.redis.key('password-reset', token), user.id, this.RESET_TOKEN_TTL);
        const resetUrl = `${this.config.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;
        await this.notifications.queueEmail({
            to: user.email,
            subject: 'Reset your BuildEstate password',
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
        });
    }
    async resetPassword(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const userId = await this.redis.get(this.redis.key('password-reset', dto.token));
        if (!userId)
            throw new common_1.BadRequestException('Reset token is invalid or expired');
        const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        await this.redis.del(this.redis.key('password-reset', dto.token));
        // Revoke all existing refresh tokens
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
        if (!user.passwordHash)
            throw new common_1.BadRequestException('Cannot change password for OAuth accounts');
        const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        const passwordHash = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    }
    // ─── Email Verification ───────────────────────────────────────────────────
    async verifyEmail(token) {
        const userId = await this.redis.get(this.redis.key('email-verify', token));
        if (!userId)
            throw new common_1.BadRequestException('Verification link is invalid or expired');
        await this.prisma.user.update({
            where: { id: userId },
            data: { isEmailVerified: true, status: client_1.UserStatus.ACTIVE, emailVerifyToken: null },
        });
        await this.redis.del(this.redis.key('email-verify', token));
    }
    // ─── Helpers ──────────────────────────────────────────────────────────────
    signAccessToken(user, orgId, sessionId) {
        return this.jwtService.sign({
            sub: user.id,
            email: user.email,
            roles: user.roles,
            orgId,
            sessionId,
        });
    }
    async buildAuthResponse(user, orgName) {
        const orgId = user.orgMemberships?.[0]?.orgId;
        const sessionId = (0, uuid_1.v4)();
        const accessToken = this.signAccessToken(user, orgId, sessionId);
        const refreshToken = (0, uuid_1.v4)();
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                roles: user.roles,
                orgId,
                orgName,
                avatar: user.avatar ?? undefined,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
            },
            tokens: {
                accessToken,
                refreshToken,
                expiresIn: 900,
            },
        };
    }
    roleToOrgType(role) {
        const map = {
            [client_1.UserRole.BUILDER]: 'BUILDER',
            [client_1.UserRole.BROKER]: 'BROKERAGE',
            [client_1.UserRole.AGENT]: 'BROKERAGE',
            [client_1.UserRole.CONTRACTOR]: 'CONTRACTOR',
            [client_1.UserRole.SUPPLIER]: 'SUPPLIER',
        };
        return map[role] ?? 'INDIVIDUAL';
    }
    buildVerifyEmailHtml(name, token) {
        const url = `${this.config.get('FRONTEND_URL')}/auth/verify-email?token=${token}`;
        return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to BuildEstate, ${name}!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#0c93ea;color:white;border-radius:6px;text-decoration:none;">
          Verify Email
        </a>
        <p style="color:#666;font-size:12px;margin-top:16px;">Link expires in 24 hours.</p>
      </div>
    `;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map