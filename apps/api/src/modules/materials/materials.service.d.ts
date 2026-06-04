import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import type { RequestUser } from '@/common/decorators';
import type { CreateProductDto, CreateRFQDto, SubmitRFQResponseDto, CreatePurchaseOrderDto, UpdateDeliveryStatusDto, CreateGRNDto } from './dto/materials.dto';
export declare class MaterialsService {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    getCategories(): Promise<unknown>;
    createProduct(dto: CreateProductDto, supplierId: string): Promise<any>;
    getProducts(filters: {
        categoryId?: string;
        supplierId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getSuppliers(page?: number, limit?: number, category?: string): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
        };
    }>;
    createRFQ(dto: CreateRFQDto, user: RequestUser): Promise<any>;
    getRFQs(projectId: string): Promise<any>;
    submitRFQResponse(dto: SubmitRFQResponseDto, supplierId: string): Promise<any>;
    getRFQResponses(rfqId: string): Promise<any>;
    createPO(dto: CreatePurchaseOrderDto, user: RequestUser): Promise<any>;
    getPOs(filters: {
        projectId?: string;
        supplierId?: string;
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
    getPOById(id: string): Promise<any>;
    updateDelivery(poId: string, dto: UpdateDeliveryStatusDto): Promise<any>;
    createGRN(dto: CreateGRNDto, user: RequestUser): Promise<any>;
}
//# sourceMappingURL=materials.service.d.ts.map