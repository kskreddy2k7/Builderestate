import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ChangePasswordDto } from './dto/auth.dto';
import type { RequestUser } from '@/common/decorators';
import type { GoogleUser } from './strategies/google.strategy';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<import("./auth.service").AuthResponse>;
    login(dto: LoginDto, req: FastifyRequest): Promise<import("./auth.service").AuthResponse>;
    googleAuth(): void;
    googleCallback(req: FastifyRequest & {
        user: GoogleUser;
    }, res: FastifyReply): Promise<void>;
    refresh(dto: RefreshTokenDto): Promise<import("./auth.service").TokenPair>;
    logout(user: RequestUser, body: {
        refreshToken?: string;
    }): Promise<{
        message: string;
    }>;
    me(user: RequestUser): Promise<RequestUser>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    changePassword(user: RequestUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.controller.d.ts.map