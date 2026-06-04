import { CrmService } from './crm.service';
import { CreateLeadDto, UpdateLeadDto, TransferLeadDto, CreateActivityDto, ScheduleSiteVisitDto, CompleteSiteVisitDto, CreateCommissionDto, UpdateCommissionStatusDto, RecordCommissionPaymentDto, CreateCustomerDto, UpdateCustomerDto, LeadFilterDto } from './dto/crm.dto';
import type { RequestUser } from '@/common/decorators';
export declare class CrmController {
    private readonly crmService;
    constructor(crmService: CrmService);
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
    getPipeline(user: RequestUser): Promise<{
        pipeline: {
            stage: any;
            count: any;
        }[];
        sources: any;
        overdueFollowUps: any;
        recentLeads: any;
    }>;
    getLead(id: string, user: RequestUser): Promise<any>;
    updateLead(id: string, dto: UpdateLeadDto, user: RequestUser): Promise<any>;
    transferLead(id: string, dto: TransferLeadDto, user: RequestUser): Promise<{
        message: string;
    }>;
    addActivity(id: string, dto: CreateActivityDto, user: RequestUser): Promise<any>;
    getActivities(id: string, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
        };
    }>;
    scheduleSiteVisit(id: string, dto: ScheduleSiteVisitDto, user: RequestUser): Promise<any>;
    completeSiteVisit(visitId: string, dto: CompleteSiteVisitDto, user: RequestUser): Promise<any>;
    getSiteVisits(user: RequestUser, from?: string, to?: string, status?: string): Promise<any>;
    createCommission(dto: CreateCommissionDto, user: RequestUser): Promise<any>;
    getCommissions(user: RequestUser, page?: number, status?: string): Promise<{
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
    recordPayment(dto: RecordCommissionPaymentDto, user: RequestUser): Promise<any>;
    createCustomer(dto: CreateCustomerDto, user: RequestUser): Promise<any>;
    getCustomers(user: RequestUser, page?: number, search?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getCustomer(id: string): Promise<any>;
    updateCustomer(id: string, dto: UpdateCustomerDto): Promise<any>;
}
//# sourceMappingURL=crm.controller.d.ts.map