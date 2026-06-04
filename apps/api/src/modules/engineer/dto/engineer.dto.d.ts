export declare class InspectionItemDto {
    category: string;
    description: string;
    standard: string;
    result: string;
    remarks?: string;
}
export declare class CreateInspectionDto {
    projectId: string;
    activity: string;
    location: string;
    tower?: string;
    floor?: number;
    unit?: string;
    scheduledDate: string;
    checklistItems: InspectionItemDto[];
    remarks?: string;
}
export declare class CompleteInspectionDto {
    status: string;
    checklistItems: InspectionItemDto[];
    remarks?: string;
}
export declare class CreateNCRDto {
    inspectionId: string;
    issuedToId: string;
    description: string;
    severity: string;
    dueDate: string;
}
export declare class UpdateNCRDto {
    status: string;
    rootCause?: string;
    correctiveAction?: string;
    preventiveAction?: string;
}
export declare class CreateTestResultDto {
    projectId: string;
    inspectionId?: string;
    testType: string;
    sampleId: string;
    location: string;
    date: string;
    result: string;
    unit: string;
    standardValue: string;
    status: string;
    labName?: string;
    certificateUrl?: string;
}
export declare class CreateApprovalDto {
    projectId: string;
    type: string;
    location: string;
}
export declare class ProcessApprovalDto {
    status: string;
    rejectedReason?: string;
}
//# sourceMappingURL=engineer.dto.d.ts.map