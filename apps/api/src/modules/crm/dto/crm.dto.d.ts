import { LeadStage, LeadSource } from '@prisma/client';
export declare class CreateLeadDto {
    name: string;
    email?: string;
    phone: string;
    alternatePhone?: string;
    source: LeadSource;
    stage?: LeadStage;
    budgetMin?: number;
    budgetMax?: number;
    preferredLocations?: string[];
    preferredBhk?: string[];
    propertyId?: string;
    projectId?: string;
    assignedToId?: string;
    notes?: string;
    nextFollowUpDate?: string;
}
declare const UpdateLeadDto_base: import("@nestjs/common").Type<Partial<CreateLeadDto>>;
export declare class UpdateLeadDto extends UpdateLeadDto_base {
    stage?: LeadStage;
    score?: number;
    lostReason?: string;
}
export declare class TransferLeadDto {
    toUserId: string;
    note?: string;
}
export declare class CreateActivityDto {
    type: string;
    title: string;
    description?: string;
    outcome?: string;
    nextAction?: string;
    nextActionDate?: string;
}
export declare class ScheduleSiteVisitDto {
    projectId: string;
    scheduledAt: string;
    conductedById?: string;
}
export declare class CompleteSiteVisitDto {
    feedback?: string;
    rating?: number;
    interestedUnits?: string[];
    status: string;
}
export declare class CreateCommissionDto {
    bookingId: string;
    agentId?: string;
    percentage: number;
    remarks?: string;
}
export declare class UpdateCommissionStatusDto {
    status: string;
    remarks?: string;
}
export declare class RecordCommissionPaymentDto {
    commissionId: string;
    paymentReference: string;
    invoiceNumber: string;
    invoiceUrl?: string;
}
export declare class CreateCustomerDto {
    name: string;
    email: string;
    phone: string;
    pan?: string;
    aadhaar?: string;
    occupation?: string;
    annualIncome?: number;
    tags?: string[];
}
declare const UpdateCustomerDto_base: import("@nestjs/common").Type<Partial<CreateCustomerDto>>;
export declare class UpdateCustomerDto extends UpdateCustomerDto_base {
}
export declare class LeadFilterDto {
    search?: string;
    stage?: LeadStage;
    source?: LeadSource;
    assignedToId?: string;
    projectId?: string;
    followUpFrom?: string;
    followUpTo?: string;
    overdueFollowUp?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export {};
//# sourceMappingURL=crm.dto.d.ts.map