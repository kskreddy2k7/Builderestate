import { ContractorService } from './contractor.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto, CreateLaborAttendanceDto, CreateRABillDto, ProcessRABillDto, CreateMaterialIndentDto, ProcessMaterialIndentDto } from './dto/contractor.dto';
import type { RequestUser } from '@/common/decorators';
export declare class ContractorController {
    private readonly contractorService;
    constructor(contractorService: ContractorService);
    getDashboard(user: RequestUser): Promise<{
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
    createWO(dto: CreateWorkOrderDto): Promise<any>;
    getWOs(user: RequestUser, projectId?: string, status?: string, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getWO(id: string): Promise<any>;
    updateWO(id: string, dto: UpdateWorkOrderDto): Promise<any>;
    issueWO(id: string): Promise<any>;
    acceptWO(id: string, user: RequestUser): Promise<any>;
    markAttendance(dto: CreateLaborAttendanceDto, user: RequestUser): Promise<any>;
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
    submitBill(dto: CreateRABillDto, user: RequestUser): Promise<any>;
    processBill(id: string, dto: ProcessRABillDto, user: RequestUser): Promise<any>;
    payBill(id: string): Promise<any>;
    createIndent(dto: CreateMaterialIndentDto, user: RequestUser): Promise<any>;
    getIndents(projectId?: string, status?: string, user?: RequestUser): Promise<any>;
    processIndent(id: string, dto: ProcessMaterialIndentDto, user: RequestUser): Promise<any>;
}
//# sourceMappingURL=contractor.controller.d.ts.map