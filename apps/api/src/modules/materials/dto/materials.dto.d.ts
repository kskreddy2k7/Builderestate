export declare class CreateProductDto {
    categoryId: string;
    name: string;
    description?: string;
    unit: string;
    basePrice: number;
    gstRate: number;
    moq?: number;
    leadTimeDays?: number;
    specifications?: Record<string, string>;
}
export declare class CreateRFQDto {
    projectId: string;
    title: string;
    items: {
        productName: string;
        quantity: number;
        unit: string;
        specification?: string;
    }[];
    deadline: string;
}
export declare class SubmitRFQResponseDto {
    rfqId: string;
    items: {
        productName: string;
        quantity: number;
        unitPrice: number;
        unit: string;
        leadTimeDays: number;
    }[];
    validUntil: string;
    notes?: string;
}
export declare class CreatePurchaseOrderDto {
    projectId: string;
    supplierId: string;
    rfqResponseId?: string;
    items: {
        productId: string;
        productName: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        gstRate: number;
    }[];
    deliveryAddress: string;
    expectedDeliveryDate: string;
    termsAndConditions?: string;
}
export declare class UpdateDeliveryStatusDto {
    status: string;
    trackingNumber?: string;
    carrier?: string;
    driverName?: string;
    vehicleNumber?: string;
}
export declare class CreateGRNDto {
    poId: string;
    receivedItems: {
        productId: string;
        orderedQty: number;
        receivedQty: number;
        rejectedQty: number;
        reason?: string;
    }[];
    status: string;
    remarks?: string;
}
//# sourceMappingURL=materials.dto.d.ts.map