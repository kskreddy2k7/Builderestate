import { MaterialsService } from './materials.service';
import { CreateProductDto, CreateRFQDto, SubmitRFQResponseDto, CreatePurchaseOrderDto, UpdateDeliveryStatusDto, CreateGRNDto } from './dto/materials.dto';
import type { RequestUser } from '@/common/decorators';
export declare class MaterialsController {
    private readonly materialsService;
    constructor(materialsService: MaterialsService);
    getCategories(): Promise<unknown>;
    getProducts(categoryId?: string, supplierId?: string, search?: string, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createProduct(dto: CreateProductDto, user: RequestUser): Promise<any>;
    getSuppliers(category?: string, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
        };
    }>;
    createRFQ(dto: CreateRFQDto, user: RequestUser): Promise<any>;
    getRFQs(projectId: string): Promise<any>;
    respondRFQ(dto: SubmitRFQResponseDto, user: RequestUser): Promise<any>;
    getRFQResponses(rfqId: string): Promise<any>;
    createPO(dto: CreatePurchaseOrderDto, user: RequestUser): Promise<any>;
    getPOs(projectId?: string, supplierId?: string, status?: string, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPO(id: string): Promise<any>;
    updateDelivery(id: string, dto: UpdateDeliveryStatusDto): Promise<any>;
    createGRN(dto: CreateGRNDto, user: RequestUser): Promise<any>;
}
//# sourceMappingURL=materials.controller.d.ts.map