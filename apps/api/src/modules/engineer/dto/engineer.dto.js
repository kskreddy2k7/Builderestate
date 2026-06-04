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
exports.ProcessApprovalDto = exports.CreateApprovalDto = exports.CreateTestResultDto = exports.UpdateNCRDto = exports.CreateNCRDto = exports.CompleteInspectionDto = exports.CreateInspectionDto = exports.InspectionItemDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class InspectionItemDto {
    category;
    description;
    standard;
    result;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { category: { required: true, type: () => String }, description: { required: true, type: () => String }, standard: { required: true, type: () => String }, result: { required: true, type: () => String }, remarks: { required: false, type: () => String } };
    }
}
exports.InspectionItemDto = InspectionItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InspectionItemDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InspectionItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InspectionItemDto.prototype, "standard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PASS', 'FAIL', 'NA', 'PENDING'] }),
    __metadata("design:type", String)
], InspectionItemDto.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InspectionItemDto.prototype, "remarks", void 0);
class CreateInspectionDto {
    projectId;
    activity;
    location;
    tower;
    floor;
    unit;
    scheduledDate;
    checklistItems;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String }, activity: { required: true, type: () => String }, location: { required: true, type: () => String }, tower: { required: false, type: () => String }, floor: { required: false, type: () => Number }, unit: { required: false, type: () => String }, scheduledDate: { required: true, type: () => String }, checklistItems: { required: true, type: () => [require("./engineer.dto").InspectionItemDto] }, remarks: { required: false, type: () => String } };
    }
}
exports.CreateInspectionDto = CreateInspectionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "activity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "tower", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateInspectionDto.prototype, "floor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "scheduledDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [InspectionItemDto] }),
    __metadata("design:type", Array)
], CreateInspectionDto.prototype, "checklistItems", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInspectionDto.prototype, "remarks", void 0);
class CompleteInspectionDto {
    status;
    checklistItems;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => String }, checklistItems: { required: true, type: () => [require("./engineer.dto").InspectionItemDto] }, remarks: { required: false, type: () => String } };
    }
}
exports.CompleteInspectionDto = CompleteInspectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PASS', 'FAIL', 'CONDITIONAL_PASS'] }),
    __metadata("design:type", String)
], CompleteInspectionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [InspectionItemDto] }),
    __metadata("design:type", Array)
], CompleteInspectionDto.prototype, "checklistItems", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CompleteInspectionDto.prototype, "remarks", void 0);
class CreateNCRDto {
    inspectionId;
    issuedToId;
    description;
    severity;
    dueDate;
    static _OPENAPI_METADATA_FACTORY() {
        return { inspectionId: { required: true, type: () => String }, issuedToId: { required: true, type: () => String }, description: { required: true, type: () => String, minLength: 10 }, severity: { required: true, type: () => String }, dueDate: { required: true, type: () => String } };
    }
}
exports.CreateNCRDto = CreateNCRDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateNCRDto.prototype, "inspectionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateNCRDto.prototype, "issuedToId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateNCRDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['MINOR', 'MAJOR', 'CRITICAL'] }),
    __metadata("design:type", String)
], CreateNCRDto.prototype, "severity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateNCRDto.prototype, "dueDate", void 0);
class UpdateNCRDto {
    status;
    rootCause;
    correctiveAction;
    preventiveAction;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => String }, rootCause: { required: false, type: () => String }, correctiveAction: { required: false, type: () => String }, preventiveAction: { required: false, type: () => String } };
    }
}
exports.UpdateNCRDto = UpdateNCRDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['UNDER_REVIEW', 'RECTIFIED', 'CLOSED', 'DISPUTED'] }),
    __metadata("design:type", String)
], UpdateNCRDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateNCRDto.prototype, "rootCause", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateNCRDto.prototype, "correctiveAction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateNCRDto.prototype, "preventiveAction", void 0);
class CreateTestResultDto {
    projectId;
    inspectionId;
    testType;
    sampleId;
    location;
    date;
    result;
    unit;
    standardValue;
    status;
    labName;
    certificateUrl;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String }, inspectionId: { required: false, type: () => String }, testType: { required: true, type: () => String }, sampleId: { required: true, type: () => String }, location: { required: true, type: () => String }, date: { required: true, type: () => String }, result: { required: true, type: () => String }, unit: { required: true, type: () => String }, standardValue: { required: true, type: () => String }, status: { required: true, type: () => String }, labName: { required: false, type: () => String }, certificateUrl: { required: false, type: () => String } };
    }
}
exports.CreateTestResultDto = CreateTestResultDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "inspectionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "testType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "sampleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "standardValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PASS', 'FAIL'] }),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "labName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTestResultDto.prototype, "certificateUrl", void 0);
class CreateApprovalDto {
    projectId;
    type;
    location;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String }, type: { required: true, type: () => String }, location: { required: true, type: () => String } };
    }
}
exports.CreateApprovalDto = CreateApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateApprovalDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['POUR_CARD', 'SLAB', 'WATERPROOFING', 'ELECTRICAL', 'OTHER'] }),
    __metadata("design:type", String)
], CreateApprovalDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApprovalDto.prototype, "location", void 0);
class ProcessApprovalDto {
    status;
    rejectedReason;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => String }, rejectedReason: { required: false, type: () => String } };
    }
}
exports.ProcessApprovalDto = ProcessApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['APPROVED', 'REJECTED'] }),
    __metadata("design:type", String)
], ProcessApprovalDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProcessApprovalDto.prototype, "rejectedReason", void 0);
//# sourceMappingURL=engineer.dto.js.map