"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("@fastify/helmet"));
const cors_1 = __importDefault(require("@fastify/cors"));
const compress_1 = __importDefault(require("@fastify/compress"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: process.env.NODE_ENV !== 'production' }));
    const config = app.get(config_1.ConfigService);
    // ─── Security ──────────────────────────────────────────────────────────────
    await app.register(helmet_1.default, {
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
    });
    // ─── CORS ──────────────────────────────────────────────────────────────────
    await app.register(cors_1.default, {
        origin: config.get('FRONTEND_URL', 'http://localhost:3000'),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    // ─── Compression ───────────────────────────────────────────────────────────
    await app.register(compress_1.default, { encodings: ['gzip', 'deflate'] });
    // ─── Cookies ───────────────────────────────────────────────────────────────
    await app.register(cookie_1.default);
    // ─── Global Prefix & Versioning ────────────────────────────────────────────
    app.setGlobalPrefix(config.get('API_PREFIX', 'api/v1'));
    app.enableVersioning({ type: common_1.VersioningType.URI });
    // ─── Global Pipes ──────────────────────────────────────────────────────────
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    // ─── Global Filters ────────────────────────────────────────────────────────
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    // ─── Global Interceptors ───────────────────────────────────────────────────
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor(), new logging_interceptor_1.LoggingInterceptor());
    // ─── Swagger Documentation ─────────────────────────────────────────────────
    if (process.env.NODE_ENV !== 'production') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('BuildEstate API')
            .setDescription('BuildEstate — Unified Real Estate & Construction Platform API')
            .setVersion('1.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
            .addTag('auth', 'Authentication & Authorization')
            .addTag('users', 'User Management')
            .addTag('marketplace', 'Real Estate Marketplace')
            .addTag('construction', 'Construction Management')
            .addTag('erp', 'Builder ERP & Finance')
            .addTag('crm', 'Broker CRM')
            .addTag('contractor', 'Contractor Management')
            .addTag('materials', 'Material Marketplace')
            .addTag('buyer', 'Buyer Portal')
            .addTag('engineer', 'Site Engineer Portal')
            .addTag('admin', 'Admin Portal')
            .addTag('ai', 'AI Assistant')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: { persistAuthorization: true },
        });
    }
    // ─── Start ─────────────────────────────────────────────────────────────────
    const port = config.get('APP_PORT', 4000);
    await app.listen(port, '0.0.0.0');
    console.info(`🚀 BuildEstate API running on http://localhost:${port}`);
    console.info(`📚 API Docs: http://localhost:${port}/api/docs`);
}
bootstrap().catch((err) => {
    console.error('Failed to start application:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map