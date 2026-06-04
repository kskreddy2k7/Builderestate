import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import { NotificationsService } from '@/shared/notifications/notifications.service'
import { UserRole, UserStatus, NotificationType } from '@prisma/client'
import type {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto'
import type { GoogleUser } from './strategies/google.strategy'
import type { RequestUser } from '@/common/decorators'

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  user: {
    id: string
    name: string
    email: string
    phone: string
    roles: UserRole[]
    orgId?: string
    orgName?: string
    avatar?: string
    isEmailVerified: boolean
    isPhoneVerified: boolean
  }
  tokens: TokenPair
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly SALT_ROUNDS = 12
  private readonly RESET_TOKEN_TTL = 3600 // 1 hour
  private readonly VERIFY_TOKEN_TTL = 86400 // 24 hours

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly notifications: NotificationsService,
  ) {}

  // ─── Register ─────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email.toLowerCase() }, { phone: dto.phone }] },
    })

    if (existing) {
      if (existing.email === dto.email.toLowerCase()) {
        throw new ConflictException('Email already registered')
      }
      throw new ConflictException('Phone number already registered')
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS)
    const emailVerifyToken = uuidv4()

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          passwordHash,
          roles: [dto.role],
          emailVerifyToken,
        },
      })

      // Create org if needed
      if (dto.orgName) {
        const orgType = this.roleToOrgType(dto.role)
        const slug = `${dto.orgName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
        const org = await tx.organization.create({
          data: {
            name: dto.orgName,
            slug,
            type: orgType as any,
            members: {
              create: { userId: newUser.id, role: dto.role },
            },
          },
        })
        await tx.user.update({
          where: { id: newUser.id },
          data: { orgMemberships: { connect: { id: org.id } } },
        })
      }

      return tx.user.findUniqueOrThrow({
        where: { id: newUser.id },
        include: { orgMemberships: { include: { org: true } } },
      })
    })

    // Queue verification email
    await this.redis.set(
      this.redis.key('email-verify', emailVerifyToken),
      user.id,
      this.VERIFY_TOKEN_TTL,
    )

    await this.notifications.queueEmail({
      to: user.email,
      subject: 'Verify your BuildEstate account',
      html: this.buildVerifyEmailHtml(user.name, emailVerifyToken),
    })

    const orgMembership = user.orgMemberships[0]
    return this.buildAuthResponse(user, orgMembership?.org?.name)
  }

  // ─── Login ────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, ipAddress: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { orgMemberships: { include: { org: true } } },
    })

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordValid) throw new UnauthorizedException('Invalid email or password')

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Your account has been suspended')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const orgMembership = user.orgMemberships[0]
    const response = await this.buildAuthResponse(user, orgMembership?.org?.name)

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: response.tokens.refreshToken,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    return response
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  async googleLogin(googleUser: GoogleUser): Promise<AuthResponse> {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email.toLowerCase() },
      include: { orgMemberships: { include: { org: true } } },
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email.toLowerCase(),
          phone: '',
          avatar: googleUser.avatar,
          isEmailVerified: true,
          status: UserStatus.ACTIVE,
          roles: [UserRole.BUYER],
        },
        include: { orgMemberships: { include: { org: true } } },
      })
    }

    return this.buildAuthResponse(user, user.orgMemberships[0]?.org?.name)
  }

  // ─── Refresh Token ────────────────────────────────────────────────────────

  async refresh(dto: RefreshTokenDto): Promise<TokenPair> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: { user: { include: { orgMemberships: true } } },
    })

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired')
    }

    // Rotate refresh token
    const newRefreshToken = uuidv4()
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    })

    await this.prisma.refreshToken.create({
      data: {
        userId: stored.userId,
        token: newRefreshToken,
        ipAddress: stored.ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const orgId = stored.user.orgMemberships[0]?.orgId
    const sessionId = uuidv4()
    const accessToken = this.signAccessToken(stored.user, orgId, sessionId)

    return { accessToken, refreshToken: newRefreshToken, expiresIn: 900 }
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout(user: RequestUser, refreshToken?: string): Promise<void> {
    // Revoke session
    await this.redis.sadd(
      this.redis.key('revoked-sessions'),
      user.sessionId,
    )
    await this.redis.expire(this.redis.key('revoked-sessions'), 900)

    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId: user.id },
        data: { revokedAt: new Date() },
      })
    }
  }

  // ─── Password Reset ───────────────────────────────────────────────────────

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) return

    const token = uuidv4()
    await this.redis.set(
      this.redis.key('password-reset', token),
      user.id,
      this.RESET_TOKEN_TTL,
    )

    const resetUrl = `${this.config.get('FRONTEND_URL')}/auth/reset-password?token=${token}`
    await this.notifications.queueEmail({
      to: user.email,
      subject: 'Reset your BuildEstate password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    })
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match')
    }

    const userId = await this.redis.get<string>(
      this.redis.key('password-reset', dto.token),
    )
    if (!userId) throw new BadRequestException('Reset token is invalid or expired')

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS)
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    await this.redis.del(this.redis.key('password-reset', dto.token))

    // Revoke all existing refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } })

    if (!user.passwordHash) throw new BadRequestException('Cannot change password for OAuth accounts')

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!valid) throw new UnauthorizedException('Current password is incorrect')

    const passwordHash = await bcrypt.hash(dto.newPassword, this.SALT_ROUNDS)
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  }

  // ─── Email Verification ───────────────────────────────────────────────────

  async verifyEmail(token: string): Promise<void> {
    const userId = await this.redis.get<string>(this.redis.key('email-verify', token))
    if (!userId) throw new BadRequestException('Verification link is invalid or expired')

    await this.prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true, status: UserStatus.ACTIVE, emailVerifyToken: null },
    })

    await this.redis.del(this.redis.key('email-verify', token))
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private signAccessToken(
    user: { id: string; email: string; roles: UserRole[] },
    orgId: string | undefined,
    sessionId: string,
  ): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      roles: user.roles,
      orgId,
      sessionId,
    })
  }

  private async buildAuthResponse(
    user: {
      id: string; name: string; email: string; phone: string
      roles: UserRole[]; avatar?: string | null; isEmailVerified: boolean; isPhoneVerified: boolean
      orgMemberships?: { orgId: string }[]
    },
    orgName?: string,
  ): Promise<AuthResponse> {
    const orgId = user.orgMemberships?.[0]?.orgId
    const sessionId = uuidv4()
    const accessToken = this.signAccessToken(user, orgId, sessionId)
    const refreshToken = uuidv4()

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        orgId,
        orgName,
        avatar: user.avatar ?? undefined,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    }
  }

  private roleToOrgType(role: UserRole): string {
    const map: Partial<Record<UserRole, string>> = {
      [UserRole.BUILDER]: 'BUILDER',
      [UserRole.BROKER]: 'BROKERAGE',
      [UserRole.AGENT]: 'BROKERAGE',
      [UserRole.CONTRACTOR]: 'CONTRACTOR',
      [UserRole.SUPPLIER]: 'SUPPLIER',
    }
    return map[role] ?? 'INDIVIDUAL'
  }

  private buildVerifyEmailHtml(name: string, token: string): string {
    const url = `${this.config.get('FRONTEND_URL')}/auth/verify-email?token=${token}`
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to BuildEstate, ${name}!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#0c93ea;color:white;border-radius:6px;text-decoration:none;">
          Verify Email
        </a>
        <p style="color:#666;font-size:12px;margin-top:16px;">Link expires in 24 hours.</p>
      </div>
    `
  }
}
