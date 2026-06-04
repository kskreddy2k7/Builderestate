import { MarketplaceService } from './marketplace.service';
import { CreatePropertyDto, UpdatePropertyDto, PropertySearchDto, CreateEnquiryDto, VerifyPropertyDto } from './dto/marketplace.dto';
import type { RequestUser } from '@/common/decorators';
export declare class MarketplaceController {
    private readonly marketplaceService;
    constructor(marketplaceService: MarketplaceService);
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
    getFeatured(limit?: number): Promise<unknown>;
    findBySlug(slug: string): Promise<any>;
    createEnquiry(id: string, dto: CreateEnquiryDto): Promise<any>;
    create(dto: CreatePropertyDto, user: RequestUser): Promise<any>;
    getMyListings(user: RequestUser, page?: number, limit?: number, status?: any): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getSaved(user: RequestUser, page?: number): Promise<{
        items: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getStats(user: RequestUser): Promise<{
        total: any;
        active: any;
        pending: any;
        sold: any;
    }>;
    findById(id: string): Promise<any>;
    update(id: string, dto: UpdatePropertyDto, user: RequestUser): Promise<any>;
    submitForReview(id: string, user: RequestUser): Promise<{
        message: string;
    }>;
    uploadMedia(id: string, files: Express.Multer.File[], user: RequestUser): Promise<{
        uploaded: any;
    }>;
    toggleSave(id: string, user: RequestUser): Promise<{
        saved: boolean;
    }>;
    remove(id: string, user: RequestUser): Promise<{
        message: string;
    }>;
    verify(id: string, dto: VerifyPropertyDto, user: RequestUser): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=marketplace.controller.d.ts.map