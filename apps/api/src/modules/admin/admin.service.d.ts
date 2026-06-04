import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import { UserStatus } from '@prisma/client';
export declare class AdminService {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    getPlatformStats(): Promise<{
        users: {
            total: any;
            active: any;
            newThisMonth: any;
        };
        properties: {
            total: any;
            active: any;
            pendingVerifications: any;
        };
        projects: {
            total: any;
            active: any;
        };
        bookings: {
            thisMonth: any;
            totalValue: number;
        };
        payments: {
            totalCollected: number;
            thisMonth: number;
        };
        operations: {
            openComplaints: any;
            openNCRs: any;
        };
    }>;
    getUsers(page?: number, limit?: number, filters?: {
        search?: string;
        role?: string;
        status?: UserStatus;
        orgId?: string;
    }): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUserById(id: string): Promise<any>;
    updateUserStatus(id: string, status: UserStatus, reason?: string): Promise<any>;
    getVerificationQueue(page?: number, limit?: number, type?: 'property' | 'project' | 'org'): Promise<Record<string, unknown>>;
    getAuditLogs(page?: number, limit?: number, filters?: {
        userId?: string;
        resource?: string;
        from?: string;
        to?: string;
    }): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    verifyOrganization(id: string, decision: 'VERIFIED' | 'REJECTED', adminId: string, reason?: string): Promise<any>;
}
//# sourceMappingURL=admin.service.d.ts.map