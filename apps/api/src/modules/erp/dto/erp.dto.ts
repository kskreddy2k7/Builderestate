import {
  IsString, IsEnum, IsNumber, IsOptional, IsArray,
  IsDateString, IsUUID, Min, IsPositive, IsBoolean, IsInt,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { BookingStatus, PaymentMethod } from '@prisma/client'

// ─── Booking ──────────────────────────────────────────────────────────────────

export class CreateBookingDto {
  @ApiProperty() @IsUUID() unitId!: string
  @ApiProperty() @IsUUID() buyerId!: string
  @ApiPropertyOptional() @IsUUID() @IsOptional() brokerId?: string
  @ApiPropertyOptional() @IsUUID() @IsOptional() agentId?: string
  @ApiProperty() @IsNumber() @IsPositive() bookingAmount!: number
  @ApiPropertyOptional() @IsNumber() @IsOptional() discountAmount?: number
  @ApiPropertyOptional() @IsDateString() @IsOptional() bookingDate?: string
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
  @ApiPropertyOptional({ type: [Object] })
  @IsArray() @IsOptional()
  paymentSchedule?: {
    milestone: string
    percentage: number
    dueDate: string
    milestoneId?: string
  }[]
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus }) @IsEnum(BookingStatus) status!: BookingStatus
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
  @ApiPropertyOptional() @IsDateString() @IsOptional() agreementDate?: string
  @ApiPropertyOptional() @IsDateString() @IsOptional() registrationDate?: string
}

export class CancelBookingDto {
  @ApiProperty() @IsString() reason!: string
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export class CreatePaymentOrderDto {
  @ApiProperty() @IsUUID() bookingId!: string
  @ApiProperty() @IsUUID() scheduleItemId!: string
}

export class VerifyPaymentDto {
  @ApiProperty() @IsString() razorpayOrderId!: string
  @ApiProperty() @IsString() razorpayPaymentId!: string
  @ApiProperty() @IsString() razorpaySignature!: string
}

export class RecordOfflinePaymentDto {
  @ApiProperty() @IsUUID() bookingId!: string
  @ApiProperty() @IsUUID() scheduleItemId!: string
  @ApiProperty() @IsNumber() @IsPositive() amount!: number
  @ApiProperty({ enum: PaymentMethod }) @IsEnum(PaymentMethod) method!: PaymentMethod
  @ApiPropertyOptional() @IsString() @IsOptional() transactionRef?: string
  @ApiPropertyOptional() @IsString() @IsOptional() chequeNumber?: string
  @ApiPropertyOptional() @IsString() @IsOptional() bankName?: string
  @ApiProperty() @IsDateString() paidAt!: string
}

// ─── Demand Letter ────────────────────────────────────────────────────────────

export class IssueDemandLetterDto {
  @ApiProperty() @IsUUID() bookingId!: string
  @ApiProperty() @IsUUID() scheduleItemId!: string
  @ApiProperty() @IsDateString() dueDate!: string
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export class CreateProjectBudgetDto {
  @ApiProperty() @IsNumber() @IsPositive() totalBudget!: number
  @ApiProperty() @IsString() fiscalYear!: string
  @ApiPropertyOptional({ type: [Object] })
  @IsArray() @IsOptional()
  heads?: {
    name: string
    category: string
    allocatedAmount: number
  }[]
}

export class CreateExpenditureDto {
  @ApiProperty() @IsUUID() budgetHeadId!: string
  @ApiProperty() @IsString() description!: string
  @ApiProperty() @IsNumber() @IsPositive() amount!: number
  @ApiPropertyOptional() @IsNumber() @IsOptional() gstAmount?: number
  @ApiPropertyOptional() @IsUUID() @IsOptional() vendorId?: string
  @ApiPropertyOptional() @IsString() @IsOptional() invoiceNumber?: string
  @ApiProperty() @IsDateString() invoiceDate!: string
}

// ─── Unit Pricing ─────────────────────────────────────────────────────────────

export class UpdateUnitPricingDto {
  @ApiPropertyOptional() @IsNumber() @IsOptional() basePrice?: number
  @ApiPropertyOptional() @IsNumber() @IsOptional() floorRisePremium?: number
  @ApiPropertyOptional() @IsNumber() @IsOptional() facingPremium?: number
  @ApiPropertyOptional() @IsBoolean() @IsOptional() applyToAllSimilar?: boolean
}
