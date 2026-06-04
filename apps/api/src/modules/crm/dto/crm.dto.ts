import {
  IsString, IsEnum, IsNumber, IsOptional, IsArray,
  IsDateString, IsUUID, Min, Max, MinLength, MaxLength,
  IsEmail, Matches, IsInt, IsBoolean,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { LeadStage, LeadSource } from '@prisma/client'

// ─── Lead ─────────────────────────────────────────────────────────────────────

export class CreateLeadDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name!: string

  @ApiPropertyOptional()
  @IsEmail() @IsOptional()
  email?: string

  @ApiProperty()
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian mobile number' })
  phone!: string

  @ApiPropertyOptional() @IsString() @IsOptional() alternatePhone?: string

  @ApiProperty({ enum: LeadSource }) @IsEnum(LeadSource) source!: LeadSource

  @ApiPropertyOptional({ enum: LeadStage })
  @IsEnum(LeadStage) @IsOptional()
  stage?: LeadStage

  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) budgetMin?: number
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Min(0) budgetMax?: number

  @ApiPropertyOptional({ type: [String] })
  @IsArray() @IsString({ each: true }) @IsOptional()
  preferredLocations?: string[]

  @ApiPropertyOptional({ type: [String] })
  @IsArray() @IsString({ each: true }) @IsOptional()
  preferredBhk?: string[]

  @ApiPropertyOptional() @IsUUID() @IsOptional() propertyId?: string
  @ApiPropertyOptional() @IsUUID() @IsOptional() projectId?: string
  @ApiPropertyOptional() @IsUUID() @IsOptional() assignedToId?: string

  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string
  @ApiPropertyOptional() @IsDateString() @IsOptional() nextFollowUpDate?: string
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiPropertyOptional({ enum: LeadStage })
  @IsEnum(LeadStage) @IsOptional()
  stage?: LeadStage

  @ApiPropertyOptional() @IsInt() @Min(0) @Max(100) @IsOptional() score?: number
  @ApiPropertyOptional() @IsString() @IsOptional() lostReason?: string
}

export class TransferLeadDto {
  @ApiProperty() @IsUUID() toUserId!: string
  @ApiPropertyOptional() @IsString() @IsOptional() note?: string
}

// ─── Lead Activity ────────────────────────────────────────────────────────────

export class CreateActivityDto {
  @ApiProperty({
    enum: ['CALL', 'EMAIL', 'WHATSAPP', 'MEETING', 'SITE_VISIT', 'FOLLOW_UP', 'NOTE', 'STAGE_CHANGE', 'DOCUMENT_SHARED'],
  })
  @IsString()
  type!: string

  @ApiProperty() @IsString() @MinLength(3) title!: string
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string
  @ApiPropertyOptional() @IsString() @IsOptional() outcome?: string
  @ApiPropertyOptional() @IsString() @IsOptional() nextAction?: string
  @ApiPropertyOptional() @IsDateString() @IsOptional() nextActionDate?: string
}

// ─── Site Visit ───────────────────────────────────────────────────────────────

export class ScheduleSiteVisitDto {
  @ApiProperty() @IsUUID() projectId!: string
  @ApiProperty() @IsDateString() scheduledAt!: string
  @ApiPropertyOptional() @IsUUID() @IsOptional() conductedById?: string
}

export class CompleteSiteVisitDto {
  @ApiPropertyOptional() @IsString() @IsOptional() feedback?: string
  @ApiPropertyOptional() @IsInt() @Min(1) @Max(5) @IsOptional() rating?: number
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() interestedUnits?: string[]
  @ApiProperty({ enum: ['COMPLETED', 'CANCELLED', 'NO_SHOW'] }) status!: string
}

// ─── Commission ───────────────────────────────────────────────────────────────

export class CreateCommissionDto {
  @ApiProperty() @IsUUID() bookingId!: string
  @ApiPropertyOptional() @IsUUID() @IsOptional() agentId?: string
  @ApiProperty() @IsNumber() @IsOptional() percentage!: number
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}

export class UpdateCommissionStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'ON_HOLD', 'CANCELLED'] }) status!: string
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}

export class RecordCommissionPaymentDto {
  @ApiProperty() @IsUUID() commissionId!: string
  @ApiProperty() @IsString() paymentReference!: string
  @ApiProperty() @IsString() invoiceNumber!: string
  @ApiPropertyOptional() @IsString() @IsOptional() invoiceUrl?: string
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export class CreateCustomerDto {
  @ApiProperty() @IsString() @MinLength(2) name!: string
  @ApiProperty() @IsEmail() email!: string
  @ApiProperty() @IsString() phone!: string
  @ApiPropertyOptional() @IsString() @IsOptional() pan?: string
  @ApiPropertyOptional() @IsString() @IsOptional() aadhaar?: string
  @ApiPropertyOptional() @IsString() @IsOptional() occupation?: string
  @ApiPropertyOptional() @IsNumber() @IsOptional() annualIncome?: number
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() tags?: string[]
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

// ─── Lead Score ───────────────────────────────────────────────────────────────

export class LeadFilterDto {
  @ApiPropertyOptional() @IsString() @IsOptional() search?: string
  @ApiPropertyOptional({ enum: LeadStage }) @IsEnum(LeadStage) @IsOptional() stage?: LeadStage
  @ApiPropertyOptional({ enum: LeadSource }) @IsEnum(LeadSource) @IsOptional() source?: LeadSource
  @ApiPropertyOptional() @IsUUID() @IsOptional() assignedToId?: string
  @ApiPropertyOptional() @IsUUID() @IsOptional() projectId?: string
  @ApiPropertyOptional() @IsDateString() @IsOptional() followUpFrom?: string
  @ApiPropertyOptional() @IsDateString() @IsOptional() followUpTo?: string
  @ApiPropertyOptional() @IsBoolean() @Type(() => Boolean) @IsOptional() overdueFollowUp?: boolean
  @ApiPropertyOptional({ default: 1 }) @IsInt() @Type(() => Number) @IsOptional() page?: number
  @ApiPropertyOptional({ default: 20 }) @IsInt() @Type(() => Number) @IsOptional() limit?: number
  @ApiPropertyOptional() @IsString() @IsOptional() sortBy?: string
  @ApiPropertyOptional({ enum: ['asc', 'desc'] }) @IsString() @IsOptional() sortOrder?: 'asc' | 'desc'
}
