"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const schedule_1 = require("@nestjs/schedule");
const bull_1 = require("@nestjs/bull");
const terminus_1 = require("@nestjs/terminus");
const app_config_1 = require("./config/app.config");
const prisma_module_1 = require("./shared/prisma/prisma.module");
const redis_module_1 = require("./shared/cache/redis.module");
const notifications_module_1 = require("./shared/notifications/notifications.module");
const files_module_1 = require("./shared/files/files.module");
const payments_module_1 = require("./shared/payments/payments.module");
const websocket_module_1 = require("./shared/websocket/websocket.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const marketplace_module_1 = require("./modules/marketplace/marketplace.module");
const construction_module_1 = require("./modules/construction/construction.module");
const erp_module_1 = require("./modules/erp/erp.module");
const crm_module_1 = require("./modules/crm/crm.module");
const contractor_module_1 = require("./modules/contractor/contractor.module");
const materials_module_1 = require("./modules/materials/materials.module");
const buyer_module_1 = require("./modules/buyer/buyer.module");
const engineer_module_1 = require("./modules/engineer/engineer.module");
const admin_module_1 = require("./modules/admin/admin.module");
const ai_module_1 = require("./modules/ai/ai.module");
const health_controller_1 = require("./health.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // ─── Config ──────────────────────────────────────────────────────────────
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.AppConfig],
                envFilePath: ['.env.local', '.env'],
            }),
            // ─── Rate Limiting ────────────────────────────────────────────────────────
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: config.get('THROTTLE_TTL', 60) * 1000,
                        limit: config.get('THROTTLE_LIMIT', 100),
                    },
                ],
            }),
            // ─── Scheduling ───────────────────────────────────────────────────────────
            schedule_1.ScheduleModule.forRoot(),
            // ─── Queue ────────────────────────────────────────────────────────────────
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    redis: {
                        host: config.get('REDIS_HOST', 'localhost'),
                        port: config.get('REDIS_PORT', 6379),
                        password: config.get('REDIS_PASSWORD'),
                        db: config.get('REDIS_DB', 0),
                    },
                    defaultJobOptions: {
                        removeOnComplete: 100,
                        removeOnFail: 200,
                        attempts: 3,
                        backoff: { type: 'exponential', delay: 1000 },
                    },
                }),
            }),
            // ─── Health ───────────────────────────────────────────────────────────────
            terminus_1.TerminusModule,
            // ─── Shared Infrastructure ────────────────────────────────────────────────
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            notifications_module_1.NotificationsModule,
            files_module_1.FilesModule,
            payments_module_1.PaymentsModule,
            websocket_module_1.WebSocketModule,
            // ─── Domain Modules ───────────────────────────────────────────────────────
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            marketplace_module_1.MarketplaceModule,
            construction_module_1.ConstructionModule,
            erp_module_1.ErpModule,
            crm_module_1.CrmModule,
            contractor_module_1.ContractorModule,
            materials_module_1.MaterialsModule,
            buyer_module_1.BuyerModule,
            engineer_module_1.EngineerModule,
            admin_module_1.AdminModule,
            ai_module_1.AiModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map