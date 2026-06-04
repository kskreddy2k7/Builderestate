"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateGRNDto = exports.UpdateDeliveryStatusDto = exports.CreatePurchaseOrderDto = exports.SubmitRFQResponseDto = exports.CreateRFQDto = exports.CreateProductDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateProductDto {
    categoryId;
    name;
    description;
    unit;
    basePrice;
    gstRate;
    moq;
    leadTimeDays;
    specifications;
    static _OPENAPI_METADATA_FACTORY() {
        return { categoryId: { required: true, type: () => String }, name: { required: true, type: () => String, minLength: 3 }, description: { required: false, type: () => String }, unit: { required: true, type: () => String }, basePrice: { required: true, type: () => Number, minimum: 1 }, gstRate: { required: true, type: () => Number }, moq: { required: false, type: () => Number }, leadTimeDays: { required: false, type: () => Number }, specifications: { required: false, type: () => Object } };
    }
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "gstRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "moq", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "leadTimeDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], CreateProductDto.prototype, "specifications", void 0);
class CreateRFQDto {
    projectId;
    title;
    items;
    deadline;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String }, title: { required: true, type: () => String }, items: { required: true }, deadline: { required: true, type: () => String } };
    }
}
exports.CreateRFQDto = CreateRFQDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRFQDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRFQDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    __metadata("design:type", Array)
], CreateRFQDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRFQDto.prototype, "deadline", void 0);
class SubmitRFQResponseDto {
    rfqId;
    items;
    validUntil;
    notes;
    static _OPENAPI_METADATA_FACTORY() {
        return { rfqId: { required: true, type: () => String }, items: { required: true }, validUntil: { required: true, type: () => String }, notes: { required: false, type: () => String } };
    }
}
exports.SubmitRFQResponseDto = SubmitRFQResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SubmitRFQResponseDto.prototype, "rfqId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    __metadata("design:type", Array)
], SubmitRFQResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SubmitRFQResponseDto.prototype, "validUntil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitRFQResponseDto.prototype, "notes", void 0);
class CreatePurchaseOrderDto {
    projectId;
    supplierId;
    rfqResponseId;
    items;
    deliveryAddress;
    expectedDeliveryDate;
    termsAndConditions;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String }, supplierId: { required: true, type: () => String }, rfqResponseId: { required: false, type: () => String }, items: { required: true }, deliveryAddress: { required: true, type: () => String }, expectedDeliveryDate: { required: true, type: () => String }, termsAndConditions: { required: false, type: () => String } };
    }
}
exports.CreatePurchaseOrderDto = CreatePurchaseOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "supplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "rfqResponseId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    __metadata("design:type", Array)
], CreatePurchaseOrderDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "deliveryAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePurchaseOrderDto.prototype, "termsAndConditions", void 0);
class UpdateDeliveryStatusDto {
    status;
    trackingNumber;
    carrier;
    driverName;
    vehicleNumber;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => String }, trackingNumber: { required: false, type: () => String }, carrier: { required: false, type: () => String }, driverName: { required: false, type: () => String }, vehicleNumber: { required: false, type: () => String } };
    }
}
exports.UpdateDeliveryStatusDto = UpdateDeliveryStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['DISPATCHED', 'IN_TRANSIT', 'DELIVERED'] }),
    __metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "trackingNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "carrier", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "driverName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "vehicleNumber", void 0);
class CreateGRNDto {
    poId;
    receivedItems;
    status;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { poId: { required: true, type: () => String }, receivedItems: { required: true }, status: { required: true, type: () => String }, remarks: { required: false, type: () => String } };
    }
}
exports.CreateGRNDto = CreateGRNDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateGRNDto.prototype, "poId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    __metadata("design:type", Array)
], CreateGRNDto.prototype, "receivedItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ACCEPTED', 'PARTIALLY_ACCEPTED', 'REJECTED'] }),
    __metadata("design:type", String)
], CreateGRNDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGRNDto.prototype, "remarks", void 0);
//# sourceMappingURL=materials.dto.js.map