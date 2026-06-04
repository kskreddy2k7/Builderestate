import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import { NotificationsService } from '@/shared/notifications/notifications.service';
import type { CreateWorkOrderDto, UpdateWorkOrderDto, CreateLaborAttendanceDto, CreateRABillDto, ProcessRABillDto, CreateMaterialIndentDto, ProcessMaterialIndentDto } from './dto/contractor.dto';
export declare class ContractorService {
    private readonly prisma;
    private readonly redis;
    private readonly notifications;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService, notifications: NotificationsService);
    getDashboard(userId: string): Promise<{
        message: string;
        activeWorkOrders: number;
        contractor?: never;
        stats?: never;
        recentWorkOrders?: never;
    } | {
        contractor: any;
        stats: {
            activeWorkOrders: any;
            pendingBills: any;
            openIndents: any;
            attendanceMarked: boolean;
        };
        recentWorkOrders: any;
        message?: never;
        activeWorkOrders?: never;
    }>;
    createWorkOrder(dto: CreateWorkOrderDto): Promise<any>;
    getWorkOrders(filters: {
        projectId?: string;
        contractorId?: string;
        userId?: string;
        status?: string;
    }, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getWorkOrderById(id: string): Promise<any>;
    updateWorkOrder(id: string, dto: UpdateWorkOrderDto): Promise<any>;
    issueWorkOrder(id: string): Promise<any>;
    acceptWorkOrder(id: string, userId: string): Promise<any>;
    markAttendance(dto: CreateLaborAttendanceDto, userId: string): Promise<any>;
    getAttendance(projectId: string, contractorId?: string, from?: string, to?: string): Promise<any>;
    getAttendanceSummary(projectId: string): Promise<{
        chartData: {
            date: string;
            count: number;
        }[];
        byContractor: {
            name: string;
            total: number;
        }[];
        peakDay: [string, number] | undefined;
    }>;
    submitRABill(dto: CreateRABillDto, userId: string): Promise<any>;
    processRABill(id: string, dto: ProcessRABillDto, userId: string): Promise<any>;
    payRABill(id: string): Promise<any>;
    createMaterialIndent(dto: CreateMaterialIndentDto, userId: string): Promise<any>;
    getMaterialIndents(filters: {
        projectId?: string;
        contractorId?: string;
        status?: string;
    }): Promise<any>;
    processMaterialIndent(id: string, dto: ProcessMaterialIndentDto, userId: string): Promise<any>;
}
//# sourceMappingURL=contractor.service.d.ts.map