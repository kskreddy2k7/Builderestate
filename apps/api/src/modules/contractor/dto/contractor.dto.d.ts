import { WorkOrderStatus } from '@prisma/client';
export declare class CreateWorkOrderDto {
    projectId: string;
    contractorId: string;
    title: string;
    scope: string;
    startDate: string;
    endDate: string;
    contractValue: number;
    retentionPercentage?: number;
    milestones?: {
        description: string;
        percentage: number;
        amount: number;
    }[];
}
declare const UpdateWorkOrderDto_base: import("@nestjs/common").Type<Partial<CreateWorkOrderDto>>;
export declare class UpdateWorkOrderDto extends UpdateWorkOrderDto_base {
    status?: WorkOrderStatus;
}
export declare class CreateLaborAttendanceDto {
    projectId: string;
    contractorId: string;
    date: string;
    labourBreakdown: {
        trade: string;
        present: number;
        absent: number;
    }[];
}
export declare class CreateRABillDto {
    workOrderId: string;
    grossAmount: number;
    billDate: string;
    previouslyPaid?: number;
}
export declare class ProcessRABillDto {
    status: string;
    remarks?: string;
}
export declare class CreateMaterialIndentDto {
    projectId: string;
    contractorId: string;
    items: {
        material: string;
        quantity: number;
        unit: string;
        specification?: string;
    }[];
    remarks?: string;
}
export declare class ProcessMaterialIndentDto {
    status: string;
    remarks?: string;
}
export {};
//# sourceMappingURL=contractor.dto.d.ts.map