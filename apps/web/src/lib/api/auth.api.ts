import { post, get } from './client'
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  JwtTokens,
  AuthUser,
} from '@buildestate/types'

export const authApi = {
  login: (data: LoginDto) =>
    post<AuthResponse>('/auth/login', data),

  register: (data: RegisterDto) =>
    post<AuthResponse>('/auth/register', data),

  logout: (refreshToken?: string) =>
    post<void>('/auth/logout', { refreshToken }),

  refresh: (data: RefreshTokenDto) =>
    post<JwtTokens>('/auth/refresh', data),

  me: () =>
    get<AuthUser>('/auth/me'),

  forgotPassword: (data: ForgotPasswordDto) =>
    post<{ message: string }>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordDto) =>
    post<{ message: string }>('/auth/reset-password', data),

  verifyEmail: (token: string) =>
    post<{ message: string }>('/auth/verify-email', { token }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    post<{ message: string }>('/auth/change-password', data),
}
