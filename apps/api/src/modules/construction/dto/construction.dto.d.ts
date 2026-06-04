import { ProjectStatus, MilestoneStatus } from '@prisma/client';
export declare class CreateProjectDto {
    name: string;
    description?: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    totalArea?: number;
    reraNumber?: string;
    startDate: string;
    expectedCompletionDate: string;
    amenities?: string[];
}
declare const UpdateProjectDto_base: import("@nestjs/common").Type<Partial<CreateProjectDto>>;
export declare class UpdateProjectDto extends UpdateProjectDto_base {
    status?: ProjectStatus;
}
export declare class CreateTowerDto {
    name: string;
    numberOfFloors: number;
    numberOfUnitsPerFloor: number;
    phaseId?: string;
}
export declare class CreateUnitDto {
    unitNumber: string;
    bhkType: string;
    area: number;
    carpetArea?: number;
    facing?: string;
    basePrice: number;
    floorRisePremium?: number;
    facingPremium?: number;
    amenities?: string[];
    floorPlanUrl?: string;
}
export declare class CreateMilestoneDto {
    name: string;
    description?: string;
    plannedStartDate: string;
    plannedEndDate: string;
    linkedPaymentPercentage?: number;
    dependencies?: string[];
    phaseId?: string;
}
declare const UpdateMilestoneDto_base: import("@nestjs/common").Type<Partial<CreateMilestoneDto>>;
export declare class UpdateMilestoneDto extends UpdateMilestoneDto_base {
    status?: MilestoneStatus;
    completionPercentage?: number;
    actualStartDate?: string;
    actualEndDate?: string;
}
export declare class CreateProgressUpdateDto {
    title: string;
    description: string;
    completionPercentage: number;
    milestoneId?: string;
    isVisibleToBuyers?: boolean;
}
export declare class CreateDSRDto {
    reportDate: string;
    weather?: string;
    totalLabour: number;
    labourBreakdown?: {
        trade: string;
        count: number;
    }[];
    workDone: string;
    materialsUsed?: {
        material: string;
        quantity: number;
        unit: string;
    }[];
    equipmentUsed?: string[];
    issues?: string;
}
export declare class ApproveDSRDto {
    status: 'APPROVED' | 'REJECTED';
    remarks?: string;
}
export declare class QualityCheckItemDto {
    description: string;
    status: 'PASS' | 'FAIL' | 'NA';
    remarks?: string;
}
export declare class CreateQualityCheckDto {
    activity: string;
    location: string;
    checklistItems: QualityCheckItemDto[];
    overallStatus: string;
    remarks?: string;
}
export {};
//# sourceMappingURL=construction.dto.d.ts.map