import {
  IsString, IsEnum, IsNumber, IsOptional, IsArray,
  IsDateString, IsUUID, Min, IsInt, IsPositive, MinLength,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { WorkOrderStatus } from '@prisma/client'

export class CreateWorkOrderDto {
  @ApiProperty() @IsUUID() projectId!: string
  @ApiProperty() @IsUUID() contractorId!: string
  @ApiProperty() @IsString() @MinLength(5) title!: string
  @ApiProperty() @IsString() @MinLength(10) scope!: string
  @ApiProperty() @IsDateString() startDate!: string
  @ApiProperty() @IsDateString() endDate!: string
  @ApiProperty() @IsNumber() @IsPositive() contractValue!: number
  @ApiPropertyOptional({ default: 5 }) @IsNumber() @IsOptional() retentionPercentage?: number
  @ApiPropertyOptional({ type: [Object] }) @IsArray() @IsOptional()
  milestones?: { description: string; percentage: number; amount: number }[]
}

export class UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto) {
  @ApiPropertyOptional({ enum: WorkOrderStatus })
  @IsEnum(WorkOrderStatus) @IsOptional()
  status?: WorkOrderStatus
}

export class CreateLaborAttendanceDto {
  @ApiProperty() @IsUUID() projectId!: string
  @ApiProperty() @IsUUID() contractorId!: string
  @ApiProperty() @IsDateString() date!: string
  @ApiProperty({ type: [Object] })
  labourBreakdown!: { trade: string; present: number; absent: number }[]
}

export class CreateRABillDto {
  @ApiProperty() @IsUUID() workOrderId!: string
  @ApiProperty() @IsNumber() @IsPositive() grossAmount!: number
  @ApiProperty() @IsDateString() billDate!: string
  @ApiPropertyOptional() @IsNumber() @IsOptional() previouslyPaid?: number
}

export class ProcessRABillDto {
  @ApiProperty({ enum: ['CERTIFIED', 'REJECTED'] }) status!: string
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}

export class CreateMaterialIndentDto {
  @ApiProperty() @IsUUID() projectId!: string
  @ApiProperty() @IsUUID() contractorId!: string
  @ApiProperty({ type: [Object] })
  items!: { material: string; quantity: number; unit: string; specification?: string }[]
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}

export class ProcessMaterialIndentDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] }) status!: string
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}
