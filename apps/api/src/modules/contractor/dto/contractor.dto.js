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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessMaterialIndentDto = exports.CreateMaterialIndentDto = exports.ProcessRABillDto = exports.CreateRABillDto = exports.CreateLaborAttendanceDto = exports.UpdateWorkOrderDto = exports.CreateWorkOrderDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class CreateWorkOrderDto {
    projectId;
    contractorId;
    title;
    scope;
    startDate;
    endDate;
    contractValue;
    retentionPercentage;
    milestones;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String }, contractorId: { required: true, type: () => String }, title: { required: true, type: () => String, minLength: 5 }, scope: { required: true, type: () => String, minLength: 10 }, startDate: { required: true, type: () => String }, endDate: { required: true, type: () => String }, contractValue: { required: true, type: () => Number, minimum: 1 }, retentionPercentage: { required: false, type: () => Number }, milestones: { required: false } };
    }
}
exports.CreateWorkOrderDto = CreateWorkOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "contractorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "scope", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateWorkOrderDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateWorkOrderDto.prototype, "contractValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateWorkOrderDto.prototype, "retentionPercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateWorkOrderDto.prototype, "milestones", void 0);
class UpdateWorkOrderDto extends (0, swagger_1.PartialType)(CreateWorkOrderDto) {
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: false, type: () => Object } };
    }
}
exports.UpdateWorkOrderDto = UpdateWorkOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.WorkOrderStatus }),
    (0, class_validator_1.IsEnum)(client_1.WorkOrderStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof client_1.WorkOrderStatus !== "undefined" && client_1.WorkOrderStatus) === "function" ? _a : Object)
], UpdateWorkOrderDto.prototype, "status", void 0);
class CreateLaborAttendanceDto {
    projectId;
    contractorId;
    date;
    labourBreakdown;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String }, contractorId: { required: true, type: () => String }, date: { required: true, type: () => String }, labourBreakdown: { required: true } };
    }
}
exports.CreateLaborAttendanceDto = CreateLaborAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLaborAttendanceDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateLaborAttendanceDto.prototype, "contractorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateLaborAttendanceDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    __metadata("design:type", Array)
], CreateLaborAttendanceDto.prototype, "labourBreakdown", void 0);
class CreateRABillDto {
    workOrderId;
    grossAmount;
    billDate;
    previouslyPaid;
    static _OPENAPI_METADATA_FACTORY() {
        return { workOrderId: { required: true, type: () => String }, grossAmount: { required: true, type: () => Number, minimum: 1 }, billDate: { required: true, type: () => String }, previouslyPaid: { required: false, type: () => Number } };
    }
}
exports.CreateRABillDto = CreateRABillDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRABillDto.prototype, "workOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateRABillDto.prototype, "grossAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRABillDto.prototype, "billDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRABillDto.prototype, "previouslyPaid", void 0);
class ProcessRABillDto {
    status;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => String }, remarks: { required: false, type: () => String } };
    }
}
exports.ProcessRABillDto = ProcessRABillDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['CERTIFIED', 'REJECTED'] }),
    __metadata("design:type", String)
], ProcessRABillDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProcessRABillDto.prototype, "remarks", void 0);
class CreateMaterialIndentDto {
    projectId;
    contractorId;
    items;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String }, contractorId: { required: true, type: () => String }, items: { required: true }, remarks: { required: false, type: () => String } };
    }
}
exports.CreateMaterialIndentDto = CreateMaterialIndentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMaterialIndentDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMaterialIndentDto.prototype, "contractorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [Object] }),
    __metadata("design:type", Array)
], CreateMaterialIndentDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMaterialIndentDto.prototype, "remarks", void 0);
class ProcessMaterialIndentDto {
    status;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => String }, remarks: { required: false, type: () => String } };
    }
}
exports.ProcessMaterialIndentDto = ProcessMaterialIndentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['APPROVED', 'REJECTED'] }),
    __metadata("design:type", String)
], ProcessMaterialIndentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProcessMaterialIndentDto.prototype, "remarks", void 0);
//# sourceMappingURL=contractor.dto.js.map