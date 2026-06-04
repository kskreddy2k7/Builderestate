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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyPropertyDto = exports.UpdatePropertyStatusDto = exports.CreateEnquiryDto = exports.PropertySearchDto = exports.UpdatePropertyDto = exports.CreatePropertyDto = exports.AddressDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class AddressDto {
    line1;
    line2;
    city;
    state;
    pincode;
    latitude;
    longitude;
    static _OPENAPI_METADATA_FACTORY() {
        return { line1: { required: true, type: () => String, minLength: 5 }, line2: { required: false, type: () => String }, city: { required: true, type: () => String, minLength: 2 }, state: { required: true, type: () => String, minLength: 2 }, pincode: { required: true, type: () => String }, latitude: { required: false, type: () => Number }, longitude: { required: false, type: () => Number } };
    }
}
exports.AddressDto = AddressDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], AddressDto.prototype, "line1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddressDto.prototype, "line2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], AddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], AddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AddressDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AddressDto.prototype, "longitude", void 0);
class CreatePropertyDto {
    title;
    description;
    type;
    transactionType;
    address;
    price;
    area;
    bhkType;
    bathrooms;
    balconies;
    facing;
    floorNumber;
    totalFloors;
    furnishingStatus;
    reraNumber;
    possessionDate;
    amenities;
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: true, type: () => String, minLength: 10, maxLength: 200 }, description: { required: true, type: () => String, minLength: 50 }, type: { required: true, type: () => Object }, transactionType: { required: true, type: () => Object }, address: { required: true, type: () => require("./marketplace.dto").AddressDto }, price: { required: true, type: () => Number, minimum: 1 }, area: { required: true, type: () => Number, minimum: 50, minimum: 1 }, bhkType: { required: false, type: () => String }, bathrooms: { required: false, type: () => Number, minimum: 1, maximum: 20 }, balconies: { required: false, type: () => Number, minimum: 0, maximum: 10 }, facing: { required: false, type: () => String }, floorNumber: { required: false, type: () => Number, minimum: 0, maximum: 200 }, totalFloors: { required: false, type: () => Number, minimum: 1, maximum: 200 }, furnishingStatus: { required: false, type: () => Object }, reraNumber: { required: false, type: () => String }, possessionDate: { required: false, type: () => String }, amenities: { required: false, type: () => [String] } };
    }
}
exports.CreatePropertyDto = CreatePropertyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Spacious 3BHK near Whitefield' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minLength: 50 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PropertyType }),
    (0, class_validator_1.IsEnum)(client_1.PropertyType),
    __metadata("design:type", typeof (_a = typeof client_1.PropertyType !== "undefined" && client_1.PropertyType) === "function" ? _a : Object)
], CreatePropertyDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.TransactionType }),
    (0, class_validator_1.IsEnum)(client_1.TransactionType),
    __metadata("design:type", typeof (_b = typeof client_1.TransactionType !== "undefined" && client_1.TransactionType) === "function" ? _b : Object)
], CreatePropertyDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: AddressDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    __metadata("design:type", AddressDto)
], CreatePropertyDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 8500000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1250, description: 'Square feet' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Min)(50),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '3BHK' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "bhkType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "bathrooms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(10),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "balconies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'EAST' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "facing", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 7 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "floorNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 12 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(200),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "totalFloors", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.FurnishingStatus }),
    (0, class_validator_1.IsEnum)(client_1.FurnishingStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_c = typeof client_1.FurnishingStatus !== "undefined" && client_1.FurnishingStatus) === "function" ? _c : Object)
], CreatePropertyDto.prototype, "furnishingStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'KA/RERA/12345' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "reraNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-12-31' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "possessionDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "amenities", void 0);
class UpdatePropertyDto extends (0, swagger_1.PartialType)(CreatePropertyDto) {
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => Object } };
    }
}
exports.UpdatePropertyDto = UpdatePropertyDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.PropertyStatus }),
    (0, class_validator_1.IsEnum)(client_1.PropertyStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_d = typeof client_1.PropertyStatus !== "undefined" && client_1.PropertyStatus) === "function" ? _d : Object)
], UpdatePropertyDto.prototype, "status", void 0);
class PropertySearchDto {
    search;
    type;
    transactionType;
    city;
    state;
    pincode;
    minPrice;
    maxPrice;
    minArea;
    maxArea;
    bhkType;
    reraVerified;
    lat;
    lng;
    radiusKm;
    page;
    limit;
    sortBy;
    sortOrder;
    static _OPENAPI_METADATA_FACTORY() {
        return { search: { required: false, type: () => String }, type: { required: false, type: () => Object }, transactionType: { required: false, type: () => Object }, city: { required: false, type: () => String }, state: { required: false, type: () => String }, pincode: { required: false, type: () => String }, minPrice: { required: false, type: () => Number }, maxPrice: { required: false, type: () => Number }, minArea: { required: false, type: () => Number }, maxArea: { required: false, type: () => Number }, bhkType: { required: false, type: () => String }, reraVerified: { required: false, type: () => Boolean }, lat: { required: false, type: () => Number }, lng: { required: false, type: () => Number }, radiusKm: { required: false, type: () => Number }, page: { required: false, type: () => Number, minimum: 1 }, limit: { required: false, type: () => Number, minimum: 1, maximum: 100 }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => Object } };
    }
}
exports.PropertySearchDto = PropertySearchDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PropertySearchDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.PropertyType }),
    (0, class_validator_1.IsEnum)(client_1.PropertyType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_e = typeof client_1.PropertyType !== "undefined" && client_1.PropertyType) === "function" ? _e : Object)
], PropertySearchDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.TransactionType }),
    (0, class_validator_1.IsEnum)(client_1.TransactionType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_f = typeof client_1.TransactionType !== "undefined" && client_1.TransactionType) === "function" ? _f : Object)
], PropertySearchDto.prototype, "transactionType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PropertySearchDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PropertySearchDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PropertySearchDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PropertySearchDto.prototype, "minPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PropertySearchDto.prototype, "maxPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PropertySearchDto.prototype, "minArea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PropertySearchDto.prototype, "maxArea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PropertySearchDto.prototype, "bhkType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], PropertySearchDto.prototype, "reraVerified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PropertySearchDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PropertySearchDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PropertySearchDto.prototype, "radiusKm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PropertySearchDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PropertySearchDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'createdAt' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PropertySearchDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'desc', enum: ['asc', 'desc'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PropertySearchDto.prototype, "sortOrder", void 0);
class CreateEnquiryDto {
    name;
    email;
    phone;
    message;
    budget;
    source;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 2 }, email: { required: true, type: () => String }, phone: { required: true, type: () => String }, message: { required: false, type: () => String }, budget: { required: false, type: () => Number }, source: { required: false, type: () => String } };
    }
}
exports.CreateEnquiryDto = CreateEnquiryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateEnquiryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEnquiryDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEnquiryDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEnquiryDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEnquiryDto.prototype, "budget", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 'PORTAL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEnquiryDto.prototype, "source", void 0);
class UpdatePropertyStatusDto {
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => Object } };
    }
}
exports.UpdatePropertyStatusDto = UpdatePropertyStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PropertyStatus }),
    (0, class_validator_1.IsEnum)(client_1.PropertyStatus),
    __metadata("design:type", typeof (_g = typeof client_1.PropertyStatus !== "undefined" && client_1.PropertyStatus) === "function" ? _g : Object)
], UpdatePropertyStatusDto.prototype, "status", void 0);
class VerifyPropertyDto {
    decision;
    reason;
    static _OPENAPI_METADATA_FACTORY() {
        return { decision: { required: true, type: () => Object }, reason: { required: false, type: () => String } };
    }
}
exports.VerifyPropertyDto = VerifyPropertyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['VERIFIED', 'REJECTED'] }),
    (0, class_validator_1.IsEnum)(['VERIFIED', 'REJECTED']),
    __metadata("design:type", String)
], VerifyPropertyDto.prototype, "decision", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], VerifyPropertyDto.prototype, "reason", void 0);
//# sourceMappingURL=marketplace.dto.js.map