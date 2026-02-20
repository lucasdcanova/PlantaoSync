/**
 * Unified production server
 * Serves both NestJS API (/api/v1) and Next.js frontend on the same port.
 *
 * Usage:  NODE_ENV=production node server.js
 */
const path = require('path')
const http = require('http')
const { createRequire } = require('module')

// ── Workspace paths ──────────────────────────────────────────────────
const API_DIR = path.join(__dirname, 'api')
const WEB_DIR = path.join(__dirname, 'apps', 'web')
const ROOT_DIR = __dirname

// Create requirers scoped to each workspace so pnpm dependencies resolve
const apiRequire = createRequire(path.join(API_DIR, 'package.json'))
const webRequire = createRequire(path.join(WEB_DIR, 'package.json'))
const rootRequire = createRequire(path.join(ROOT_DIR, 'package.json'))

// ── Load root .env ───────────────────────────────────────────────────
try {
    const { loadRootEnv } = require('./scripts/load-root-env.cjs')
    loadRootEnv(__dirname)
} catch {
    // Environment variables should already be set in production (Render)
}

const PORT = parseInt(process.env.PORT || '3001', 10)

async function main() {
    // ── 1. Boot NestJS (API) ─────────────────────────────────────────
    // Use apiRequire to resolve packages from the api workspace
    const { NestFactory } = apiRequire('@nestjs/core')
    const { ValidationPipe, Logger } = apiRequire('@nestjs/common')
    const { ExpressAdapter } = apiRequire('@nestjs/platform-express')
    const express = apiRequire('express')
    const cookieParser = apiRequire('cookie-parser')
    const helmet = apiRequire('helmet')

    // Import compiled NestJS app
    const { AppModule } = require('./api/dist/src/app.module')
    const { HttpExceptionFilter } = require('./api/dist/src/shared/filters/http-exception.filter')
    const { LoggingInterceptor } = require('./api/dist/src/shared/interceptors/logging.interceptor')

    const logger = new Logger('UnifiedServer')

    // Create a shared Express instance
    const expressApp = express()

    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
        logger: ['error', 'warn', 'log', 'debug'],
    })

    // Security
    nestApp.use(
        helmet({
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: false,
        }),
    )
    nestApp.use(cookieParser())

    // CORS (still useful for mobile app & external consumers)
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`
    const corsOrigins = process.env.CORS_ORIGINS || appUrl
    nestApp.enableCors({
        origin: corsOrigins.split(',').map((o) => o.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-organization-id'],
    })

    // Global prefix — all API routes under /api/v1
    nestApp.setGlobalPrefix('api/v1')

    // Validation
    nestApp.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    )

    // Filters & interceptors
    nestApp.useGlobalFilters(new HttpExceptionFilter())
    nestApp.useGlobalInterceptors(new LoggingInterceptor())

    // Initialize NestJS (registers all routes on the Express instance)
    await nestApp.init()
    logger.log('✅ NestJS API initialized')

    // ── 2. Boot Next.js ──────────────────────────────────────────────
    const next = webRequire('next')
    const nextApp = next({
        dev: false,
        dir: WEB_DIR,
    })
    await nextApp.prepare()
    const nextHandler = nextApp.getRequestHandler()
    logger.log('✅ Next.js frontend initialized')

    // ── 3. Mount Next.js as fallback on Express ──────────────────────
    // API routes are already registered by NestJS above.
    // Everything else goes to Next.js.
    expressApp.all('*', (req, res) => {
        return nextHandler(req, res)
    })

    // ── 4. Start listening ───────────────────────────────────────────
    const server = http.createServer(expressApp)
    server.listen(PORT, '0.0.0.0', () => {
        logger.log(`🚀 Unified server running on port ${PORT}`)
        logger.log(`   ├── API:      /api/v1`)
        logger.log(`   └── Frontend: /`)
        logger.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`)
    })
}

main().catch((err) => {
    console.error('❌ Failed to start unified server:', err)
    process.exit(1)
})
