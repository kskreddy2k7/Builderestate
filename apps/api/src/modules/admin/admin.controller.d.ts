import { AdminService } from './admin.service';
import type { RequestUser } from '@/common/decorators';
import { UserStatus } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
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
    getUsers(page?: number, limit?: number, search?: string, role?: string, status?: UserStatus): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getUser(id: string): Promise<any>;
    updateStatus(id: string, body: {
        status: UserStatus;
        reason?: string;
    }): Promise<any>;
    getQueue(page?: number, type?: 'property' | 'project' | 'org'): Promise<Record<string, unknown>>;
    verifyOrg(id: string, body: {
        decision: 'VERIFIED' | 'REJECTED';
        reason?: string;
    }, user: RequestUser): Promise<any>;
    getAuditLogs(page?: number, userId?: string, resource?: string, from?: string, to?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=admin.controller.d.ts.map