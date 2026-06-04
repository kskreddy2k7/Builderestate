import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../cache/redis.service';
interface AuthSocket extends Socket {
    userId: string;
    orgId?: string;
}
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly config;
    private readonly redis;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, config: ConfigService, redis: RedisService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: AuthSocket): Promise<void>;
    handleJoinProject(client: AuthSocket, data: {
        projectId: string;
    }): Promise<{
        event: string;
        data: {
            room: string;
        };
    }>;
    handleLeaveProject(client: AuthSocket, data: {
        projectId: string;
    }): Promise<void>;
    handlePing(): {
        event: string;
        data: string;
    };
    emitToUser(userId: string, event: string, data: unknown): void;
    emitToOrg(orgId: string, event: string, data: unknown): void;
    emitToProject(projectId: string, event: string, data: unknown): void;
    emitToAll(event: string, data: unknown): void;
    notifyPaymentReceived(userId: string, payload: {
        bookingId: string;
        amount: number;
    }): void;
    notifyProgressUpdate(projectId: string, payload: {
        title: string;
        percentage: number;
        mediaUrls: string[];
    }): void;
    notifyNCRRaised(contractorUserId: string, payload: {
        ncrNumber: string;
        severity: string;
    }): void;
    notifyLeadAssigned(brokerId: string, payload: {
        leadId: string;
        name: string;
        phone: string;
    }): void;
    notifyBookingConfirmed(buyerId: string, payload: {
        bookingNumber: string;
        unitNumber: string;
    }): void;
}
export {};
//# sourceMappingURL=events.gateway.d.ts.map