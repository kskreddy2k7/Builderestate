import { BookingStatus, PaymentMethod } from '@prisma/client';
export declare class CreateBookingDto {
    unitId: string;
    buyerId: string;
    brokerId?: string;
    agentId?: string;
    bookingAmount: number;
    discountAmount?: number;
    bookingDate?: string;
    remarks?: string;
    paymentSchedule?: {
        milestone: string;
        percentage: number;
        dueDate: string;
        milestoneId?: string;
    }[];
}
export declare class UpdateBookingStatusDto {
    status: BookingStatus;
    remarks?: string;
    agreementDate?: string;
    registrationDate?: string;
}
export declare class CancelBookingDto {
    reason: string;
}
export declare class CreatePaymentOrderDto {
    bookingId: string;
    scheduleItemId: string;
}
export declare class VerifyPaymentDto {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}
export declare class RecordOfflinePaymentDto {
    bookingId: string;
    scheduleItemId: string;
    amount: number;
    method: PaymentMethod;
    transactionRef?: string;
    chequeNumber?: string;
    bankName?: string;
    paidAt: string;
}
export declare class IssueDemandLetterDto {
    bookingId: string;
    scheduleItemId: string;
    dueDate: string;
}
export declare class CreateProjectBudgetDto {
    totalBudget: number;
    fiscalYear: string;
    heads?: {
        name: string;
        category: string;
        allocatedAmount: number;
    }[];
}
export declare class CreateExpenditureDto {
    budgetHeadId: string;
    description: string;
    amount: number;
    gstAmount?: number;
    vendorId?: string;
    invoiceNumber?: string;
    invoiceDate: string;
}
export declare class UpdateUnitPricingDto {
    basePrice?: number;
    floorRisePremium?: number;
    facingPremium?: number;
    applyToAllSimilar?: boolean;
}
//# sourceMappingURL=erp.dto.d.ts.map