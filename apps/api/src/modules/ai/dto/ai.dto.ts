import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, IsInt, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CostEstimateRequestDto {
  @ApiProperty() @IsString() city!: string
  @ApiProperty() @IsString() state!: string
  @ApiProperty() @IsNumber() @Min(100) area!: number
  @ApiProperty({ enum: ['ECONOMY', 'STANDARD', 'PREMIUM', 'LUXURY'] }) specifications!: string
  @ApiProperty({ enum: ['RESIDENTIAL', 'COMMERCIAL', 'MIXED'] }) buildingType!: string
  @ApiProperty() @IsInt() @Min(1) @Max(60) floors!: number
  @ApiProperty() @IsBoolean() basementRequired!: boolean
  @ApiProperty() @IsBoolean() parkingRequired!: boolean
}

export class PropertyValuationDto {
  @ApiPropertyOptional() @IsString() @IsOptional() propertyId?: string
  @ApiProperty() @IsString() address!: string
  @ApiProperty() @IsNumber() @Min(50) area!: number
  @ApiProperty() @IsString() type!: string
  @ApiProperty() @IsString() city!: string
}

export class LeadScoreDto {
  @ApiProperty() @IsString() leadId!: string
}

export class DocumentAnalysisDto {
  @ApiProperty() @IsString() documentUrl!: string
  @ApiProperty({ enum: ['AGREEMENT', 'TITLE_DEED', 'RERA', 'NOC', 'OTHER'] }) documentType!: string
}

export class RiskAnalysisDto {
  @ApiProperty() @IsString() projectId!: string
}

export class ConstructionPlanDto {
  @ApiProperty() @IsString() projectId!: string
  @ApiProperty() @IsNumber() totalArea!: number
  @ApiProperty() @IsInt() numberOfFloors!: number
  @ApiProperty() @IsString() specifications!: string
}

export class AIChatDto {
  @ApiProperty() @IsString() message!: string
  @ApiPropertyOptional() @IsString() @IsOptional() context?: string
  @ApiPropertyOptional({ type: [Object] }) @IsOptional() history?: { role: string; content: string }[]
}
