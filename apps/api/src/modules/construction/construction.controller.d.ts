import { ConstructionService } from './construction.service';
import { CreateProjectDto, UpdateProjectDto, CreateTowerDto, CreateUnitDto, CreateMilestoneDto, UpdateMilestoneDto, CreateProgressUpdateDto, CreateDSRDto, ApproveDSRDto, CreateQualityCheckDto } from './dto/construction.dto';
import type { RequestUser } from '@/common/decorators';
import { ProjectStatus } from '@prisma/client';
export declare class ConstructionController {
    private readonly constructionService;
    constructor(constructionService: ConstructionService);
    createProject(dto: CreateProjectDto, user: RequestUser): Promise<any>;
    getProjects(user: RequestUser, page?: number, limit?: number, status?: ProjectStatus): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProjectSummary(id: string): Promise<{
        project: any;
        milestones: {
            [k: string]: any;
        };
        units: {
            total: any;
        };
        overallProgress: any;
        pendingDSRApprovals: any;
    }>;
    getProject(id: string): Promise<any>;
    updateProject(id: string, dto: UpdateProjectDto, user: RequestUser): Promise<any>;
    createTower(id: string, dto: CreateTowerDto, user: RequestUser): Promise<any>;
    createUnit(floorId: string, dto: CreateUnitDto): Promise<any>;
    getInventory(id: string): Promise<string | {
        towers: any;
        summary: {
            total: number;
            available: number;
            booked: number;
            sold: number;
            held: number;
            totalValue: number;
            bookedValue: number;
        };
    }>;
    createMilestone(id: string, dto: CreateMilestoneDto): Promise<any>;
    getMilestones(id: string): Promise<any>;
    updateMilestone(id: string, dto: UpdateMilestoneDto, user: RequestUser): Promise<any>;
    createProgress(id: string, dto: CreateProgressUpdateDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    getProgress(id: string, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createDSR(id: string, dto: CreateDSRDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    getDSRs(id: string, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    approveDSR(id: string, dto: ApproveDSRDto, user: RequestUser): Promise<any>;
    createQualityCheck(id: string, dto: CreateQualityCheckDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    getQualityChecks(id: string, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=construction.controller.d.ts.map