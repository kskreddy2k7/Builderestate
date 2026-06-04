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
exports.BuyerDashboardQueryDto = exports.UpdateSnagItemDto = exports.CreateSnagItemDto = exports.AddComplaintUpdateDto = exports.UpdateComplaintDto = exports.CreateComplaintDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateComplaintDto {
    bookingId;
    category;
    subject;
    description;
    priority;
    static _OPENAPI_METADATA_FACTORY() {
        return { bookingId: { required: true, type: () => String }, category: { required: true, type: () => String }, subject: { required: true, type: () => String, minLength: 5, maxLength: 200 }, description: { required: true, type: () => String, minLength: 20 }, priority: { required: true, type: () => String } };
    }
}
exports.CreateComplaintDto = CreateComplaintDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateComplaintDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateComplaintDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateComplaintDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    __metadata("design:type", String)
], CreateComplaintDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }),
    __metadata("design:type", String)
], CreateComplaintDto.prototype, "priority", void 0);
class UpdateComplaintDto {
    status;
    resolutionNote;
    assignedToId;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => String }, resolutionNote: { required: false, type: () => String }, assignedToId: { required: false, type: () => String } };
    }
}
exports.UpdateComplaintDto = UpdateComplaintDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] }),
    __metadata("design:type", String)
], UpdateComplaintDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateComplaintDto.prototype, "resolutionNote", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateComplaintDto.prototype, "assignedToId", void 0);
class AddComplaintUpdateDto {
    message;
    isInternal;
    static _OPENAPI_METADATA_FACTORY() {
        return { message: { required: true, type: () => String, minLength: 5 }, isInternal: { required: false, type: () => Boolean } };
    }
}
exports.AddComplaintUpdateDto = AddComplaintUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], AddComplaintUpdateDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    __metadata("design:type", Boolean)
], AddComplaintUpdateDto.prototype, "isInternal", void 0);
class CreateSnagItemDto {
    bookingId;
    unit;
    description;
    location;
    beforePhoto;
    static _OPENAPI_METADATA_FACTORY() {
        return { bookingId: { required: true, type: () => String }, unit: { required: true, type: () => String }, description: { required: true, type: () => String, minLength: 5 }, location: { required: true, type: () => String }, beforePhoto: { required: false, type: () => String } };
    }
}
exports.CreateSnagItemDto = CreateSnagItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSnagItemDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSnagItemDto.prototype, "unit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateSnagItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSnagItemDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSnagItemDto.prototype, "beforePhoto", void 0);
class UpdateSnagItemDto {
    status;
    afterPhoto;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => String }, afterPhoto: { required: false, type: () => String } };
    }
}
exports.UpdateSnagItemDto = UpdateSnagItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['IN_PROGRESS', 'FIXED', 'ACCEPTED'] }),
    __metadata("design:type", String)
], UpdateSnagItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSnagItemDto.prototype, "afterPhoto", void 0);
class BuyerDashboardQueryDto {
    bookingId;
    static _OPENAPI_METADATA_FACTORY() {
        return { bookingId: { required: false, type: () => String } };
    }
}
exports.BuyerDashboardQueryDto = BuyerDashboardQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BuyerDashboardQueryDto.prototype, "bookingId", void 0);
//# sourceMappingURL=buyer.dto.js.map