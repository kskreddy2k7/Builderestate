export declare const AppConfig: (() => {
    nodeEnv: string;
    port: number;
    appUrl: string;
    frontendUrl: string;
    apiPrefix: string;
    database: {
        url: string;
        poolMin: number;
        poolMax: number;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    oauth: {
        google: {
            clientId: string;
            clientSecret: string;
            callbackUrl: string;
        };
    };
    aws: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        s3Bucket: string;
        cloudfrontUrl: string;
    };
    email: {
        from: string;
        fromName: string;
        sesRegion: string;
    };
    sms: {
        twilioAccountSid: string;
        twilioAuthToken: string;
        twilioPhoneNumber: string;
    };
    payments: {
        razorpayKeyId: string;
        razorpayKeySecret: string;
        razorpayWebhookSecret: string;
    };
    openai: {
        apiKey: string;
        model: string;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    appUrl: string;
    frontendUrl: string;
    apiPrefix: string;
    database: {
        url: string;
        poolMin: number;
        poolMax: number;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    oauth: {
        google: {
            clientId: string;
            clientSecret: string;
            callbackUrl: string;
        };
    };
    aws: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        s3Bucket: string;
        cloudfrontUrl: string;
    };
    email: {
        from: string;
        fromName: string;
        sesRegion: string;
    };
    sms: {
        twilioAccountSid: string;
        twilioAuthToken: string;
        twilioPhoneNumber: string;
    };
    payments: {
        razorpayKeyId: string;
        razorpayKeySecret: string;
        razorpayWebhookSecret: string;
    };
    openai: {
        apiKey: string;
        model: string;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
}>;
//# sourceMappingURL=app.config.d.ts.map