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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const nodemailer = __importStar(require("nodemailer"));
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    config;
    notificationQueue;
    logger = new common_1.Logger(NotificationsService_1.name);
    transporter = null;
    constructor(prisma, config, notificationQueue) {
        this.prisma = prisma;
        this.config = config;
        this.notificationQueue = notificationQueue;
        this.initEmailTransport();
    }
    initEmailTransport() {
        const region = this.config.get('SES_REGION', 'ap-south-1');
        const accessKeyId = this.config.get('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.config.get('AWS_SECRET_ACCESS_KEY');
        if (!accessKeyId || !secretAccessKey) {
            this.logger.warn('AWS credentials not configured — emails will be logged only');
            return;
        }
        this.transporter = nodemailer.createTransport({
            host: `email-smtp.${region}.amazonaws.com`,
            port: 587,
            secure: false,
            auth: { user: accessKeyId, pass: secretAccessKey },
        });
    }
    // ─── In-App Notification ──────────────────────────────────────────────────
    async create(options) {
        await this.prisma.notification.create({
            data: {
                userId: options.userId,
                type: options.type,
                title: options.title,
                body: options.body,
                data: options.data,
            },
        });
        if (options.sendEmail && options.emailOptions) {
            const user = await this.prisma.user.findUnique({
                where: { id: options.userId },
                select: { email: true },
            });
            if (user) {
                await this.queueEmail({ ...options.emailOptions, to: user.email });
            }
        }
        if (options.sendSms && options.smsBody) {
            const user = await this.prisma.user.findUnique({
                where: { id: options.userId },
                select: { phone: true },
            });
            if (user) {
                await this.queueSms({ to: user.phone, body: options.smsBody });
            }
        }
    }
    async createBulk(userIds, notification) {
        await this.prisma.notification.createMany({
            data: userIds.map((userId) => ({
                userId,
                type: notification.type,
                title: notification.title,
                body: notification.body,
                data: notification.data,
            })),
        });
    }
    async markRead(notificationId, userId) {
        await this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async markAllRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
    // ─── Email ────────────────────────────────────────────────────────────────
    async queueEmail(options) {
        await this.notificationQueue.add('send-email', options, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });
    }
    async sendEmail(options) {
        if (!this.transporter) {
            this.logger.debug(`[EMAIL] To: ${options.to} | Subject: ${options.subject}`);
            return;
        }
        try {
            await this.transporter.sendMail({
                from: `"${this.config.get('EMAIL_FROM_NAME', 'BuildEstate')}" <${this.config.get('EMAIL_FROM')}>`,
                to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
                attachments: options.attachments,
            });
        }
        catch (err) {
            this.logger.error('Failed to send email', err);
            throw err;
        }
    }
    // ─── SMS ─────────────────────────────────────────────────────────────────
    async queueSms(options) {
        await this.notificationQueue.add('send-sms', options, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 3000 },
        });
    }
    async sendSms(options) {
        const sid = this.config.get('TWILIO_ACCOUNT_SID');
        const token = this.config.get('TWILIO_AUTH_TOKEN');
        const from = this.config.get('TWILIO_PHONE_NUMBER');
        if (!sid || !token || !from) {
            this.logger.debug(`[SMS] To: ${options.to} | Body: ${options.body}`);
            return;
        }
        try {
            const twilio = (await Promise.resolve().then(() => __importStar(require('twilio')))).default;
            const client = twilio(sid, token);
            await client.messages.create({ body: options.body, from, to: options.to });
        }
        catch (err) {
            this.logger.error('Failed to send SMS', err);
            throw err;
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bull_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService, Object])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map