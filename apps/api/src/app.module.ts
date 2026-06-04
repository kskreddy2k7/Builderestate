import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { BullModule } from '@nestjs/bull'
import { TerminusModule } from '@nestjs/terminus'

import { AppConfig } from './config/app.config'
import { PrismaModule } from './shared/prisma/prisma.module'
import { RedisModule } from './shared/cache/redis.module'
import { NotificationsModule } from './shared/notifications/notifications.module'
import { FilesModule } from './shared/files/files.module'
import { PaymentsModule } from './shared/payments/payments.module'
import { WebSocketModule } from './shared/websocket/websocket.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { MarketplaceModule } from './modules/marketplace/marketplace.module'
import { ConstructionModule } from './modules/construction/construction.module'
import { ErpModule } from './modules/erp/erp.module'
import { CrmModule } from './modules/crm/crm.module'
import { ContractorModule } from './modules/contractor/contractor.module'
import { MaterialsModule } from './modules/materials/materials.module'
import { BuyerModule } from './modules/buyer/buyer.module'
import { EngineerModule } from './modules/engineer/engineer.module'
import { AdminModule } from './modules/admin/admin.module'
import { AiModule } from './modules/ai/ai.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    // ─── Config ──────────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // ─── Rate Limiting ────────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // ─── Scheduling ───────────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Queue ────────────────────────────────────────────────────────────────
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD'),
          db: config.get<number>('REDIS_DB', 0),
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
    TerminusModule,

    // ─── Shared Infrastructure ────────────────────────────────────────────────
    PrismaModule,
    RedisModule,
    NotificationsModule,
    FilesModule,
    PaymentsModule,
    WebSocketModule,

    // ─── Domain Modules ───────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    MarketplaceModule,
    ConstructionModule,
    ErpModule,
    CrmModule,
    ContractorModule,
    MaterialsModule,
    BuyerModule,
    EngineerModule,
    AdminModule,
    AiModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
