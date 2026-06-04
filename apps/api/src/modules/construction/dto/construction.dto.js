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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateQualityCheckDto = exports.QualityCheckItemDto = exports.ApproveDSRDto = exports.CreateDSRDto = exports.CreateProgressUpdateDto = exports.UpdateMilestoneDto = exports.CreateMilestoneDto = exports.CreateUnitDto = exports.CreateTowerDto = exports.UpdateProjectDto = exports.CreateProjectDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
// ─── Project ──────────────────────────────────────────────────────────────────
class CreateProjectDto {
    name;
    description;
    addressLine1;
    city;
    state;
    pincode;
    latitude;
    longitude;
    totalArea;
    reraNumber;
    startDate;
    expectedCompletionDate;
    amenities;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 5, maxLength: 200 }, description: { required: false, type: () => String }, addressLine1: { required: true, type: () => String, minLength: 5 }, city: { required: true, type: () => String }, state: { required: true, type: () => String }, pincode: { required: true, type: () => String }, latitude: { required: false, type: () => Number }, longitude: { required: false, type: () => Number }, totalArea: { required: false, type: () => Number }, reraNumber: { required: false, type: () => String }, startDate: { required: true, type: () => String }, expectedCompletionDate: { required: true, type: () => String }, amenities: { required: false, type: () => [String] } };
    }
}
exports.CreateProjectDto = CreateProjectDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "addressLine1", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "pincode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 45000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "totalArea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "reraNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "expectedCompletionDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "amenities", void 0);
class UpdateProjectDto extends (0, swagger_1.PartialType)(CreateProjectDto) {
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => Object } };
    }
}
exports.UpdateProjectDto = UpdateProjectDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ProjectStatus }),
    (0, class_validator_1.IsEnum)(client_1.ProjectStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof client_1.ProjectStatus !== "undefined" && client_1.ProjectStatus) === "function" ? _a : Object)
], UpdateProjectDto.prototype, "status", void 0);
// ─── Tower / Floor / Unit ────────────────────────────────────────────────────
class CreateTowerDto {
    name;
    numberOfFloors;
    numberOfUnitsPerFloor;
    phaseId;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 1 }, numberOfFloors: { required: true, type: () => Number, minimum: 1, maximum: 100 }, numberOfUnitsPerFloor: { required: true, type: () => Number, minimum: 1, maximum: 50 }, phaseId: { required: false, type: () => String } };
    }
}
exports.CreateTowerDto = CreateTowerDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "numberOfFloors", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateTowerDto.prototype, "numberOfUnitsPerFloor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTowerDto.prototype, "phaseId", void 0);
class CreateUnitDto {
    unitNumber;
    bhkType;
    area;
    carpetArea;
    facing;
    basePrice;
    floorRisePremium;
    facingPremium;
    amenities;
    floorPlanUrl;
    static _OPENAPI_METADATA_FACTORY() {
        return { unitNumber: { required: true, type: () => String }, bhkType: { required: true, type: () => String }, area: { required: true, type: () => Number, minimum: 50 }, carpetArea: { required: false, type: () => Number }, facing: { required: false, type: () => String }, basePrice: { required: true, type: () => Number }, floorRisePremium: { required: false, type: () => Number }, facingPremium: { required: false, type: () => Number }, amenities: { required: false, type: () => [String] }, floorPlanUrl: { required: false, type: () => String } };
    }
}
exports.CreateUnitDto = CreateUnitDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnitDto.prototype, "unitNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUnitDto.prototype, "bhkType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(50),
    __metadata("design:type", Number)
], CreateUnitDto.prototype, "area", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateUnitDto.prototype, "carpetArea", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUnitDto.prototype, "facing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateUnitDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateUnitDto.prototype, "floorRisePremium", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateUnitDto.prototype, "facingPremium", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateUnitDto.prototype, "amenities", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUnitDto.prototype, "floorPlanUrl", void 0);
// ─── Milestone ────────────────────────────────────────────────────────────────
class CreateMilestoneDto {
    name;
    description;
    plannedStartDate;
    plannedEndDate;
    linkedPaymentPercentage;
    dependencies;
    phaseId;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 3 }, description: { required: false, type: () => String }, plannedStartDate: { required: true, type: () => String }, plannedEndDate: { required: true, type: () => String }, linkedPaymentPercentage: { required: false, type: () => Number }, dependencies: { required: false, type: () => [String] }, phaseId: { required: false, type: () => String } };
    }
}
exports.CreateMilestoneDto = CreateMilestoneDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "plannedStartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "plannedEndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMilestoneDto.prototype, "linkedPaymentPercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateMilestoneDto.prototype, "dependencies", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMilestoneDto.prototype, "phaseId", void 0);
class UpdateMilestoneDto extends (0, swagger_1.PartialType)(CreateMilestoneDto) {
    status;
    completionPercentage;
    actualStartDate;
    actualEndDate;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => Object }, completionPercentage: { required: false, type: () => Number, minimum: 0, maximum: 100 }, actualStartDate: { required: false, type: () => String }, actualEndDate: { required: false, type: () => String } };
    }
}
exports.UpdateMilestoneDto = UpdateMilestoneDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.MilestoneStatus }),
    (0, class_validator_1.IsEnum)(client_1.MilestoneStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_b = typeof client_1.MilestoneStatus !== "undefined" && client_1.MilestoneStatus) === "function" ? _b : Object)
], UpdateMilestoneDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateMilestoneDto.prototype, "completionPercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMilestoneDto.prototype, "actualStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMilestoneDto.prototype, "actualEndDate", void 0);
// ─── Progress Update ──────────────────────────────────────────────────────────
class CreateProgressUpdateDto {
    title;
    description;
    completionPercentage;
    milestoneId;
    isVisibleToBuyers;
    static _OPENAPI_METADATA_FACTORY() {
        return { title: { required: true, type: () => String, minLength: 5 }, description: { required: true, type: () => String, minLength: 10 }, completionPercentage: { required: true, type: () => Number, minimum: 0, maximum: 100 }, milestoneId: { required: false, type: () => String }, isVisibleToBuyers: { required: false, type: () => Boolean } };
    }
}
exports.CreateProgressUpdateDto = CreateProgressUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateProgressUpdateDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateProgressUpdateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateProgressUpdateDto.prototype, "completionPercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProgressUpdateDto.prototype, "milestoneId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateProgressUpdateDto.prototype, "isVisibleToBuyers", void 0);
// ─── Daily Site Report ────────────────────────────────────────────────────────
class CreateDSRDto {
    reportDate;
    weather;
    totalLabour;
    labourBreakdown;
    workDone;
    materialsUsed;
    equipmentUsed;
    issues;
    static _OPENAPI_METADATA_FACTORY() {
        return { reportDate: { required: true, type: () => String }, weather: { required: false, type: () => String }, totalLabour: { required: true, type: () => Number, minimum: 0 }, labourBreakdown: { required: false }, workDone: { required: true, type: () => String, minLength: 10 }, materialsUsed: { required: false }, equipmentUsed: { required: false, type: () => [String] }, issues: { required: false, type: () => String } };
    }
}
exports.CreateDSRDto = CreateDSRDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDSRDto.prototype, "reportDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDSRDto.prototype, "weather", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDSRDto.prototype, "totalLabour", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDSRDto.prototype, "labourBreakdown", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateDSRDto.prototype, "workDone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDSRDto.prototype, "materialsUsed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDSRDto.prototype, "equipmentUsed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDSRDto.prototype, "issues", void 0);
class ApproveDSRDto {
    status;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => Object }, remarks: { required: false, type: () => String } };
    }
}
exports.ApproveDSRDto = ApproveDSRDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['APPROVED', 'REJECTED'] }),
    __metadata("design:type", String)
], ApproveDSRDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ApproveDSRDto.prototype, "remarks", void 0);
// ─── Quality Check ────────────────────────────────────────────────────────────
class QualityCheckItemDto {
    description;
    status;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { description: { required: true, type: () => String }, status: { required: true, type: () => Object }, remarks: { required: false, type: () => String } };
    }
}
exports.QualityCheckItemDto = QualityCheckItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QualityCheckItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PASS', 'FAIL', 'NA'] }),
    __metadata("design:type", String)
], QualityCheckItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], QualityCheckItemDto.prototype, "remarks", void 0);
class CreateQualityCheckDto {
    activity;
    location;
    checklistItems;
    overallStatus;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { activity: { required: true, type: () => String }, location: { required: true, type: () => String }, checklistItems: { required: true, type: () => [require("./construction.dto").QualityCheckItemDto] }, overallStatus: { required: true, type: () => String }, remarks: { required: false, type: () => String } };
    }
}
exports.CreateQualityCheckDto = CreateQualityCheckDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQualityCheckDto.prototype, "activity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQualityCheckDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [QualityCheckItemDto] }),
    __metadata("design:type", Array)
], CreateQualityCheckDto.prototype, "checklistItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PASS', 'FAIL', 'REWORK_REQUIRED'] }),
    __metadata("design:type", String)
], CreateQualityCheckDto.prototype, "overallStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQualityCheckDto.prototype, "remarks", void 0);
//# sourceMappingURL=construction.dto.js.map