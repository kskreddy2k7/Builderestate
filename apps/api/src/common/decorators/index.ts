import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import type { UserRole } from '@prisma/client'

// ─── Current User ─────────────────────────────────────────────────────────────

export interface RequestUser {
  id: string
  email: string
  roles: UserRole[]
  orgId?: string
  sessionId: string
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest & { user: RequestUser }>()
    return request.user
  },
)

// ─── Roles ────────────────────────────────────────────────────────────────────

export const ROLES_KEY = 'roles'
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)

// ─── Public ───────────────────────────────────────────────────────────────────

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

// ─── OrgId param ─────────────────────────────────────────────────────────────

export const OrgId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<FastifyRequest & { user: RequestUser }>()
    return request.user?.orgId
  },
)

// ─── API Key ─────────────────────────────────────────────────────────────────

export const IS_API_KEY_AUTH = 'isApiKeyAuth'
export const ApiKeyAuth = () => SetMetadata(IS_API_KEY_AUTH, true)
