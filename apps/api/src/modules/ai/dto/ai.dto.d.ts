export declare class CostEstimateRequestDto {
    city: string;
    state: string;
    area: number;
    specifications: string;
    buildingType: string;
    floors: number;
    basementRequired: boolean;
    parkingRequired: boolean;
}
export declare class PropertyValuationDto {
    propertyId?: string;
    address: string;
    area: number;
    type: string;
    city: string;
}
export declare class LeadScoreDto {
    leadId: string;
}
export declare class DocumentAnalysisDto {
    documentUrl: string;
    documentType: string;
}
export declare class RiskAnalysisDto {
    projectId: string;
}
export declare class ConstructionPlanDto {
    projectId: string;
    totalArea: number;
    numberOfFloors: number;
    specifications: string;
}
export declare class AIChatDto {
    message: string;
    context?: string;
    history?: {
        role: string;
        content: string;
    }[];
}
//# sourceMappingURL=ai.dto.d.ts.map