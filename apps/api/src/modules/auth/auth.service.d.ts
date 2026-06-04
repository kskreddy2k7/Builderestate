import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RedisService } from '@/shared/cache/redis.service';
import { NotificationsService } from '@/shared/notifications/notifications.service';
import { UserRole } from '@prisma/client';
import type { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
import type { GoogleUser } from './strategies/google.strategy';
import type { RequestUser } from '@/common/decorators';
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthResponse {
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        roles: UserRole[];
        orgId?: string;
        orgName?: string;
        avatar?: string;
        isEmailVerified: boolean;
        isPhoneVerified: boolean;
    };
    tokens: TokenPair;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly config;
    private readonly redis;
    private readonly notifications;
    private readonly logger;
    private readonly SALT_ROUNDS;
    private readonly RESET_TOKEN_TTL;
    private readonly VERIFY_TOKEN_TTL;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService, redis: RedisService, notifications: NotificationsService);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto, ipAddress: string): Promise<AuthResponse>;
    googleLogin(googleUser: GoogleUser): Promise<AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<TokenPair>;
    logout(user: RequestUser, refreshToken?: string): Promise<void>;
    forgotPassword(dto: ForgotPasswordDto): Promise<void>;
    resetPassword(dto: ResetPasswordDto): Promise<void>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    private signAccessToken;
    private buildAuthResponse;
    private roleToOrgType;
    private buildVerifyEmailHtml;
}
//# sourceMappingURL=auth.service.d.ts.map