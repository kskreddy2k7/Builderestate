import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import fastifyCompress from '@fastify/compress'
import fastifyCookie from '@fastify/cookie'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: process.env.NODE_ENV !== 'production' }),
  )

  const config = app.get(ConfigService)

  // ─── Security ──────────────────────────────────────────────────────────────
  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy: false,
  })

  // CORS
  await app.register(fastifyCors as any, {
    origin: true, // Allow all origins to fix local dev
    credentials: true,
  })

  // Compression
  await app.register(fastifyCompress as any, { encodings: ['gzip', 'deflate'] })

  // ─── Cookies ───────────────────────────────────────────────────────────────
  await app.register(fastifyCookie as any)

  // ─── Global Prefix & Versioning ────────────────────────────────────────────
  app.setGlobalPrefix(config.get<string>('API_PREFIX', 'api/v1'))
  app.enableVersioning({ type: VersioningType.URI })

  // ─── Global Pipes ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // ─── Global Filters ────────────────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter())

  // ─── Global Interceptors ───────────────────────────────────────────────────
  app.useGlobalInterceptors(new ResponseInterceptor(), new LoggingInterceptor())

  // ─── Swagger Documentation ─────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('BuildEstate API')
      .setDescription('BuildEstate — Unified Real Estate & Construction Platform API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
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
      .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    })
  }

  // ─── Start ─────────────────────────────────────────────────────────────────
  const port = config.get<number>('APP_PORT', 4000)
  await app.listen(port, '0.0.0.0')
  console.info(`🚀 BuildEstate API running on http://localhost:${port}`)
  console.info(`📚 API Docs: http://localhost:${port}/api/docs`)
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err)
  process.exit(1)
})
