import { UserRole } from '@prisma/client';
export declare class RegisterDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    orgName?: string;
    referralCode?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    password: string;
    confirmPassword: string;
}
export declare class VerifyEmailDto {
    token: string;
}
export declare class VerifyOtpDto {
    otp: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
//# sourceMappingURL=auth.dto.d.ts.map