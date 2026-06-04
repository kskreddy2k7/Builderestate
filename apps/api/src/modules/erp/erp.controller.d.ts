import { ErpService } from './erp.service';
import { CreateBookingDto, UpdateBookingStatusDto, CancelBookingDto, CreatePaymentOrderDto, VerifyPaymentDto, RecordOfflinePaymentDto, IssueDemandLetterDto, CreateProjectBudgetDto, CreateExpenditureDto, UpdateUnitPricingDto } from './dto/erp.dto';
import type { RequestUser } from '@/common/decorators';
import { BookingStatus } from '@prisma/client';
export declare class ErpController {
    private readonly erpService;
    constructor(erpService: ErpService);
    createBooking(dto: CreateBookingDto, user: RequestUser): Promise<any>;
    getBookings(user: RequestUser, page?: number, limit?: number, status?: BookingStatus, projectId?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getBooking(id: string): Promise<any>;
    updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<any>;
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
    recordOffline(dto: RecordOfflinePaymentDto, user: RequestUser): Promise<any>;
    getPaymentHistory(bookingId: string): Promise<any>;
    issueDemandLetter(dto: IssueDemandLetterDto): Promise<any>;
    createBudget(projectId: string, dto: CreateProjectBudgetDto): Promise<any>;
    getBudget(projectId: string): Promise<any>;
    createExpenditure(projectId: string, dto: CreateExpenditureDto, user: RequestUser): Promise<any>;
    getFinanceSummary(projectId: string): Promise<{
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
    updatePricing(unitId: string, dto: UpdateUnitPricingDto): Promise<any>;
}
//# sourceMappingURL=erp.controller.d.ts.map