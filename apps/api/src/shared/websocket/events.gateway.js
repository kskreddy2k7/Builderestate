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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventsGateway_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../cache/redis.service");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    jwtService;
    config;
    redis;
    server;
    logger = new common_1.Logger(EventsGateway_1.name);
    constructor(jwtService, config, redis) {
        this.jwtService = jwtService;
        this.config = config;
        this.redis = redis;
    }
    // ─── Connection Lifecycle ─────────────────────────────────────────────────
    async handleConnection(client) {
        try {
            const token = client.handshake.auth['token']
                ?? client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: this.config.get('JWT_SECRET'),
            });
            const authClient = client;
            authClient.userId = payload.sub;
            authClient.orgId = payload.orgId;
            // Join user-specific room and org room
            await client.join(`user:${payload.sub}`);
            if (payload.orgId)
                await client.join(`org:${payload.orgId}`);
            // Track online status
            await this.redis.sadd(this.redis.key('online-users'), payload.sub);
            this.logger.debug(`Client connected: ${payload.sub}`);
        }
        catch {
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        if (client.userId) {
            await this.redis.srem(this.redis.key('online-users'), client.userId);
            this.logger.debug(`Client disconnected: ${client.userId}`);
        }
    }
    // ─── Subscriptions ────────────────────────────────────────────────────────
    async handleJoinProject(client, data) {
        await client.join(`project:${data.projectId}`);
        return { event: 'joined', data: { room: `project:${data.projectId}` } };
    }
    async handleLeaveProject(client, data) {
        await client.leave(`project:${data.projectId}`);
    }
    handlePing() {
        return { event: 'pong', data: new Date().toISOString() };
    }
    // ─── Emit Helpers (called by services) ───────────────────────────────────
    emitToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    emitToOrg(orgId, event, data) {
        this.server.to(`org:${orgId}`).emit(event, data);
    }
    emitToProject(projectId, event, data) {
        this.server.to(`project:${projectId}`).emit(event, data);
    }
    emitToAll(event, data) {
        this.server.emit(event, data);
    }
    // ─── Typed Events ─────────────────────────────────────────────────────────
    notifyPaymentReceived(userId, payload) {
        this.emitToUser(userId, 'payment:received', payload);
    }
    notifyProgressUpdate(projectId, payload) {
        this.emitToProject(projectId, 'progress:update', payload);
    }
    notifyNCRRaised(contractorUserId, payload) {
        this.emitToUser(contractorUserId, 'ncr:raised', payload);
    }
    notifyLeadAssigned(brokerId, payload) {
        this.emitToUser(brokerId, 'lead:assigned', payload);
    }
    notifyBookingConfirmed(buyerId, payload) {
        this.emitToUser(buyerId, 'booking:confirmed', payload);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", typeof (_a = typeof socket_io_1.Server !== "undefined" && socket_io_1.Server) === "function" ? _a : Object)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join:project'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleJoinProject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave:project'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleLeaveProject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], EventsGateway.prototype, "handlePing", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*', credentials: true },
        namespace: '/',
        transports: ['websocket', 'polling'],
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        redis_service_1.RedisService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map