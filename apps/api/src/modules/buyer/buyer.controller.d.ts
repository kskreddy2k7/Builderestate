import { BuyerService } from './buyer.service';
import { CreateComplaintDto, UpdateComplaintDto, AddComplaintUpdateDto, CreateSnagItemDto, UpdateSnagItemDto } from './dto/buyer.dto';
import type { RequestUser } from '@/common/decorators';
export declare class BuyerController {
    private readonly buyerService;
    constructor(buyerService: BuyerService);
    getDashboard(user: RequestUser): Promise<{
        bookings: any;
        stats: {
            totalBookings: any;
            totalPaid: number;
            pendingPayments: any;
            openComplaints: any;
        };
    }>;
    getBookings(user: RequestUser, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getBooking(id: string, user: RequestUser): Promise<any>;
    getPayments(user: RequestUser, bookingId?: string): Promise<any>;
    initiatePayment(body: {
        bookingId: string;
        scheduleItemId: string;
    }, user: RequestUser): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
    }>;
    verifyPayment(body: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    getDocuments(user: RequestUser, bookingId?: string): Promise<any>;
    getDemandLetters(user: RequestUser, bookingId?: string): Promise<any>;
    getProgress(id: string, user: RequestUser, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getMilestones(id: string, user: RequestUser): Promise<any>;
    createComplaint(dto: CreateComplaintDto, user: RequestUser, files?: Express.Multer.File[]): Promise<any>;
    getComplaints(user: RequestUser, page?: number, status?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getComplaint(id: string, user: RequestUser): Promise<any>;
    addComplaintUpdate(id: string, dto: AddComplaintUpdateDto, user: RequestUser): Promise<any>;
    updateComplaint(id: string, dto: UpdateComplaintDto, user: RequestUser): Promise<any>;
    createSnagItem(dto: CreateSnagItemDto, user: RequestUser): Promise<any>;
    getSnagItems(id: string, user: RequestUser): Promise<any>;
    updateSnagItem(id: string, dto: UpdateSnagItemDto): Promise<any>;
    getNotifications(user: RequestUser, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
        };
        unreadCount: any;
    }>;
    markRead(id: string, user: RequestUser): Promise<{
        success: boolean;
    }>;
    markAllRead(user: RequestUser): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=buyer.controller.d.ts.map