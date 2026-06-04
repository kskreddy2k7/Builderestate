import {
  IsString, IsEnum, IsNumber, IsOptional, IsArray,
  IsDateString, IsUUID, IsInt, IsPositive, MinLength, IsBoolean,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { OrderStatus } from '@prisma/client'

export class CreateProductDto {
  @ApiProperty() @IsUUID() categoryId!: string
  @ApiProperty() @IsString() @MinLength(3) name!: string
  @ApiProperty() @IsString() description?: string
  @ApiProperty() @IsString() unit!: string
  @ApiProperty() @IsNumber() @IsPositive() basePrice!: number
  @ApiProperty() @IsNumber() gstRate!: number
  @ApiPropertyOptional() @IsInt() @IsOptional() moq?: number
  @ApiPropertyOptional() @IsInt() @IsOptional() leadTimeDays?: number
  @ApiPropertyOptional() specifications?: Record<string, string>
}

export class CreateRFQDto {
  @ApiProperty() @IsUUID() projectId!: string
  @ApiProperty() @IsString() title!: string
  @ApiProperty({ type: [Object] })
  items!: { productName: string; quantity: number; unit: string; specification?: string }[]
  @ApiProperty() @IsDateString() deadline!: string
}

export class SubmitRFQResponseDto {
  @ApiProperty() @IsUUID() rfqId!: string
  @ApiProperty({ type: [Object] })
  items!: { productName: string; quantity: number; unitPrice: number; unit: string; leadTimeDays: number }[]
  @ApiProperty() @IsDateString() validUntil!: string
  @ApiPropertyOptional() @IsString() @IsOptional() notes?: string
}

export class CreatePurchaseOrderDto {
  @ApiProperty() @IsUUID() projectId!: string
  @ApiProperty() @IsUUID() supplierId!: string
  @ApiPropertyOptional() @IsUUID() @IsOptional() rfqResponseId?: string
  @ApiProperty({ type: [Object] })
  items!: { productId: string; productName: string; quantity: number; unit: string; unitPrice: number; gstRate: number }[]
  @ApiProperty() @IsString() deliveryAddress!: string
  @ApiProperty() @IsDateString() expectedDeliveryDate!: string
  @ApiPropertyOptional() @IsString() @IsOptional() termsAndConditions?: string
}

export class UpdateDeliveryStatusDto {
  @ApiProperty({ enum: ['DISPATCHED', 'IN_TRANSIT', 'DELIVERED'] }) status!: string
  @ApiPropertyOptional() @IsString() @IsOptional() trackingNumber?: string
  @ApiPropertyOptional() @IsString() @IsOptional() carrier?: string
  @ApiPropertyOptional() @IsString() @IsOptional() driverName?: string
  @ApiPropertyOptional() @IsString() @IsOptional() vehicleNumber?: string
}

export class CreateGRNDto {
  @ApiProperty() @IsUUID() poId!: string
  @ApiProperty({ type: [Object] })
  receivedItems!: { productId: string; orderedQty: number; receivedQty: number; rejectedQty: number; reason?: string }[]
  @ApiProperty({ enum: ['ACCEPTED', 'PARTIALLY_ACCEPTED', 'REJECTED'] }) status!: string
  @ApiPropertyOptional() @IsString() @IsOptional() remarks?: string
}
