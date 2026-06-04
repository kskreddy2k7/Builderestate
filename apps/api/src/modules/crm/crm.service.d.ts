import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import { NotificationsService } from '@/shared/notifications/notifications.service';
import type { RequestUser } from '@/common/decorators';
import type { CreateLeadDto, UpdateLeadDto, TransferLeadDto, CreateActivityDto, ScheduleSiteVisitDto, CompleteSiteVisitDto, CreateCommissionDto, UpdateCommissionStatusDto, RecordCommissionPaymentDto, CreateCustomerDto, UpdateCustomerDto, LeadFilterDto } from './dto/crm.dto';
export declare class CrmService {
    private readonly prisma;
    private readonly redis;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService, notifications: NotificationsService);
    createLead(dto: CreateLeadDto, user: RequestUser): Promise<any>;
    getLeads(user: RequestUser, dto: LeadFilterDto): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLeadById(id: string, user: RequestUser): Promise<any>;
    updateLead(id: string, dto: UpdateLeadDto, user: RequestUser): Promise<any>;
    transferLead(id: string, dto: TransferLeadDto, user: RequestUser): Promise<{
        message: string;
    }>;
    getPipeline(orgId: string, userId?: string): Promise<{
        pipeline: {
            stage: any;
            count: any;
        }[];
        sources: any;
        overdueFollowUps: any;
        recentLeads: any;
    }>;
    addActivity(leadId: string, dto: CreateActivityDto, user: RequestUser): Promise<any>;
    getActivities(leadId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
        };
    }>;
    scheduleSiteVisit(leadId: string, dto: ScheduleSiteVisitDto, user: RequestUser): Promise<any>;
    completeSiteVisit(visitId: string, dto: CompleteSiteVisitDto, user: RequestUser): Promise<any>;
    getSiteVisits(filters: {
        orgId: string;
        from?: string;
        to?: string;
        status?: string;
    }): Promise<any>;
    createCommission(dto: CreateCommissionDto, user: RequestUser): Promise<any>;
    getCommissions(user: RequestUser, page?: number, limit?: number, status?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
        summary: {
            total: number;
            netPayable: number;
            count: any;
        };
    }>;
    updateCommissionStatus(id: string, dto: UpdateCommissionStatusDto, user: RequestUser): Promise<any>;
    recordCommissionPayment(dto: RecordCommissionPaymentDto, user: RequestUser): Promise<any>;
    createCustomer(dto: CreateCustomerDto, user: RequestUser): Promise<any>;
    getCustomers(orgId: string, page?: number, limit?: number, search?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCustomerById(id: string): Promise<any>;
    updateCustomer(id: string, dto: UpdateCustomerDto): Promise<any>;
    private calculateInitialScore;
    private updateLeadScore;
}
//# sourceMappingURL=crm.service.d.ts.map