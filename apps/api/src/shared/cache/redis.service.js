"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = RedisService_1 = class RedisService {
    config;
    logger = new common_1.Logger(RedisService_1.name);
    client;
    constructor(config) {
        this.config = config;
        this.client = new ioredis_1.default({
            host: this.config.get('REDIS_HOST', 'localhost'),
            port: this.config.get('REDIS_PORT', 6379),
            password: this.config.get('REDIS_PASSWORD'),
            db: this.config.get('REDIS_DB', 0),
            retryStrategy: (times) => Math.min(times * 50, 2000),
            enableOfflineQueue: false,
        });
        this.client.on('connect', () => this.logger.log('Redis connected'));
        this.client.on('error', (err) => this.logger.error('Redis error', err));
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
    // ─── Core ops ─────────────────────────────────────────────────────────────
    async get(key) {
        const value = await this.client.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async set(key, value, ttlSeconds) {
        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, serialized);
        }
        else {
            await this.client.set(key, serialized);
        }
    }
    async del(...keys) {
        if (keys.length > 0)
            await this.client.del(...keys);
    }
    async exists(key) {
        return (await this.client.exists(key)) === 1;
    }
    async ttl(key) {
        return this.client.ttl(key);
    }
    async expire(key, seconds) {
        await this.client.expire(key, seconds);
    }
    // ─── Hash ops ─────────────────────────────────────────────────────────────
    async hset(key, field, value) {
        await this.client.hset(key, field, JSON.stringify(value));
    }
    async hget(key, field) {
        const value = await this.client.hget(key, field);
        if (!value)
            return null;
        return JSON.parse(value);
    }
    async hgetall(key) {
        const value = await this.client.hgetall(key);
        if (!value || Object.keys(value).length === 0)
            return null;
        const parsed = {};
        for (const [k, v] of Object.entries(value)) {
            try {
                parsed[k] = JSON.parse(v);
            }
            catch {
                parsed[k] = v;
            }
        }
        return parsed;
    }
    async hdel(key, ...fields) {
        await this.client.hdel(key, ...fields);
    }
    // ─── Set ops ──────────────────────────────────────────────────────────────
    async sadd(key, ...members) {
        await this.client.sadd(key, ...members);
    }
    async sismember(key, member) {
        return (await this.client.sismember(key, member)) === 1;
    }
    async srem(key, ...members) {
        await this.client.srem(key, ...members);
    }
    async smembers(key) {
        return this.client.smembers(key);
    }
    // ─── Sorted set ───────────────────────────────────────────────────────────
    async zadd(key, score, member) {
        await this.client.zadd(key, score, member);
    }
    async zrange(key, start, stop) {
        return this.client.zrange(key, start, stop);
    }
    // ─── Prefix helpers ───────────────────────────────────────────────────────
    key(...parts) {
        return `buildestate:${parts.join(':')}`;
    }
    // ─── Cache with auto-refresh ───────────────────────────────────────────────
    async cached(key, factory, ttlSeconds = 300) {
        const cached = await this.get(key);
        if (cached !== null)
            return cached;
        const value = await factory();
        await this.set(key, value, ttlSeconds);
        return value;
    }
    async invalidate(pattern) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0)
            await this.client.del(...keys);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map