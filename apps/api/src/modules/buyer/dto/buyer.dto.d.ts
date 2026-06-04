export declare class CreateComplaintDto {
    bookingId: string;
    category: string;
    subject: string;
    description: string;
    priority: string;
}
export declare class UpdateComplaintDto {
    status: string;
    resolutionNote?: string;
    assignedToId?: string;
}
export declare class AddComplaintUpdateDto {
    message: string;
    isInternal?: boolean;
}
export declare class CreateSnagItemDto {
    bookingId: string;
    unit: string;
    description: string;
    location: string;
    beforePhoto?: string;
}
export declare class UpdateSnagItemDto {
    status: string;
    afterPhoto?: string;
}
export declare class BuyerDashboardQueryDto {
    bookingId?: string;
}
//# sourceMappingURL=buyer.dto.d.ts.map