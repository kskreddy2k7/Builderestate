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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const client_1 = require("@prisma/client");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    config;
    notifications;
    logger = new common_1.Logger(PaymentsService_1.name);
    razorpay;
    constructor(prisma, config, notifications) {
        this.prisma = prisma;
        this.config = config;
        this.notifications = notifications;
        this.razorpay = new razorpay_1.default({
            key_id: this.config.get('RAZORPAY_KEY_ID', ''),
            key_secret: this.config.get('RAZORPAY_KEY_SECRET', ''),
        });
    }
    async createOrder(options) {
        const scheduleItem = await this.prisma.paymentScheduleItem.findUnique({
            where: { id: options.scheduleItemId },
            include: { booking: { include: { buyer: true } } },
        });
        if (!scheduleItem)
            throw new common_1.BadRequestException('Payment schedule item not found');
        if (scheduleItem.status === 'PAID')
            throw new common_1.BadRequestException('This instalment is already paid');
        const order = await this.razorpay.orders.create({
            amount: Math.round(options.amount * 100), // paise
            currency: options.currency ?? 'INR',
            notes: {
                bookingId: options.bookingId,
                scheduleItemId: options.scheduleItemId,
                ...options.notes,
            },
        });
        // Create pending payment record
        await this.prisma.payment.create({
            data: {
                paymentNumber: `PAY${Date.now().toString(36).toUpperCase()}`,
                bookingId: options.bookingId,
                scheduleItemId: options.scheduleItemId,
                amount: scheduleItem.amount,
                gstAmount: scheduleItem.amount * 0.18,
                totalAmount: options.amount,
                status: client_1.PaymentStatus.PENDING,
                method: client_1.PaymentMethod.ONLINE,
                gatewayOrderId: order.id,
            },
        });
        return {
            orderId: order.id,
            amount: Number(order.amount),
            currency: order.currency,
            keyId: this.config.get('RAZORPAY_KEY_ID', ''),
        };
    }
    async verifyAndCapture(options) {
        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', this.config.get('RAZORPAY_KEY_SECRET', ''))
            .update(`${options.razorpayOrderId}|${options.razorpayPaymentId}`)
            .digest('hex');
        if (expectedSignature !== options.razorpaySignature) {
            throw new common_1.BadRequestException('Invalid payment signature');
        }
        const payment = await this.prisma.payment.findFirst({
            where: { gatewayOrderId: options.razorpayOrderId },
            include: { booking: { include: { buyer: true } }, scheduleItem: true },
        });
        if (!payment)
            throw new common_1.BadRequestException('Payment record not found');
        // Update payment status
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: client_1.PaymentStatus.COMPLETED,
                gatewayPaymentId: options.razorpayPaymentId,
                gatewaySignature: options.razorpaySignature,
                paidAt: new Date(),
            },
        });
        // Update schedule item
        await this.prisma.paymentScheduleItem.update({
            where: { id: payment.scheduleItemId },
            data: {
                status: 'PAID',
                paidDate: new Date(),
                paidAmount: payment.totalAmount,
            },
        });
        // Notify buyer
        await this.notifications.create({
            userId: payment.booking.buyerId,
            type: client_1.NotificationType.PAYMENT_RECEIVED,
            title: 'Payment confirmed',
            body: `Your payment of ₹${payment.totalAmount.toLocaleString('en-IN')} has been received.`,
            data: { paymentId: payment.id, bookingId: payment.bookingId },
            sendEmail: true,
            emailOptions: {
                subject: 'Payment confirmation — BuildEstate',
                html: `<p>Dear ${payment.booking.buyer.name},</p>
               <p>We have received your payment of <strong>₹${payment.totalAmount.toLocaleString('en-IN')}</strong>.</p>
               <p>Payment Reference: ${options.razorpayPaymentId}</p>`,
            },
        });
    }
    async handleWebhook(rawBody, signature) {
        const webhookSecret = this.config.get('RAZORPAY_WEBHOOK_SECRET', '');
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');
        if (expectedSignature !== signature) {
            this.logger.warn('Invalid webhook signature');
            return;
        }
        const payload = JSON.parse(rawBody);
        this.logger.log(`Razorpay webhook: ${payload.event}`);
        if (payload.event === 'payment.failed') {
            const orderId = payload.payload.payment?.entity?.order_id;
            if (orderId) {
                await this.prisma.payment.updateMany({
                    where: { gatewayOrderId: orderId },
                    data: { status: client_1.PaymentStatus.FAILED },
                });
            }
        }
    }
    async getPublicKey() {
        return this.config.get('RAZORPAY_KEY_ID', '');
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map