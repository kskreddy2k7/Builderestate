import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import type { NotificationType } from '@prisma/client';
export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    attachments?: {
        filename: string;
        content: Buffer | string;
    }[];
}
export interface SendSmsOptions {
    to: string;
    body: string;
}
export interface CreateNotificationOptions {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sendEmail?: boolean;
    emailOptions?: Omit<SendEmailOptions, 'to'>;
    sendSms?: boolean;
    smsBody?: string;
}
export declare class NotificationsService {
    private readonly prisma;
    private readonly config;
    private readonly notificationQueue;
    private readonly logger;
    private transporter;
    constructor(prisma: PrismaService, config: ConfigService, notificationQueue: Queue);
    private initEmailTransport;
    create(options: CreateNotificationOptions): Promise<void>;
    createBulk(userIds: string[], notification: Omit<CreateNotificationOptions, 'userId'>): Promise<void>;
    markRead(notificationId: string, userId: string): Promise<void>;
    markAllRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    queueEmail(options: SendEmailOptions): Promise<void>;
    sendEmail(options: SendEmailOptions): Promise<void>;
    queueSms(options: SendSmsOptions): Promise<void>;
    sendSms(options: SendSmsOptions): Promise<void>;
}
//# sourceMappingURL=notifications.service.d.ts.map