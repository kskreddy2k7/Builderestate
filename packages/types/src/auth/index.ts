import type { UserRole } from '../shared'

// ─── JWT Payload ──────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string // userId
  email: string
  roles: UserRole[]
  orgId?: string
  sessionId: string
  iat: number
  exp: number
}

export interface JwtTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface RegisterDto {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
  orgName?: string
  referralCode?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface ForgotPasswordDto {
  email: string
}

export interface ResetPasswordDto {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface RefreshTokenDto {
  refreshToken: string
}

export interface OAuthCallbackDto {
  code: string
  state?: string
}

// ─── Auth Responses ───────────────────────────────────────────────────────────

export interface AuthResponse {
  user: AuthUser
  tokens: JwtTokens
}

export interface AuthUser {
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

// ─── Session ──────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  userId: string
  deviceInfo?: string
  ipAddress: string
  createdAt: string
  lastActiveAt: string
  expiresAt: string
}

// ─── Permission ───────────────────────────────────────────────────────────────

export interface Permission {
  resource: string
  action: 'create' | 'read' | 'update' | 'delete' | 'manage'
}

export interface RolePermissions {
  role: UserRole
  permissions: Permission[]
}
