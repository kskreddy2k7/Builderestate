import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody,
  ConnectedSocket, WsException,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'
import { RedisService } from '../cache/redis.service'

interface AuthSocket extends Socket {
  userId: string
  orgId?: string
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server
  private readonly logger = new Logger(EventsGateway.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  // ─── Connection Lifecycle ─────────────────────────────────────────────────

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth['token'] as string
        ?? (client.handshake.headers.authorization as string)?.split(' ')[1]

      if (!token) {
        client.disconnect()
        return
      }

      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      }) as { sub: string; orgId?: string }

      const authClient = client as AuthSocket
      authClient.userId = payload.sub
      authClient.orgId = payload.orgId

      // Join user-specific room and org room
      await client.join(`user:${payload.sub}`)
      if (payload.orgId) await client.join(`org:${payload.orgId}`)

      // Track online status
      await this.redis.sadd(this.redis.key('online-users'), payload.sub)

      this.logger.debug(`Client connected: ${payload.sub}`)
    } catch {
      client.disconnect()
    }
  }

  async handleDisconnect(client: AuthSocket): Promise<void> {
    if (client.userId) {
      await this.redis.srem(this.redis.key('online-users'), client.userId)
      this.logger.debug(`Client disconnected: ${client.userId}`)
    }
  }

  // ─── Subscriptions ────────────────────────────────────────────────────────

  @SubscribeMessage('join:project')
  async handleJoinProject(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { projectId: string },
  ) {
    await client.join(`project:${data.projectId}`)
    return { event: 'joined', data: { room: `project:${data.projectId}` } }
  }

  @SubscribeMessage('leave:project')
  async handleLeaveProject(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { projectId: string },
  ) {
    await client.leave(`project:${data.projectId}`)
  }

  @SubscribeMessage('ping')
  handlePing(): { event: string; data: string } {
    return { event: 'pong', data: new Date().toISOString() }
  }

  // ─── Emit Helpers (called by services) ───────────────────────────────────

  emitToUser(userId: string, event: string, data: unknown): void {
    this.server.to(`user:${userId}`).emit(event, data)
  }

  emitToOrg(orgId: string, event: string, data: unknown): void {
    this.server.to(`org:${orgId}`).emit(event, data)
  }

  emitToProject(projectId: string, event: string, data: unknown): void {
    this.server.to(`project:${projectId}`).emit(event, data)
  }

  emitToAll(event: string, data: unknown): void {
    this.server.emit(event, data)
  }

  // ─── Typed Events ─────────────────────────────────────────────────────────

  notifyPaymentReceived(userId: string, payload: { bookingId: string; amount: number }): void {
    this.emitToUser(userId, 'payment:received', payload)
  }

  notifyProgressUpdate(projectId: string, payload: { title: string; percentage: number; mediaUrls: string[] }): void {
    this.emitToProject(projectId, 'progress:update', payload)
  }

  notifyNCRRaised(contractorUserId: string, payload: { ncrNumber: string; severity: string }): void {
    this.emitToUser(contractorUserId, 'ncr:raised', payload)
  }

  notifyLeadAssigned(brokerId: string, payload: { leadId: string; name: string; phone: string }): void {
    this.emitToUser(brokerId, 'lead:assigned', payload)
  }

  notifyBookingConfirmed(buyerId: string, payload: { bookingNumber: string; unitNumber: string }): void {
    this.emitToUser(buyerId, 'booking:confirmed', payload)
  }
}
