import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import { NotificationsService } from '@/shared/notifications/notifications.service';
import { PaymentsService } from '@/shared/payments/payments.service';
import { BookingStatus } from '@prisma/client';
import type { RequestUser } from '@/common/decorators';
import type { CreateBookingDto, UpdateBookingStatusDto, CancelBookingDto, CreatePaymentOrderDto, VerifyPaymentDto, RecordOfflinePaymentDto, IssueDemandLetterDto, CreateProjectBudgetDto, CreateExpenditureDto, UpdateUnitPricingDto } from './dto/erp.dto';
export declare class ErpService {
    private readonly prisma;
    private readonly redis;
    private readonly notifications;
    private readonly payments;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService, notifications: NotificationsService, payments: PaymentsService);
    createBooking(dto: CreateBookingDto, user: RequestUser): Promise<any>;
    getBookings(orgId: string, filters?: {
        page?: number;
        limit?: number;
        status?: BookingStatus;
        projectId?: string;
    }): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getBookingById(id: string): Promise<any>;
    updateBookingStatus(id: string, dto: UpdateBookingStatusDto): Promise<any>;
    cancelBooking(id: string, dto: CancelBookingDto): Promise<{
        message: string;
    }>;
    createPaymentOrder(dto: CreatePaymentOrderDto): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
    }>;
    verifyPayment(dto: VerifyPaymentDto): Promise<{
        message: string;
    }>;
    recordOfflinePayment(dto: RecordOfflinePaymentDto, user: RequestUser): Promise<any>;
    getPaymentHistory(bookingId: string): Promise<any>;
    issueDemandLetter(dto: IssueDemandLetterDto): Promise<any>;
    createBudget(projectId: string, dto: CreateProjectBudgetDto): Promise<any>;
    getBudget(projectId: string): Promise<any>;
    createExpenditure(projectId: string, dto: CreateExpenditureDto, user: RequestUser): Promise<any>;
    getFinancialSummary(projectId: string): Promise<{
        bookings: {
            count: any;
            totalValue: number;
        };
        collected: number;
        budget: {
            total: number;
            spent: number;
        };
        overdue: {
            count: any;
            amount: number;
        };
    }>;
    updateUnitPricing(unitId: string, dto: UpdateUnitPricingDto): Promise<any>;
}
//# sourceMappingURL=erp.service.d.ts.map