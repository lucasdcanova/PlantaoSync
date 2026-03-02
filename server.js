/**
 * Unified production server
 * Serves both NestJS API (/api/v1) and Next.js frontend on the same port.
 *
 * Usage:  NODE_ENV=production node server.js
 */
const path = require('path')
const http = require('http')
const { createRequire } = require('module')
const { execSync } = require('child_process')

// ── Workspace paths ──────────────────────────────────────────────────
const API_DIR = path.join(__dirname, 'api')
const WEB_DIR = path.join(__dirname, 'apps', 'web')

// Create scoped requirers for each workspace
const apiRequire = createRequire(path.join(API_DIR, 'index.js'))
const webRequire = createRequire(path.join(WEB_DIR, 'index.js'))

// Helper: resolve a package trying multiple requirers in sequence
function resolve(pkg) {
    const requirers = [apiRequire, webRequire, require]
    for (const req of requirers) {
        try { return req(pkg) } catch { }
    }
    throw new Error(`Cannot resolve '${pkg}' from any workspace`)
}

// ── Load root .env ───────────────────────────────────────────────────
try {
    const { loadRootEnv } = require('./scripts/load-root-env.cjs')
    loadRootEnv(__dirname)
} catch {
    // Environment variables should already be set in production (Render)
}

const PORT = parseInt(process.env.PORT || '3001', 10)
const MIGRATION_MAX_ATTEMPTS = parseInt(process.env.MIGRATION_MAX_ATTEMPTS || '8', 10)
const MIGRATION_RETRY_BASE_MS = parseInt(process.env.MIGRATION_RETRY_BASE_MS || '5000', 10)
const MIGRATION_RETRY_MAX_MS = parseInt(process.env.MIGRATION_RETRY_MAX_MS || '60000', 10)
const SERVER_START_MAX_ATTEMPTS = parseInt(process.env.SERVER_START_MAX_ATTEMPTS || '6', 10)
const SERVER_START_RETRY_BASE_MS = parseInt(process.env.SERVER_START_RETRY_BASE_MS || '3000', 10)
const SERVER_START_RETRY_MAX_MS = parseInt(process.env.SERVER_START_RETRY_MAX_MS || '30000', 10)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function getBackoffDelay(attempt, baseMs, maxMs) {
    return Math.min(baseMs * 2 ** (attempt - 1), maxMs)
}

async function main() {
    // ── 1. Boot NestJS (API) on its own Express instance ─────────────
    const { NestFactory } = resolve('@nestjs/core')
    const { ValidationPipe, Logger } = resolve('@nestjs/common')

    const cookieParser = resolve('cookie-parser')
    const helmet = resolve('helmet')

    // Import compiled NestJS app
    const { AppModule } = require('./api/dist/src/app.module')
    const { HttpExceptionFilter } = require('./api/dist/src/shared/filters/http-exception.filter')
    const { LoggingInterceptor } = require('./api/dist/src/shared/interceptors/logging.interceptor')

    const logger = new Logger('UnifiedServer')

    // Let NestJS create its own Express adapter (default behavior)
    const nestApp = await NestFactory.create(AppModule, {
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

    // Initialize NestJS but don't listen yet
    await nestApp.init()
    const nestHandler = nestApp.getHttpAdapter().getInstance()
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

    // ── 3. Create unified HTTP server ────────────────────────────────
    // Route /api/v1/* to NestJS, everything else to Next.js
    const server = http.createServer((req, res) => {
        const url = req.url || '/'
        if (url.startsWith('/api/v1') || url.startsWith('/api/docs')) {
            // Forward to NestJS Express handler
            nestHandler(req, res)
        } else {
            // Forward to Next.js
            nextHandler(req, res)
        }
    })

    server.listen(PORT, '0.0.0.0', () => {
        logger.log(`🚀 Unified server running on port ${PORT}`)
        logger.log(`   ├── API:      /api/v1`)
        logger.log(`   └── Frontend: /`)
        logger.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`)
    })
}

// ── Run database migrations before starting ──────────────────────────
async function runMigrationsWithRetry() {
    for (let attempt = 1; attempt <= MIGRATION_MAX_ATTEMPTS; attempt += 1) {
        console.log(
            `🔄 Running database migrations (attempt ${attempt}/${MIGRATION_MAX_ATTEMPTS})...`,
        )
        try {
            execSync('pnpm --filter=api run db:migrate:prod', {
                cwd: __dirname,
                stdio: 'inherit',
            })
            console.log('✅ Database migrations completed')
            return
        } catch (err) {
            const message = err?.message || String(err)
            if (attempt === MIGRATION_MAX_ATTEMPTS) {
                throw new Error(
                    `Migration failed after ${MIGRATION_MAX_ATTEMPTS} attempts. Last error: ${message}`,
                )
            }
            const delayMs = getBackoffDelay(
                attempt,
                MIGRATION_RETRY_BASE_MS,
                MIGRATION_RETRY_MAX_MS,
            )
            console.error(
                `⚠️ Migration attempt ${attempt} failed: ${message}. Retrying in ${delayMs}ms...`,
            )
            await sleep(delayMs)
        }
    }
}

async function startServerWithRetry() {
    for (let attempt = 1; attempt <= SERVER_START_MAX_ATTEMPTS; attempt += 1) {
        try {
            await main()
            return
        } catch (err) {
            const message = err?.message || String(err)
            if (attempt === SERVER_START_MAX_ATTEMPTS) {
                throw new Error(
                    `Server bootstrap failed after ${SERVER_START_MAX_ATTEMPTS} attempts. Last error: ${message}`,
                )
            }
            const delayMs = getBackoffDelay(
                attempt,
                SERVER_START_RETRY_BASE_MS,
                SERVER_START_RETRY_MAX_MS,
            )
            console.error(
                `⚠️ Server bootstrap attempt ${attempt} failed: ${message}. Retrying in ${delayMs}ms...`,
            )
            await sleep(delayMs)
        }
    }
}

async function bootstrap() {
    try {
        await runMigrationsWithRetry()
        await startServerWithRetry()
    } catch (err) {
        console.error('❌ Failed to start unified server:', err)
        process.exit(1)
    }
}

bootstrap()
