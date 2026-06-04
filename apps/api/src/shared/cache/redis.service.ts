import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)
  private readonly client: Redis

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD'),
      db: this.config.get<number>('REDIS_DB', 0),
      retryStrategy: (times) => Math.min(times * 50, 2000),
      enableOfflineQueue: false,
    })

    this.client.on('connect', () => this.logger.log('Redis connected'))
    this.client.on('error', (err) => this.logger.error('Redis error', err))
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit()
  }

  // ─── Core ops ─────────────────────────────────────────────────────────────

  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return value as unknown as T
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serialized)
    } else {
      await this.client.set(key, serialized)
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await this.client.del(...keys)
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key)
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds)
  }

  // ─── Hash ops ─────────────────────────────────────────────────────────────

  async hset(key: string, field: string, value: unknown): Promise<void> {
    await this.client.hset(key, field, JSON.stringify(value))
  }

  async hget<T = unknown>(key: string, field: string): Promise<T | null> {
    const value = await this.client.hget(key, field)
    if (!value) return null
    return JSON.parse(value) as T
  }

  async hgetall<T = Record<string, unknown>>(key: string): Promise<T | null> {
    const value = await this.client.hgetall(key)
    if (!value || Object.keys(value).length === 0) return null
    const parsed: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      try { parsed[k] = JSON.parse(v) } catch { parsed[k] = v }
    }
    return parsed as T
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    await this.client.hdel(key, ...fields)
  }

  // ─── Set ops ──────────────────────────────────────────────────────────────

  async sadd(key: string, ...members: string[]): Promise<void> {
    await this.client.sadd(key, ...members)
  }

  async sismember(key: string, member: string): Promise<boolean> {
    return (await this.client.sismember(key, member)) === 1
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    await this.client.srem(key, ...members)
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key)
  }

  // ─── Sorted set ───────────────────────────────────────────────────────────

  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.client.zadd(key, score, member)
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrange(key, start, stop)
  }

  // ─── Prefix helpers ───────────────────────────────────────────────────────

  key(...parts: string[]): string {
    return `buildestate:${parts.join(':')}`
  }

  // ─── Cache with auto-refresh ───────────────────────────────────────────────

  async cached<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds = 300,
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const value = await factory()
    await this.set(key, value, ttlSeconds)
    return value
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern)
    if (keys.length > 0) await this.client.del(...keys)
  }
}
