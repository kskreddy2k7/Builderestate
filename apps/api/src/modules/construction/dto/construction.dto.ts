import {
  IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray,
  IsDateString, IsUUID, Min, Max, MinLength, MaxLength, IsInt,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { ProjectStatus, MilestoneStatus } from '@prisma/client'

// ─── Project ──────────────────────────────────────────────────────────────────

export class CreateProjectDto {
  @ApiProperty() @IsString() @MinLength(5) @MaxLength(200) name!: string
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string
  @ApiProperty() @IsString() @MinLength(5) addressLine1!: string
  @ApiProperty() @IsString() city!: string
  @ApiProperty() @IsString() state!: string
  @ApiProperty() @IsString() pincode!: string
  @ApiPropertyOptional() @IsNumber() @IsOptional() latitude?: number
  @ApiPropertyOptional() @IsNumber() @IsOptional() longitude?: number
  @ApiProperty({ example: 45000 }) @IsNumber() @IsOptional() totalArea?: number
  @ApiPropertyOptional() @IsString() @IsOptional() reraNumber?: string
  @ApiProperty() @IsDateString() startDate!: string
  @ApiProperty() @IsDateString() expectedCompletionDate!: string
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() amenities?: string[]
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiPropertyOptional({ enum: ProjectStatus }) @IsEnum(ProjectStatus) @IsOptional() status?: ProjectStatus
}

// ─── Tower / Floor / Unit ────────────────────────────────────────────────────

export class CreateTowerDto {
  @ApiProperty() @IsString() @MinLength(1) name!: string
  @ApiProperty() @IsInt() @Min(1) @Max(100) numberOfFloors!: number
  @ApiProperty() @IsInt() @Min(1) @Max(50) numberOfUnitsPerFloor!: number
  @ApiPropertyOptional() @IsUUID() @IsOptional() phaseId?: string
}

export class CreateUnitDto {
  @ApiProperty() @IsString() unitNumber!: string
  @ApiProperty() @IsString() bhkType!: string
  @ApiProperty() @IsNumber() @Min(50) area!: number
  @ApiPropertyOptional() @IsNumber() @IsOptional() carpetArea?: number
  @ApiPropertyOptional() @IsString() @IsOptional() facing?: string
  @ApiProperty() @IsNumber() @IsOptional() basePrice!: number
  @ApiPropertyOptional() @IsNumber() @IsOptional() floorRisePremium?: number
  @ApiPropertyOptional() @IsNumber() @IsOptional() facingPremium?: number
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() amenities?: string[]
  @ApiPropertyOptional() @IsString() @IsOptional() floorPlanUrl?: string
}

// ─── Milestone ────────────────────────────────────────────────────────────────

export class CreateMilestoneDto {
  @ApiProperty() @IsString() @MinLength(3) name!: string
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string
  @ApiProperty() @IsDateString() plannedStartDate!: string
  @ApiProperty() @IsDateString() plannedEndDate!: string
  @ApiPropertyOptional() @IsNumber() @IsOptional() linkedPaymentPercentage?: number
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() dependencies?: string[]
  @ApiPropertyOptional() @IsUUID() @IsOptional() phaseId?: string
}

export class UpdateMilestoneDto extends PartialType(CreateMilestoneDto) {
  @ApiPropertyOptional({ enum: MilestoneStatus }) @IsEnum(MilestoneStatus) @IsOptional() status?: MilestoneStatus
  @ApiPropertyOptional() @IsInt() @Min(0) @Max(100) @IsOptional() completionPercentage?: number
  @ApiPropertyOptional() @IsDateString() @IsOptional() actualStartDate?: string
  @ApiPropertyOptional() @IsDateString() @IsOptional() actualEndDate?: string
}

// ─── Progress Update ──────────────────────────────────────────────────────────

export class CreateProgressUpdateDto {
  @ApiProperty() @IsString() @MinLength(5) title!: string
  @ApiProperty() @IsString() @MinLength(10) description!: string
  @ApiProperty() @IsInt() @Min(0) @Max(100) completionPercentage!: number
  @ApiPropertyOptional() @IsUUID() @IsOptional() milestoneId?: string
  @ApiPropertyOptional({ default: true }) @IsBoolean() @IsOptional() isVisibleToBuyers?: boolean
}

// ─── Daily Site Report ────────────────────────────────────────────────────────

export class CreateDSRDto {
  @ApiProperty() @IsDateString() reportDate!: string
  @ApiPropertyOptional() @IsString() @IsOptional() weather?: string
  @ApiProperty() @IsInt() @Min(0) totalLabour!: number
  @ApiPropertyOptional() @IsArray() @IsOptional() labourBreakdown?: { trade: string; count: number }[]
  @ApiProperty() @IsString() @MinLength(10) workDone!: string
  @ApiPropertyOptional() @IsArray() @IsOptional() materialsUsed?: { material: string; quantity: number; unit: string }[]
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() equipmentUsed?: string[]
  @ApiPropertyOptional() @IsString() @IsOptional() issues?: string
}

export class ApproveDSRDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] }) status!: 'APPROVED' | 'REJECTED'
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}

// ─── Quality Check ────────────────────────────────────────────────────────────

export class QualityCheckItemDto {
  @ApiProperty() @IsString() description!: string
  @ApiProperty({ enum: ['PASS', 'FAIL', 'NA'] }) status!: 'PASS' | 'FAIL' | 'NA'
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}

export class CreateQualityCheckDto {
  @ApiProperty() @IsString() activity!: string
  @ApiProperty() @IsString() location!: string
  @ApiProperty({ type: [QualityCheckItemDto] }) checklistItems!: QualityCheckItemDto[]
  @ApiProperty({ enum: ['PASS', 'FAIL', 'REWORK_REQUIRED'] }) overallStatus!: string
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}
