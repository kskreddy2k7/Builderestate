import {
  IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray,
  IsUUID, Min, Max, MinLength, MaxLength, IsPositive, ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import {
  PropertyType, PropertyStatus, TransactionType,
  FurnishingStatus,
} from '@prisma/client'

export class AddressDto {
  @ApiProperty() @IsString() @MinLength(5) line1!: string
  @ApiPropertyOptional() @IsString() @IsOptional() line2?: string
  @ApiProperty() @IsString() @MinLength(2) city!: string
  @ApiProperty() @IsString() @MinLength(2) state!: string
  @ApiProperty() @IsString() pincode!: string
  @ApiPropertyOptional() @IsNumber() @IsOptional() latitude?: number
  @ApiPropertyOptional() @IsNumber() @IsOptional() longitude?: number
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'Spacious 3BHK near Whitefield' })
  @IsString() @MinLength(10) @MaxLength(200)
  title!: string

  @ApiProperty({ minLength: 50 })
  @IsString() @MinLength(50)
  description!: string

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type!: PropertyType

  @ApiProperty({ enum: TransactionType })
  @IsEnum(TransactionType)
  transactionType!: TransactionType

  @ApiProperty({ type: AddressDto })
  @ValidateNested() @Type(() => AddressDto)
  address!: AddressDto

  @ApiProperty({ example: 8500000 })
  @IsNumber() @IsPositive()
  price!: number

  @ApiProperty({ example: 1250, description: 'Square feet' })
  @IsNumber() @IsPositive() @Min(50)
  area!: number

  @ApiPropertyOptional({ example: '3BHK' })
  @IsString() @IsOptional()
  bhkType?: string

  @ApiPropertyOptional({ example: 3 })
  @IsNumber() @IsOptional() @Min(1) @Max(20)
  bathrooms?: number

  @ApiPropertyOptional({ example: 2 })
  @IsNumber() @IsOptional() @Min(0) @Max(10)
  balconies?: number

  @ApiPropertyOptional({ example: 'EAST' })
  @IsString() @IsOptional()
  facing?: string

  @ApiPropertyOptional({ example: 7 })
  @IsNumber() @IsOptional() @Min(0) @Max(200)
  floorNumber?: number

  @ApiPropertyOptional({ example: 12 })
  @IsNumber() @IsOptional() @Min(1) @Max(200)
  totalFloors?: number

  @ApiPropertyOptional({ enum: FurnishingStatus })
  @IsEnum(FurnishingStatus) @IsOptional()
  furnishingStatus?: FurnishingStatus

  @ApiPropertyOptional({ example: 'KA/RERA/12345' })
  @IsString() @IsOptional()
  reraNumber?: string

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsString() @IsOptional()
  possessionDate?: string

  @ApiPropertyOptional({ type: [String] })
  @IsArray() @IsString({ each: true }) @IsOptional()
  amenities?: string[]
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @ApiPropertyOptional({ enum: PropertyStatus })
  @IsEnum(PropertyStatus) @IsOptional()
  status?: PropertyStatus
}

export class PropertySearchDto {
  @ApiPropertyOptional() @IsString() @IsOptional() search?: string
  @ApiPropertyOptional({ enum: PropertyType }) @IsEnum(PropertyType) @IsOptional() type?: PropertyType
  @ApiPropertyOptional({ enum: TransactionType }) @IsEnum(TransactionType) @IsOptional() transactionType?: TransactionType
  @ApiPropertyOptional() @IsString() @IsOptional() city?: string
  @ApiPropertyOptional() @IsString() @IsOptional() state?: string
  @ApiPropertyOptional() @IsString() @IsOptional() pincode?: string
  @ApiPropertyOptional() @IsNumber() @Type(() => Number) @IsOptional() minPrice?: number
  @ApiPropertyOptional() @IsNumber() @Type(() => Number) @IsOptional() maxPrice?: number
  @ApiPropertyOptional() @IsNumber() @Type(() => Number) @IsOptional() minArea?: number
  @ApiPropertyOptional() @IsNumber() @Type(() => Number) @IsOptional() maxArea?: number
  @ApiPropertyOptional() @IsString() @IsOptional() bhkType?: string
  @ApiPropertyOptional() @IsBoolean() @Type(() => Boolean) @IsOptional() reraVerified?: boolean
  @ApiPropertyOptional() @IsNumber() @Type(() => Number) @IsOptional() lat?: number
  @ApiPropertyOptional() @IsNumber() @Type(() => Number) @IsOptional() lng?: number
  @ApiPropertyOptional() @IsNumber() @Type(() => Number) @IsOptional() radiusKm?: number
  @ApiPropertyOptional({ default: 1 }) @IsNumber() @Type(() => Number) @IsOptional() @Min(1) page?: number
  @ApiPropertyOptional({ default: 20 }) @IsNumber() @Type(() => Number) @IsOptional() @Min(1) @Max(100) limit?: number
  @ApiPropertyOptional({ default: 'createdAt' }) @IsString() @IsOptional() sortBy?: string
  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] }) @IsString() @IsOptional() sortOrder?: 'asc' | 'desc'
}

export class CreateEnquiryDto {
  @ApiProperty() @IsString() @MinLength(2) name!: string
  @ApiProperty() @IsString() email!: string
  @ApiProperty() @IsString() phone!: string
  @ApiPropertyOptional() @IsString() @IsOptional() message?: string
  @ApiPropertyOptional() @IsNumber() @IsOptional() budget?: number
  @ApiPropertyOptional({ default: 'PORTAL' }) @IsString() @IsOptional() source?: string
}

export class UpdatePropertyStatusDto {
  @ApiProperty({ enum: PropertyStatus }) @IsEnum(PropertyStatus) status!: PropertyStatus
}

export class VerifyPropertyDto {
  @ApiProperty({ enum: ['VERIFIED', 'REJECTED'] })
  @IsEnum(['VERIFIED', 'REJECTED'])
  decision!: 'VERIFIED' | 'REJECTED'

  @ApiPropertyOptional() @IsString() @IsOptional() reason?: string
}
