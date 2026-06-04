import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import { NotificationsService } from '@/shared/notifications/notifications.service';
import { FilesService } from '@/shared/files/files.service';
import { PaymentsService } from '@/shared/payments/payments.service';
import type { RequestUser } from '@/common/decorators';
import type { CreateComplaintDto, UpdateComplaintDto, AddComplaintUpdateDto, CreateSnagItemDto, UpdateSnagItemDto } from './dto/buyer.dto';
export declare class BuyerService {
    private readonly prisma;
    private readonly redis;
    private readonly notifications;
    private readonly files;
    private readonly payments;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService, notifications: NotificationsService, files: FilesService, payments: PaymentsService);
    getDashboard(userId: string): Promise<{
        bookings: any;
        stats: {
            totalBookings: any;
            totalPaid: number;
            pendingPayments: any;
            openComplaints: any;
        };
    }>;
    getMyBookings(userId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getBookingDetail(id: string, userId: string): Promise<any>;
    getPaymentSummary(userId: string, bookingId?: string): Promise<any>;
    initiatePayment(bookingId: string, scheduleItemId: string, userId: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
    }>;
    verifyPayment(data: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getDocuments(userId: string, bookingId?: string): Promise<any>;
    getDemandLetters(userId: string, bookingId?: string): Promise<any>;
    getConstructionUpdates(userId: string, bookingId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getMilestones(userId: string, bookingId: string): Promise<any>;
    createComplaint(dto: CreateComplaintDto, user: RequestUser, files?: Express.Multer.File[]): Promise<any>;
    getComplaints(userId: string, page?: number, limit?: number, status?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getComplaintById(id: string, userId: string): Promise<any>;
    addComplaintUpdate(id: string, dto: AddComplaintUpdateDto, user: RequestUser): Promise<any>;
    updateComplaintStatus(id: string, dto: UpdateComplaintDto, user: RequestUser): Promise<any>;
    createSnagItem(dto: CreateSnagItemDto, user: RequestUser): Promise<any>;
    getSnagItems(bookingId: string, userId: string): Promise<any>;
    updateSnagItem(id: string, dto: UpdateSnagItemDto): Promise<any>;
    getNotifications(userId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
        };
        unreadCount: any;
    }>;
    markNotificationRead(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    markAllNotificationsRead(userId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=buyer.service.d.ts.map