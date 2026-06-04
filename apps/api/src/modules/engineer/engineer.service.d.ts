import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import { NotificationsService } from '@/shared/notifications/notifications.service';
import { FilesService } from '@/shared/files/files.service';
import type { RequestUser } from '@/common/decorators';
import type { CreateInspectionDto, CompleteInspectionDto, CreateNCRDto, UpdateNCRDto, CreateTestResultDto, CreateApprovalDto, ProcessApprovalDto } from './dto/engineer.dto';
export declare class EngineerService {
    private readonly prisma;
    private readonly redis;
    private readonly notifications;
    private readonly files;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService, notifications: NotificationsService, files: FilesService);
    getDashboard(userId: string): Promise<{
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
    getInspections(projectId: string, page?: number, limit?: number, status?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getInspectionById(id: string): Promise<any>;
    completeInspection(id: string, dto: CompleteInspectionDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    createNCR(dto: CreateNCRDto, files: Express.Multer.File[], user: RequestUser): Promise<any>;
    getNCRs(projectId: string, page?: number, limit?: number, status?: string): Promise<{
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
    getTestResults(projectId: string, page?: number, limit?: number): Promise<{
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
    getApprovals(projectId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=engineer.service.d.ts.map