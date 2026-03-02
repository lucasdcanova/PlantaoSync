# CONFIRMA PLANTAO

Plataforma de gestao de escalas e confirmacao de plantoes medicos, com foco em operacao hospitalar, cobertura em tempo real, rastreabilidade e visao financeira.

Este repositorio e um monorepo com 4 frentes principais:
- `apps/web` -> aplicacao web + PWA (Next.js)
- `apps/mobile` -> app Expo (hoje como shell nativo com WebView apontando para o PWA)
- `api` -> backend NestJS + Prisma + PostgreSQL
- `packages/shared` -> tipos e constantes compartilhadas

## Escopo funcional

A plataforma cobre 2 jornadas principais:
- Jornada de gestao (ADMIN/MANAGER): instituicao, profissionais, setores, escalas, relatorios, financeiro e plano
- Jornada do profissional (PROFESSIONAL): plantoes disponiveis, calendario, historico, trocas e acompanhamento de rotina

Principais capacidades implementadas:
- Multi-tenant por organizacao
- Autenticacao JWT com refresh token em cookie httpOnly
- CRUD de escalas e plantoes, incluindo duplicacao e publicacao
- Confirmacao/cancelamento de plantao com validacoes de conflito de horario e capacidade
- Registros financeiros por confirmacao
- Relatorios de ocupacao, horas e custos
- Notificacoes in-app e push (fila com BullMQ + Redis + Firebase)
- Uploads para S3 com URLs assinadas e operacoes LGPD
- PWA com service worker (`next-pwa`) e manifest

## Arquitetura do repositorio

```text
.
|-- api/
|   |-- prisma/
|   `-- src/modules/
|-- apps/
|   |-- web/
|   `-- mobile/
|-- packages/
|   `-- shared/
|-- docs/
|-- scripts/
|-- docker-compose.yml
|-- render.yaml
`-- server.js
```

## Aplicacoes

### 1) Web/PWA (`apps/web`)

Stack:
- Next.js 14 (App Router)
- React 18
- Zustand + React Query
- Tailwind + componentes UI
- `next-pwa` para instalacao PWA/offline cache

Rotas principais:
- Marketing: `/`, `/faq`, `/privacy`, `/terms`, `/lgpd`
- Auth: `/login`, `/register`, `/forgot-password`, `/invite`
- Dashboard gestor: `/overview`, `/schedules`, `/professionals`, `/locations`, `/reports`, `/finances`, `/institution`, `/settings`, `/subscription`
- Jornada medico: `/doctor`, `/doctor/available`, `/doctor/calendar`, `/doctor/history`, `/doctor/swaps`, `/doctor/sectors`

Observacoes:
- O frontend usa `NEXT_PUBLIC_API_URL` para chamadas HTTP.
- O frontend usa dados reais via API e persiste sessoes com JWT/refresh token.

### 2) Mobile (`apps/mobile`)

Stack:
- Expo SDK 51 + React Native 0.74
- Expo Router
- WebView (`react-native-webview`)

Estado atual de produto:
- A rota raiz (`apps/mobile/app/index.tsx`) abre o PWA em WebView para manter paridade de UI/UX com a versao web.
- URL do PWA configuravel por `EXPO_PUBLIC_PWA_URL` (fallback: `https://plantaosync.onrender.com`).
- O app nativo mobile foi consolidado para shell WebView, sem fluxos nativos paralelos.

### 3) API (`api`)

Stack:
- NestJS 10
- Prisma + PostgreSQL
- BullMQ + Redis
- Socket.IO
- Firebase Admin (push)
- AWS S3 (uploads)

Prefixo global:
- `api/v1`

Modulos e recursos:
- `auth` -> login, register, refresh, logout, me
- `users` -> listagem, convite, atualizacao, desativacao
- `tenants` -> dados da organizacao e estatisticas
- `locations` -> CRUD de setores/unidades
- `schedules` -> CRUD, publicar, fechar, duplicar
- `shifts` -> CRUD de plantoes + criacao em lote
- `confirmations` -> vagas disponiveis, minhas confirmacoes, confirmar, cancelar
- `finances` -> resumo e registros financeiros
- `reports` -> ocupacao, horas e custos
- `subscriptions` -> assinatura atual e limites de plano
- `notifications` -> notificacoes e push token
- `uploads` -> avatar, logo, documento, URL assinada, remocao e fluxo LGPD

Tempo real:
- Gateway Socket.IO em namespace `/schedules`
- Eventos: `schedule.published`, `schedule.updated`, `shift.confirmed`

### 4) Shared (`packages/shared`)

Conteudo:
- Tipos de dominio compartilhados (user, organization, schedule, notification)
- Constantes compartilhadas (ex.: planos)

## Modelo de dados (Prisma)

Entidades centrais:
- `Organization`, `Subscription`
- `User`, `RefreshToken`, `PushToken`
- `Location`, `Schedule`, `Shift`, `ShiftConfirmation`
- `FinancialRecord`, `Notification`, `AuditLog`

Enums principais:
- `Plan`, `SubscriptionStatus`, `UserRole`, `ScheduleStatus`, `ConfirmationStatus`, `FinancialStatus`, `NotificationType`

## Requisitos

- Node.js 20+
- pnpm 10+
- Docker (recomendado para ambiente local com Postgres/Redis)

## Setup local

### 1) Instalar dependencias

```bash
pnpm install
```

### 2) Configurar variaveis de ambiente

Crie/ajuste os arquivos abaixo:
- raiz: `.env` (usado principalmente pela API e scripts Prisma)
- web: `apps/web/.env.local` (pode usar `apps/web/.env.example` como base)
- mobile: `apps/mobile/.env` (pode usar `apps/mobile/.env.example` como base)

Exemplo minimo para desenvolvimento local (raiz `.env`):

```env
NODE_ENV=development
PORT=3001
APP_URL=http://localhost:3002
FRONTEND_URL=http://localhost:3002
CORS_ORIGINS=http://localhost:3002

DATABASE_URL=postgresql://agendaplantao:agendaplantao_dev@localhost:5432/agendaplantao
DIRECT_URL=postgresql://agendaplantao:agendaplantao_dev@localhost:5432/agendaplantao

JWT_ACCESS_SECRET=dev_access_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=dev_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

REDIS_URL=redis://:agendaplantao_dev@localhost:6379

# Opcionais (funcionalidades especificas)
# FIREBASE_SERVICE_ACCOUNT={...json...}
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# AWS_S3_REGION=sa-east-1
# AWS_S3_BUCKET=plantaosync-storage
# AWS_S3_PUBLIC_URL=...
```

Exemplo para `apps/web/.env.local`:

```env
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

Exemplo para `apps/mobile/.env`:

```env
EXPO_PUBLIC_PWA_URL=http://localhost:3002
```

### 3) Subir infraestrutura local

```bash
docker compose up -d
```

### 4) Prisma (API)

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 5) Rodar em desenvolvimento

```bash
pnpm dev
```

Servicos esperados:
- Web/PWA: `http://localhost:3002`
- API: `http://localhost:3001/api/v1`
- Swagger (dev): `http://localhost:3001/api/docs`
- Mobile (Expo): iniciar com `pnpm --filter=mobile start`

## Comandos uteis

### Monorepo

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm format
```

### Banco/Prisma

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
pnpm db:reset
```

### Web

```bash
pnpm --filter=web dev
pnpm --filter=web build
pnpm --filter=web start
```

### API

```bash
pnpm --filter=api dev
pnpm --filter=api build
pnpm --filter=api start
pnpm --filter=api test
```

### Mobile

```bash
pnpm --filter=mobile start
pnpm --filter=mobile ios
pnpm --filter=mobile android
pnpm --filter=mobile build:ios
pnpm --filter=mobile build:android
```

### Logs iOS sem Xcode (automatico)

```bash
pnpm ios:logs
```

Opcional:

```bash
# Captura por 90s
pnpm ios:logs -- --duration 90

# Device especifico
pnpm ios:logs -- --device "Lucas DC"
```

Arquivos de saida:
- `logs/ios/<timestamp>/session-info.txt`
- `logs/ios/<timestamp>/summary.txt`
- `logs/ios/<timestamp>/syslog.raw.log` (quando `idevicesyslog` estiver instalado)
- `logs/ios/<timestamp>/syslog.filtered.log` (quando `idevicesyslog` estiver instalado)

Observacoes:
- O iPhone precisa estar desbloqueado no momento do launch.
- Para logs de sistema completos, instale `idevicesyslog`:
  `brew install libimobiledevice`

## Deploy

Este repositorio contem mais de uma estrategia de deploy:

- `server.js` + `render.yaml`: deploy unificado (Next + Nest) em um unico servico
- GitHub Actions (`.github/workflows/deploy.yml`): deploy separado para API (Railway) e Web (Vercel)

Revise a estrategia ativa do seu ambiente antes de publicar mudancas.

## CI/CD

Workflows em `.github/workflows`:
- `ci.yml`: lint, type check, testes da API com Postgres/Redis e build
- `deploy.yml`: pipeline de deploy para `main`

## Documentacao complementar

- `docs/aws-s3-setup.md` -> setup de bucket/IAM/CORS para uploads
- `docs/confirma-plantao-design-system.md` -> diretrizes de UI
- `docs/publicacao-app-store-connect-confirma-plantao.md` -> guia de publicacao iOS/TestFlight

## Credenciais de acesso

- As contas devem ser criadas via fluxo de cadastro e convites da organizacao.

## Notas operacionais

- O modulo `notifications` na API so e carregado quando Redis esta configurado (`REDIS_URL` ou `REDIS_HOST`).
- Push real requer `FIREBASE_SERVICE_ACCOUNT` valido.
- Uploads S3 exigem credenciais AWS; sem elas, endpoints de upload nao funcionam.
- O app mobile atual foi alinhado para paridade de UI/UX com o PWA via WebView.
