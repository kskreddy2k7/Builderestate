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
exports.UpdateUnitPricingDto = exports.CreateExpenditureDto = exports.CreateProjectBudgetDto = exports.IssueDemandLetterDto = exports.RecordOfflinePaymentDto = exports.VerifyPaymentDto = exports.CreatePaymentOrderDto = exports.CancelBookingDto = exports.UpdateBookingStatusDto = exports.CreateBookingDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
// ─── Booking ──────────────────────────────────────────────────────────────────
class CreateBookingDto {
    unitId;
    buyerId;
    brokerId;
    agentId;
    bookingAmount;
    discountAmount;
    bookingDate;
    remarks;
    paymentSchedule;
    static _OPENAPI_METADATA_FACTORY() {
        return { unitId: { required: true, type: () => String }, buyerId: { required: true, type: () => String }, brokerId: { required: false, type: () => String }, agentId: { required: false, type: () => String }, bookingAmount: { required: true, type: () => Number, minimum: 1 }, discountAmount: { required: false, type: () => Number }, bookingDate: { required: false, type: () => String }, remarks: { required: false, type: () => String }, paymentSchedule: { required: false } };
    }
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "unitId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "brokerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "agentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "bookingAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "bookingDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateBookingDto.prototype, "paymentSchedule", void 0);
class UpdateBookingStatusDto {
    status;
    remarks;
    agreementDate;
    registrationDate;
    static _OPENAPI_METADATA_FACTORY() {
        return { status: { required: true, type: () => Object }, remarks: { required: false, type: () => String }, agreementDate: { required: false, type: () => String }, registrationDate: { required: false, type: () => String } };
    }
}
exports.UpdateBookingStatusDto = UpdateBookingStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.BookingStatus }),
    (0, class_validator_1.IsEnum)(client_1.BookingStatus),
    __metadata("design:type", typeof (_a = typeof client_1.BookingStatus !== "undefined" && client_1.BookingStatus) === "function" ? _a : Object)
], UpdateBookingStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "agreementDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateBookingStatusDto.prototype, "registrationDate", void 0);
class CancelBookingDto {
    reason;
    static _OPENAPI_METADATA_FACTORY() {
        return { reason: { required: true, type: () => String } };
    }
}
exports.CancelBookingDto = CancelBookingDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelBookingDto.prototype, "reason", void 0);
// ─── Payment ──────────────────────────────────────────────────────────────────
class CreatePaymentOrderDto {
    bookingId;
    scheduleItemId;
    static _OPENAPI_METADATA_FACTORY() {
        return { bookingId: { required: true, type: () => String }, scheduleItemId: { required: true, type: () => String } };
    }
}
exports.CreatePaymentOrderDto = CreatePaymentOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePaymentOrderDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePaymentOrderDto.prototype, "scheduleItemId", void 0);
class VerifyPaymentDto {
    razorpayOrderId;
    razorpayPaymentId;
    razorpaySignature;
    static _OPENAPI_METADATA_FACTORY() {
        return { razorpayOrderId: { required: true, type: () => String }, razorpayPaymentId: { required: true, type: () => String }, razorpaySignature: { required: true, type: () => String } };
    }
}
exports.VerifyPaymentDto = VerifyPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "razorpayOrderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "razorpayPaymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPaymentDto.prototype, "razorpaySignature", void 0);
class RecordOfflinePaymentDto {
    bookingId;
    scheduleItemId;
    amount;
    method;
    transactionRef;
    chequeNumber;
    bankName;
    paidAt;
    static _OPENAPI_METADATA_FACTORY() {
        return { bookingId: { required: true, type: () => String }, scheduleItemId: { required: true, type: () => String }, amount: { required: true, type: () => Number, minimum: 1 }, method: { required: true, type: () => Object }, transactionRef: { required: false, type: () => String }, chequeNumber: { required: false, type: () => String }, bankName: { required: false, type: () => String }, paidAt: { required: true, type: () => String } };
    }
}
exports.RecordOfflinePaymentDto = RecordOfflinePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RecordOfflinePaymentDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RecordOfflinePaymentDto.prototype, "scheduleItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], RecordOfflinePaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.PaymentMethod }),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    __metadata("design:type", typeof (_b = typeof client_1.PaymentMethod !== "undefined" && client_1.PaymentMethod) === "function" ? _b : Object)
], RecordOfflinePaymentDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RecordOfflinePaymentDto.prototype, "transactionRef", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RecordOfflinePaymentDto.prototype, "chequeNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RecordOfflinePaymentDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], RecordOfflinePaymentDto.prototype, "paidAt", void 0);
// ─── Demand Letter ────────────────────────────────────────────────────────────
class IssueDemandLetterDto {
    bookingId;
    scheduleItemId;
    dueDate;
    static _OPENAPI_METADATA_FACTORY() {
        return { bookingId: { required: true, type: () => String }, scheduleItemId: { required: true, type: () => String }, dueDate: { required: true, type: () => String } };
    }
}
exports.IssueDemandLetterDto = IssueDemandLetterDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], IssueDemandLetterDto.prototype, "bookingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], IssueDemandLetterDto.prototype, "scheduleItemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], IssueDemandLetterDto.prototype, "dueDate", void 0);
// ─── Budget ───────────────────────────────────────────────────────────────────
class CreateProjectBudgetDto {
    totalBudget;
    fiscalYear;
    heads;
    static _OPENAPI_METADATA_FACTORY() {
        return { totalBudget: { required: true, type: () => Number, minimum: 1 }, fiscalYear: { required: true, type: () => String }, heads: { required: false } };
    }
}
exports.CreateProjectBudgetDto = CreateProjectBudgetDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateProjectBudgetDto.prototype, "totalBudget", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectBudgetDto.prototype, "fiscalYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [Object] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectBudgetDto.prototype, "heads", void 0);
class CreateExpenditureDto {
    budgetHeadId;
    description;
    amount;
    gstAmount;
    vendorId;
    invoiceNumber;
    invoiceDate;
    static _OPENAPI_METADATA_FACTORY() {
        return { budgetHeadId: { required: true, type: () => String }, description: { required: true, type: () => String }, amount: { required: true, type: () => Number, minimum: 1 }, gstAmount: { required: false, type: () => Number }, vendorId: { required: false, type: () => String }, invoiceNumber: { required: false, type: () => String }, invoiceDate: { required: true, type: () => String } };
    }
}
exports.CreateExpenditureDto = CreateExpenditureDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateExpenditureDto.prototype, "budgetHeadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateExpenditureDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateExpenditureDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateExpenditureDto.prototype, "gstAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenditureDto.prototype, "vendorId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateExpenditureDto.prototype, "invoiceNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateExpenditureDto.prototype, "invoiceDate", void 0);
// ─── Unit Pricing ─────────────────────────────────────────────────────────────
class UpdateUnitPricingDto {
    basePrice;
    floorRisePremium;
    facingPremium;
    applyToAllSimilar;
    static _OPENAPI_METADATA_FACTORY() {
        return { basePrice: { required: false, type: () => Number }, floorRisePremium: { required: false, type: () => Number }, facingPremium: { required: false, type: () => Number }, applyToAllSimilar: { required: false, type: () => Boolean } };
    }
}
exports.UpdateUnitPricingDto = UpdateUnitPricingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateUnitPricingDto.prototype, "basePrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateUnitPricingDto.prototype, "floorRisePremium", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateUnitPricingDto.prototype, "facingPremium", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateUnitPricingDto.prototype, "applyToAllSimilar", void 0);
//# sourceMappingURL=erp.dto.js.map