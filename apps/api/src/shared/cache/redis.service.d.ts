import { type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleDestroy {
    private readonly config;
    private readonly logger;
    private readonly client;
    constructor(config: ConfigService);
    onModuleDestroy(): Promise<void>;
    get<T = string>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    del(...keys: string[]): Promise<void>;
    exists(key: string): Promise<boolean>;
    ttl(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<void>;
    hset(key: string, field: string, value: unknown): Promise<void>;
    hget<T = unknown>(key: string, field: string): Promise<T | null>;
    hgetall<T = Record<string, unknown>>(key: string): Promise<T | null>;
    hdel(key: string, ...fields: string[]): Promise<void>;
    sadd(key: string, ...members: string[]): Promise<void>;
    sismember(key: string, member: string): Promise<boolean>;
    srem(key: string, ...members: string[]): Promise<void>;
    smembers(key: string): Promise<string[]>;
    zadd(key: string, score: number, member: string): Promise<void>;
    zrange(key: string, start: number, stop: number): Promise<string[]>;
    key(...parts: string[]): string;
    cached<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T>;
    invalidate(pattern: string): Promise<void>;
}
//# sourceMappingURL=redis.service.d.ts.map