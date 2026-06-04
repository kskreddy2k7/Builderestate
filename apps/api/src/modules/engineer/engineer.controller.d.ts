import { EngineerService } from './engineer.service';
import { CreateInspectionDto, CompleteInspectionDto, CreateNCRDto, UpdateNCRDto, CreateTestResultDto, CreateApprovalDto, ProcessApprovalDto } from './dto/engineer.dto';
import type { RequestUser } from '@/common/decorators';
export declare class EngineerController {
    private readonly engineerService;
    constructor(engineerService: EngineerService);
    getDashboard(user: RequestUser): Promise<{
        todayInspections: any;
        openNCRs: any;
        pendingApprovals: any;
        recentTests: any;
        stats: {
            todayCount: any;
            passCount: any;
            failCount: any;
        };
    }>;
    createInspection(dto: CreateInspectionDto, user: RequestUser): Promise<any>;
    getInspections(projectId: string, page?: number, status?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getInspection(id: string): Promise<any>;
    completeInspection(id: string, dto: CompleteInspectionDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    createNCR(dto: CreateNCRDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    getNCRs(projectId: string, page?: number, status?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    updateNCR(id: string, dto: UpdateNCRDto, files: Express.Multer.File[]): Promise<any>;
    createTestResult(dto: CreateTestResultDto): Promise<any>;
    getTestResults(projectId: string, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createApproval(dto: CreateApprovalDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    processApproval(id: string, dto: ProcessApprovalDto, user: RequestUser): Promise<any>;
    getApprovals(projectId: string, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=engineer.controller.d.ts.map