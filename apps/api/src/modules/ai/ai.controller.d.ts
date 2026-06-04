import { AiService } from './ai.service';
import { CostEstimateRequestDto, PropertyValuationDto, RiskAnalysisDto, AIChatDto } from './dto/ai.dto';
import type { RequestUser } from '@/common/decorators';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    estimateCost(dto: CostEstimateRequestDto, user: RequestUser): Promise<string | {
        input: CostEstimateRequestDto;
        minCost: number;
        maxCost: number;
        avgCost: number;
        costPerSqft: {
            min: number;
            max: number;
        };
        breakdown: {
            head: string;
            percentage: number;
            amount: number;
        }[];
        cityTier: string;
        confidence: number;
        validUntil: string;
        disclaimer: string;
    }>;
    valuate(dto: PropertyValuationDto, user: RequestUser): Promise<{
        address: string;
        area: number;
        type: string;
        estimatedValue: number;
        pricePerSqft: number;
        comparables: any;
        marketTrend: "STABLE";
        confidence: number;
        validAt: string;
    }>;
    analyzeRisks(dto: RiskAnalysisDto, user: RequestUser): Promise<{
        risks: never[];
        projectId?: never;
        analyzedAt?: never;
    } | {
        projectId: string;
        risks: {
            type: string;
            severity: string;
            title: string;
            description: string;
            detectedAt: string;
        }[];
        analyzedAt: string;
    }>;
    scoreLead(body: {
        leadId: string;
    }, user: RequestUser): Promise<{
        score: number;
        factors: never[];
        leadId?: never;
        previousScore?: never;
        newScore?: never;
        recommendation?: never;
    } | {
        leadId: string;
        previousScore: any;
        newScore: any;
        factors: {
            factor: string;
            impact: number;
            description: string;
        }[];
        recommendation: string;
        score?: never;
    }>;
    chat(dto: AIChatDto, user: RequestUser): Promise<{
        reply: string;
        requestId: any;
    }>;
    getRiskFlags(projectId: string): Promise<any>;
    getHistory(user: RequestUser, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=ai.controller.d.ts.map