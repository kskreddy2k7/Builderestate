import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import type { CostEstimateRequestDto, PropertyValuationDto, RiskAnalysisDto, AIChatDto } from './dto/ai.dto';
export declare class AiService {
    private readonly prisma;
    private readonly redis;
    private readonly config;
    private readonly logger;
    private openai;
    constructor(prisma: PrismaService, redis: RedisService, config: ConfigService);
    estimateCost(dto: CostEstimateRequestDto, userId: string): Promise<string | {
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
    valuateProperty(dto: PropertyValuationDto, userId: string): Promise<{
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
    detectProjectRisks(dto: RiskAnalysisDto, userId: string): Promise<{
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
    scoreLead(leadId: string, userId: string): Promise<{
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
    chat(dto: AIChatDto, userId: string): Promise<{
        reply: string;
        requestId: any;
    }>;
    getHistory(userId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getRiskFlags(projectId: string): Promise<any>;
    private getDefaultRateForCity;
}
//# sourceMappingURL=ai.service.d.ts.map