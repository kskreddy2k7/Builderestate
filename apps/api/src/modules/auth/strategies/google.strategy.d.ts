import { Strategy, type Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
export interface GoogleUser {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
}
declare const GoogleStrategy_base: new (...args: any[]) => Strategy;
export declare class GoogleStrategy extends GoogleStrategy_base {
    private readonly config;
    constructor(config: ConfigService);
    validate(_accessToken: string, _refreshToken: string, profile: Profile): GoogleUser;
}
export {};
//# sourceMappingURL=google.strategy.d.ts.map