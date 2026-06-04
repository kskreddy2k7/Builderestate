import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

export class RegisterDto {
  @ApiProperty({ example: 'Ravi Kumar' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string

  @ApiProperty({ example: 'ravi@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Matches(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian mobile number' })
  phone!: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  orgName?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  referralCode?: string
}

export class LoginDto {
  @ApiProperty({ example: 'ravi@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  refreshToken!: string
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ravi@example.com' })
  @IsEmail()
  email!: string
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  token!: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string

  @ApiProperty()
  @IsString()
  @MinLength(1)
  confirmPassword!: string
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  token!: string
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  otp!: string
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  currentPassword!: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string
}
