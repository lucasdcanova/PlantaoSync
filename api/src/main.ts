import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import cookieParser = require('cookie-parser')
import helmet from 'helmet'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { AuditInterceptor } from './shared/interceptors/audit.interceptor'
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  })

  const config = app.get(ConfigService)
  const port = config.get<number>('PORT', 3001)
  const appUrl = config.get<string>('APP_URL', 'http://localhost:3000')
  const corsOrigins = config.get<string>('CORS_ORIGINS', appUrl)

  // Security
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }),
  )
  app.use(cookieParser())

  // CORS
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id'],
  })

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new LoggingInterceptor())

  // Swagger (dev only)
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CONFIRMA PLANTÃO API')
      .setDescription('API de gestão de escalas e plantões médicos')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refresh_token')
      .build()
    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    })
    logger.log(`📚 Swagger: http://localhost:${port}/api/docs`)
  }

  await app.listen(port)
  logger.log(`🚀 API rodando em http://localhost:${port}/api/v1`)
  logger.log(`🌍 Ambiente: ${config.get('NODE_ENV')}`)
}

bootstrap()
