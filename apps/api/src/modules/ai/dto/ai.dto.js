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
exports.AIChatDto = exports.ConstructionPlanDto = exports.RiskAnalysisDto = exports.DocumentAnalysisDto = exports.LeadScoreDto = exports.PropertyValuationDto = exports.CostEstimateRequestDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CostEstimateRequestDto {
    city;
    state;
    area;
    specifications;
    buildingType;
    floors;
    basementRequired;
    parkingRequired;
    static _OPENAPI_METADATA_FACTORY() {
        return { city: { required: true, type: () => String }, state: { required: true, type: () => String }, area: { required: true, type: () => Number, minimum: 100 }, specifications: { required: true, type: () => String }, buildingType: { required: true, type: () => String }, floors: { required: true, type: () => Number, minimum: 1, maximum: 60 }, basementRequired: { required: true, type: () => Boolean }, parkingRequired: { required: true, type: () => Boolean } };
    }
}
exports.CostEstimateRequestDto = CostEstimateRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CostEstimateRequestDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CostEstimateRequestDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    __metadata("design:type", Number)
], CostEstimateRequestDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ECONOMY', 'STANDARD', 'PREMIUM', 'LUXURY'] }),
    __metadata("design:type", String)
], CostEstimateRequestDto.prototype, "specifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['RESIDENTIAL', 'COMMERCIAL', 'MIXED'] }),
    __metadata("design:type", String)
], CostEstimateRequestDto.prototype, "buildingType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], CostEstimateRequestDto.prototype, "floors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CostEstimateRequestDto.prototype, "basementRequired", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CostEstimateRequestDto.prototype, "parkingRequired", void 0);
class PropertyValuationDto {
    propertyId;
    address;
    area;
    type;
    city;
    static _OPENAPI_METADATA_FACTORY() {
        return { propertyId: { required: false, type: () => String }, address: { required: true, type: () => String }, area: { required: true, type: () => Number, minimum: 50 }, type: { required: true, type: () => String }, city: { required: true, type: () => String } };
    }
}
exports.PropertyValuationDto = PropertyValuationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PropertyValuationDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyValuationDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    __metadata("design:type", Number)
], PropertyValuationDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyValuationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PropertyValuationDto.prototype, "city", void 0);
class LeadScoreDto {
    leadId;
    static _OPENAPI_METADATA_FACTORY() {
        return { leadId: { required: true, type: () => String } };
    }
}
exports.LeadScoreDto = LeadScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadScoreDto.prototype, "leadId", void 0);
class DocumentAnalysisDto {
    documentUrl;
    documentType;
    static _OPENAPI_METADATA_FACTORY() {
        return { documentUrl: { required: true, type: () => String }, documentType: { required: true, type: () => String } };
    }
}
exports.DocumentAnalysisDto = DocumentAnalysisDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentAnalysisDto.prototype, "documentUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['AGREEMENT', 'TITLE_DEED', 'RERA', 'NOC', 'OTHER'] }),
    __metadata("design:type", String)
], DocumentAnalysisDto.prototype, "documentType", void 0);
class RiskAnalysisDto {
    projectId;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String } };
    }
}
exports.RiskAnalysisDto = RiskAnalysisDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RiskAnalysisDto.prototype, "projectId", void 0);
class ConstructionPlanDto {
    projectId;
    totalArea;
    numberOfFloors;
    specifications;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String }, totalArea: { required: true, type: () => Number }, numberOfFloors: { required: true, type: () => Number }, specifications: { required: true, type: () => String } };
    }
}
exports.ConstructionPlanDto = ConstructionPlanDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConstructionPlanDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConstructionPlanDto.prototype, "totalArea", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], ConstructionPlanDto.prototype, "numberOfFloors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConstructionPlanDto.prototype, "specifications", void 0);
class AIChatDto {
    message;
    context;
    history;
    static _OPENAPI_METADATA_FACTORY() {
        return { message: { required: true, type: () => String }, context: { required: false, type: () => String }, history: { required: false } };
    }
}
exports.AIChatDto = AIChatDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AIChatDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AIChatDto.prototype, "context", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AIChatDto.prototype, "history", void 0);
//# sourceMappingURL=ai.dto.js.map