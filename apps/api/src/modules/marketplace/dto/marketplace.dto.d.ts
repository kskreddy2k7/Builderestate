import { PropertyType, PropertyStatus, TransactionType, FurnishingStatus } from '@prisma/client';
export declare class AddressDto {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
}
export declare class CreatePropertyDto {
    title: string;
    description: string;
    type: PropertyType;
    transactionType: TransactionType;
    address: AddressDto;
    price: number;
    area: number;
    bhkType?: string;
    bathrooms?: number;
    balconies?: number;
    facing?: string;
    floorNumber?: number;
    totalFloors?: number;
    furnishingStatus?: FurnishingStatus;
    reraNumber?: string;
    possessionDate?: string;
    amenities?: string[];
}
declare const UpdatePropertyDto_base: import("@nestjs/common").Type<Partial<CreatePropertyDto>>;
export declare class UpdatePropertyDto extends UpdatePropertyDto_base {
    status?: PropertyStatus;
}
export declare class PropertySearchDto {
    search?: string;
    type?: PropertyType;
    transactionType?: TransactionType;
    city?: string;
    state?: string;
    pincode?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    bhkType?: string;
    reraVerified?: boolean;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export declare class CreateEnquiryDto {
    name: string;
    email: string;
    phone: string;
    message?: string;
    budget?: number;
    source?: string;
}
export declare class UpdatePropertyStatusDto {
    status: PropertyStatus;
}
export declare class VerifyPropertyDto {
    decision: 'VERIFIED' | 'REJECTED';
    reason?: string;
}
export {};
//# sourceMappingURL=marketplace.dto.d.ts.map