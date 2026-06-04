import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import { FilesService } from '@/shared/files/files.service';
import { NotificationsService } from '@/shared/notifications/notifications.service';
import { PropertyStatus } from '@prisma/client';
import type { RequestUser } from '@/common/decorators';
import type { CreatePropertyDto, UpdatePropertyDto, PropertySearchDto, CreateEnquiryDto, VerifyPropertyDto } from './dto/marketplace.dto';
export declare class MarketplaceService {
    private readonly prisma;
    private readonly redis;
    private readonly files;
    private readonly notifications;
    private readonly logger;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService, redis: RedisService, files: FilesService, notifications: NotificationsService);
    create(dto: CreatePropertyDto, user: RequestUser): Promise<any>;
    search(dto: PropertySearchDto): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            facets: {
                types: {
                    [k: string]: any;
                };
                cities: any;
            };
        };
    }>;
    findById(id: string, incrementView?: boolean): Promise<any>;
    findBySlug(slug: string): Promise<any>;
    update(id: string, dto: UpdatePropertyDto, user: RequestUser): Promise<any>;
    uploadMedia(propertyId: string, files: Express.Multer.File[], user: RequestUser): Promise<{
        uploaded: any;
    }>;
    submitForReview(id: string, user: RequestUser): Promise<{
        message: string;
    }>;
    verify(id: string, dto: VerifyPropertyDto, adminId: string): Promise<{
        message: string;
    }>;
    createEnquiry(propertyId: string, dto: CreateEnquiryDto): Promise<any>;
    toggleSave(propertyId: string, userId: string): Promise<{
        saved: boolean;
    }>;
    getSavedProperties(userId: string, page?: number, limit?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getMyListings(userId: string, page?: number, limit?: number, status?: PropertyStatus): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    remove(id: string, user: RequestUser): Promise<{
        message: string;
    }>;
    getFeatured(limit?: number): Promise<unknown>;
    getStats(orgId?: string): Promise<{
        total: any;
        active: any;
        pending: any;
        sold: any;
    }>;
}
//# sourceMappingURL=marketplace.service.d.ts.map