import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import { NotificationsService } from '@/shared/notifications/notifications.service';
import { FilesService } from '@/shared/files/files.service';
import { ProjectStatus } from '@prisma/client';
import type { RequestUser } from '@/common/decorators';
import type { CreateProjectDto, UpdateProjectDto, CreateTowerDto, CreateUnitDto, CreateMilestoneDto, UpdateMilestoneDto, CreateProgressUpdateDto, CreateDSRDto, ApproveDSRDto, CreateQualityCheckDto } from './dto/construction.dto';
export declare class ConstructionService {
    private readonly prisma;
    private readonly redis;
    private readonly notifications;
    private readonly files;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService, notifications: NotificationsService, files: FilesService);
    createProject(dto: CreateProjectDto, user: RequestUser): Promise<any>;
    getProjects(orgId: string, page?: number, limit?: number, status?: ProjectStatus): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProjectById(id: string): Promise<any>;
    updateProject(id: string, dto: UpdateProjectDto, user: RequestUser): Promise<any>;
    createTower(projectId: string, dto: CreateTowerDto, user: RequestUser): Promise<any>;
    createUnit(floorId: string, dto: CreateUnitDto): Promise<any>;
    getUnitInventory(projectId: string): Promise<string | {
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
    createMilestone(projectId: string, dto: CreateMilestoneDto): Promise<any>;
    updateMilestone(id: string, dto: UpdateMilestoneDto, user: RequestUser): Promise<any>;
    getMilestones(projectId: string): Promise<any>;
    createProgressUpdate(projectId: string, dto: CreateProgressUpdateDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    getProgressUpdates(projectId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createDSR(projectId: string, dto: CreateDSRDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    getDSRs(projectId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    approveDSR(id: string, dto: ApproveDSRDto, user: RequestUser): Promise<any>;
    createQualityCheck(projectId: string, dto: CreateQualityCheckDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    getQualityChecks(projectId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProjectSummary(projectId: string): Promise<{
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
}
//# sourceMappingURL=construction.service.d.ts.map