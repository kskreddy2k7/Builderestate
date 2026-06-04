import {
  IsString, IsEnum, IsOptional, IsArray,
  IsUUID, MinLength, MaxLength, IsInt, Min, Max,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateComplaintDto {
  @ApiProperty() @IsUUID() bookingId!: string
  @ApiProperty() @IsString() category!: string
  @ApiProperty() @IsString() @MinLength(5) @MaxLength(200) subject!: string
  @ApiProperty() @IsString() @MinLength(20) description!: string
  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }) priority!: string
}

export class UpdateComplaintDto {
  @ApiProperty({ enum: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] }) status!: string
  @ApiPropertyOptional() @IsString() @IsOptional() resolutionNote?: string
  @ApiPropertyOptional() @IsUUID() @IsOptional() assignedToId?: string
}

export class AddComplaintUpdateDto {
  @ApiProperty() @IsString() @MinLength(5) message!: string
  @ApiPropertyOptional({ default: false }) isInternal?: boolean
}

export class CreateSnagItemDto {
  @ApiProperty() @IsUUID() bookingId!: string
  @ApiProperty() @IsString() unit!: string
  @ApiProperty() @IsString() @MinLength(5) description!: string
  @ApiProperty() @IsString() location!: string
  @ApiPropertyOptional() @IsString() @IsOptional() beforePhoto?: string
}

export class UpdateSnagItemDto {
  @ApiProperty({ enum: ['IN_PROGRESS', 'FIXED', 'ACCEPTED'] }) status!: string
  @ApiPropertyOptional() @IsString() @IsOptional() afterPhoto?: string
}

export class BuyerDashboardQueryDto {
  @ApiPropertyOptional() @IsUUID() @IsOptional() bookingId?: string
}
