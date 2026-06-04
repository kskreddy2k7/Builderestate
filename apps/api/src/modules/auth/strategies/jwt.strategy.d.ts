import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import type { RequestUser } from '@/common/decorators';
interface JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    orgId?: string;
    sessionId: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly config;
    private readonly prisma;
    private readonly redis;
    constructor(config: ConfigService, prisma: PrismaService, redis: RedisService);
    validate(payload: JwtPayload): Promise<RequestUser>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map