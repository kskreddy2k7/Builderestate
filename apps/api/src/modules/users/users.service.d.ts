import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import { FilesService } from '@/shared/files/files.service';
export declare class UsersService {
    private readonly prisma;
    private readonly redis;
    private readonly files;
    constructor(prisma: PrismaService, redis: RedisService, files: FilesService);
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, data: {
        name?: string;
        phone?: string;
    }): Promise<any>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<any>;
    getOrganisation(orgId: string): Promise<any>;
    getNotifications(userId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
        };
        unreadCount: any;
    }>;
}
//# sourceMappingURL=users.service.d.ts.map