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
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadFilterDto = exports.UpdateCustomerDto = exports.CreateCustomerDto = exports.RecordCommissionPaymentDto = exports.UpdateCommissionStatusDto = exports.CreateCommissionDto = exports.CompleteSiteVisitDto = exports.ScheduleSiteVisitDto = exports.CreateActivityDto = exports.TransferLeadDto = exports.UpdateLeadDto = exports.CreateLeadDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
// ─── Lead ─────────────────────────────────────────────────────────────────────
class CreateLeadDto {
    name;
    email;
    phone;
    alternatePhone;
    source;
    stage;
    budgetMin;
    budgetMax;
    preferredLocations;
    preferredBhk;
    propertyId;
    projectId;
    assignedToId;
    notes;
    nextFollowUpDate;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 2, maxLength: 100 }, email: { required: false, type: () => String }, phone: { required: true, type: () => String, pattern: "/^[6-9]\\d{9}$/" }, alternatePhone: { required: false, type: () => String }, source: { required: true, type: () => Object }, stage: { required: false, type: () => Object }, budgetMin: { required: false, type: () => Number, minimum: 0 }, budgetMax: { required: false, type: () => Number, minimum: 0 }, preferredLocations: { required: false, type: () => [String] }, preferredBhk: { required: false, type: () => [String] }, propertyId: { required: false, type: () => String }, projectId: { required: false, type: () => String }, assignedToId: { required: false, type: () => String }, notes: { required: false, type: () => String }, nextFollowUpDate: { required: false, type: () => String } };
    }
}
exports.CreateLeadDto = CreateLeadDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian mobile number' }),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "alternatePhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.LeadSource }),
    (0, class_validator_1.IsEnum)(client_1.LeadSource),
    __metadata("design:type", typeof (_a = typeof client_1.LeadSource !== "undefined" && client_1.LeadSource) === "function" ? _a : Object)
], CreateLeadDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.LeadStage }),
    (0, class_validator_1.IsEnum)(client_1.LeadStage),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_b = typeof client_1.LeadStage !== "undefined" && client_1.LeadStage) === "function" ? _b : Object)
], CreateLeadDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLeadDto.prototype, "budgetMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLeadDto.prototype, "budgetMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLeadDto.prototype, "preferredLocations", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateLeadDto.prototype, "preferredBhk", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "propertyId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "nextFollowUpDate", void 0);
class UpdateLeadDto extends (0, swagger_1.PartialType)(CreateLeadDto) {
    stage;
    score;
    lostReason;
    static _OPENAPI_METADATA_FACTORY() {
        return { stage: { required: false, type: () => Object }, score: { required: false, type: () => Number, minimum: 0, maximum: 100 }, lostReason: { required: false, type: () => String } };
    }
}
exports.UpdateLeadDto = UpdateLeadDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.LeadStage }),
    (0, class_validator_1.IsEnum)(client_1.LeadStage),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_c = typeof client_1.LeadStage !== "undefined" && client_1.LeadStage) === "function" ? _c : Object)
], UpdateLeadDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateLeadDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "lostReason", void 0);
class TransferLeadDto {
    toUserId;
    note;
    static _OPENAPI_METADATA_FACTORY() {
        return { toUserId: { required: true, type: () => String }, note: { required: false, type: () => String } };
    }
}
exports.TransferLeadDto = TransferLeadDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TransferLeadDto.prototype, "toUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransferLeadDto.prototype, "note", void 0);
// ─── Lead Activity ────────────────────────────────────────────────────────────
class CreateActivityDto {
    type;
    title;
    description;
    outcome;
    nextAction;
    nextActionDate;
    static _OPENAPI_METADATA_FACTORY() {
        return { type: { required: true, type: () => String }, title: { required: true, type: () => String, minLength: 3 }, description: { required: false, type: () => String }, outcome: { required: false, type: () => String }, nextAction: { required: false, type: () => String }, nextActionDate: { required: false, type: () => String } };
    }
}
exports.CreateActivityDto = CreateActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['CALL', 'EMAIL', 'WHATSAPP', 'MEETING', 'SITE_VISIT', 'FOLLOW_UP', 'NOTE', 'STAGE_CHANGE', 'DOCUMENT_SHARED'],
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "outcome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "nextAction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "nextActionDate", void 0);
// ─── Site Visit ───────────────────────────────────────────────────────────────
class ScheduleSiteVisitDto {
    projectId;
    scheduledAt;
    conductedById;
    static _OPENAPI_METADATA_FACTORY() {
        return { projectId: { required: true, type: () => String }, scheduledAt: { required: true, type: () => String }, conductedById: { required: false, type: () => String } };
    }
}
exports.ScheduleSiteVisitDto = ScheduleSiteVisitDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ScheduleSiteVisitDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ScheduleSiteVisitDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ScheduleSiteVisitDto.prototype, "conductedById", void 0);
class CompleteSiteVisitDto {
    feedback;
    rating;
    interestedUnits;
    status;
    static _OPENAPI_METADATA_FACTORY() {
        return { feedback: { required: false, type: () => String }, rating: { required: false, type: () => Number, minimum: 1, maximum: 5 }, interestedUnits: { required: false, type: () => [String] }, status: { required: true, type: () => String } };
    }
}
exports.CompleteSiteVisitDto = CompleteSiteVisitDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CompleteSiteVisitDto.prototype, "feedback", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CompleteSiteVisitDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CompleteSiteVisitDto.prototype, "interestedUnits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] }),
    __metadata("design:type", String)
], CompleteSiteVisitDto.prototype, "status", void 0);
// ─── Commission ───────────────────────────────────────────────────────────────
class CreateCommissionDto {
    bookingId;
    agentId;
    percentage;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { bookingId: { required: true, type: () => String }, agentId: { required: false, type: () => String }, percentage: { required: true, type: () => Number }, remarks: { required: false, type: () => String } };
    }
}
exports.CreateCommissionDto = CreateCommissionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "agentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCommissionDto.prototype, "percentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCommissionDto.prototype, "remarks", void 0);
class UpdateCommissionStatusDto {
    status;
    remarks;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => String }, remarks: { required: false, type: () => String } };
    }
}
exports.UpdateCommissionStatusDto = UpdateCommissionStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['APPROVED', 'ON_HOLD', 'CANCELLED'] }),
    __metadata("design:type", String)
], UpdateCommissionStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCommissionStatusDto.prototype, "remarks", void 0);
class RecordCommissionPaymentDto {
    commissionId;
    paymentReference;
    invoiceNumber;
    invoiceUrl;
    static _OPENAPI_METADATA_FACTORY() {
        return { commissionId: { required: true, type: () => String }, paymentReference: { required: true, type: () => String }, invoiceNumber: { required: true, type: () => String }, invoiceUrl: { required: false, type: () => String } };
    }
}
exports.RecordCommissionPaymentDto = RecordCommissionPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RecordCommissionPaymentDto.prototype, "commissionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordCommissionPaymentDto.prototype, "paymentReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordCommissionPaymentDto.prototype, "invoiceNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RecordCommissionPaymentDto.prototype, "invoiceUrl", void 0);
// ─── Customer ─────────────────────────────────────────────────────────────────
class CreateCustomerDto {
    name;
    email;
    phone;
    pan;
    aadhaar;
    occupation;
    annualIncome;
    tags;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String, minLength: 2 }, email: { required: true, type: () => String }, phone: { required: true, type: () => String }, pan: { required: false, type: () => String }, aadhaar: { required: false, type: () => String }, occupation: { required: false, type: () => String }, annualIncome: { required: false, type: () => Number }, tags: { required: false, type: () => [String] } };
    }
}
exports.CreateCustomerDto = CreateCustomerDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "pan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "aadhaar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCustomerDto.prototype, "occupation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateCustomerDto.prototype, "annualIncome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateCustomerDto.prototype, "tags", void 0);
class UpdateCustomerDto extends (0, swagger_1.PartialType)(CreateCustomerDto) {
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.UpdateCustomerDto = UpdateCustomerDto;
// ─── Lead Score ───────────────────────────────────────────────────────────────
class LeadFilterDto {
    search;
    stage;
    source;
    assignedToId;
    projectId;
    followUpFrom;
    followUpTo;
    overdueFollowUp;
    page;
    limit;
    sortBy;
    sortOrder;
    static _OPENAPI_METADATA_FACTORY() {
        return { search: { required: false, type: () => String }, stage: { required: false, type: () => Object }, source: { required: false, type: () => Object }, assignedToId: { required: false, type: () => String }, projectId: { required: false, type: () => String }, followUpFrom: { required: false, type: () => String }, followUpTo: { required: false, type: () => String }, overdueFollowUp: { required: false, type: () => Boolean }, page: { required: false, type: () => Number }, limit: { required: false, type: () => Number }, sortBy: { required: false, type: () => String }, sortOrder: { required: false, type: () => Object } };
    }
}
exports.LeadFilterDto = LeadFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.LeadStage }),
    (0, class_validator_1.IsEnum)(client_1.LeadStage),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_d = typeof client_1.LeadStage !== "undefined" && client_1.LeadStage) === "function" ? _d : Object)
], LeadFilterDto.prototype, "stage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.LeadSource }),
    (0, class_validator_1.IsEnum)(client_1.LeadSource),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_e = typeof client_1.LeadSource !== "undefined" && client_1.LeadSource) === "function" ? _e : Object)
], LeadFilterDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "assignedToId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "followUpFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "followUpTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], LeadFilterDto.prototype, "overdueFollowUp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LeadFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], LeadFilterDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['asc', 'desc'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeadFilterDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=crm.dto.js.map