import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export interface CreateOrderOptions {
    bookingId: string;
    scheduleItemId: string;
    amount: number;
    currency?: string;
    notes?: Record<string, string>;
}
export interface VerifyPaymentOptions {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}
export declare class PaymentsService {
    private readonly prisma;
    private readonly config;
    private readonly notifications;
    private readonly logger;
    private readonly razorpay;
    constructor(prisma: PrismaService, config: ConfigService, notifications: NotificationsService);
    createOrder(options: CreateOrderOptions): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
    }>;
    verifyAndCapture(options: VerifyPaymentOptions): Promise<void>;
    handleWebhook(rawBody: string, signature: string): Promise<void>;
    getPublicKey(): Promise<string>;
}
//# sourceMappingURL=payments.service.d.ts.map