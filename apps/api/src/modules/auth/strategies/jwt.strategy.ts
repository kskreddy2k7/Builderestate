import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@/shared/prisma/prisma.service'
import { RedisService } from '@/shared/cache/redis.service'
import type { RequestUser } from '@/common/decorators'

interface JwtPayload {
  sub: string
  email: string
  roles: string[]
  orgId?: string
  sessionId: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', ''),
    })
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    // Check if session is revoked (logout)
    const revoked = await this.redis.sismember(
      this.redis.key('revoked-sessions'),
      payload.sessionId,
    )
    if (revoked) throw new UnauthorizedException('Session has been revoked')

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, roles: true, status: true, orgMemberships: true },
    })

    if (!user) throw new UnauthorizedException('User not found')
    if (user.status === 'SUSPENDED') throw new UnauthorizedException('Account suspended')

    const primaryOrg = user.orgMemberships[0]

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      orgId: primaryOrg?.orgId,
      sessionId: payload.sessionId,
    }
  }
}
