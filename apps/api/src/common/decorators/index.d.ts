import type { UserRole } from '@prisma/client';
export interface RequestUser {
    id: string;
    email: string;
    roles: UserRole[];
    orgId?: string;
    sessionId: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const IS_PUBLIC_KEY = "isPublic";
export declare const Public: () => import("@nestjs/common").CustomDecorator<string>;
export declare const OrgId: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare const IS_API_KEY_AUTH = "isApiKeyAuth";
export declare const ApiKeyAuth: () => import("@nestjs/common").CustomDecorator<string>;
//# sourceMappingURL=index.d.ts.map