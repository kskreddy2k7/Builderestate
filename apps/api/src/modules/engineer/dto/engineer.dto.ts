import {
  IsString, IsEnum, IsOptional, IsArray, IsDateString,
  IsUUID, IsInt, Min, Max, IsNumber, MinLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'

export class InspectionItemDto {
  @ApiProperty() @IsString() category!: string
  @ApiProperty() @IsString() description!: string
  @ApiProperty() @IsString() standard!: string
  @ApiProperty({ enum: ['PASS', 'FAIL', 'NA', 'PENDING'] }) result!: string
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}

export class CreateInspectionDto {
  @ApiProperty() @IsUUID() projectId!: string
  @ApiProperty() @IsString() activity!: string
  @ApiProperty() @IsString() location!: string
  @ApiPropertyOptional() @IsString() @IsOptional() tower?: string
  @ApiPropertyOptional() @IsInt() @IsOptional() floor?: number
  @ApiPropertyOptional() @IsString() @IsOptional() unit?: string
  @ApiProperty() @IsDateString() scheduledDate!: string
  @ApiProperty({ type: [InspectionItemDto] }) checklistItems!: InspectionItemDto[]
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}

export class CompleteInspectionDto {
  @ApiProperty({ enum: ['PASS', 'FAIL', 'CONDITIONAL_PASS'] }) status!: string
  @ApiProperty({ type: [InspectionItemDto] }) checklistItems!: InspectionItemDto[]
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}

export class CreateNCRDto {
  @ApiProperty() @IsUUID() inspectionId!: string
  @ApiProperty() @IsUUID() issuedToId!: string
  @ApiProperty() @IsString() @MinLength(10) description!: string
  @ApiProperty({ enum: ['MINOR', 'MAJOR', 'CRITICAL'] }) severity!: string
  @ApiProperty() @IsDateString() dueDate!: string
}

export class UpdateNCRDto {
  @ApiProperty({ enum: ['UNDER_REVIEW', 'RECTIFIED', 'CLOSED', 'DISPUTED'] }) status!: string
  @ApiPropertyOptional() @IsString() @IsOptional() rootCause?: string
  @ApiPropertyOptional() @IsString() @IsOptional() correctiveAction?: string
  @ApiPropertyOptional() @IsString() @IsOptional() preventiveAction?: string
}

export class CreateTestResultDto {
  @ApiProperty() @IsUUID() projectId!: string
  @ApiPropertyOptional() @IsUUID() @IsOptional() inspectionId?: string
  @ApiProperty() @IsString() testType!: string
  @ApiProperty() @IsString() sampleId!: string
  @ApiProperty() @IsString() location!: string
  @ApiProperty() @IsDateString() date!: string
  @ApiProperty() @IsString() result!: string
  @ApiProperty() @IsString() unit!: string
  @ApiProperty() @IsString() standardValue!: string
  @ApiProperty({ enum: ['PASS', 'FAIL'] }) status!: string
  @ApiPropertyOptional() @IsString() @IsOptional() labName?: string
  @ApiPropertyOptional() @IsString() @IsOptional() certificateUrl?: string
}

export class CreateApprovalDto {
  @ApiProperty() @IsUUID() projectId!: string
  @ApiProperty({ enum: ['POUR_CARD', 'SLAB', 'WATERPROOFING', 'ELECTRICAL', 'OTHER'] }) type!: string
  @ApiProperty() @IsString() location!: string
}

export class ProcessApprovalDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] }) status!: string
  @ApiPropertyOptional() @IsString() @IsOptional() rejectedReason?: string
}
