# CONFIRMA PLANTÃO — Guia de Desenvolvimento

> Plataforma SaaS B2B de gestão de escalas e plantões médicos hospitalares.
> Referência de produto analisada: Agendoctor.com
> Stack: Next.js 14 · NestJS · PostgreSQL · Redis · React Native (Expo)

---

## 1. Visão do Produto

**CONFIRMA PLANTÃO** substitui a gestão manual de escalas (planilhas + WhatsApp) por uma plataforma automatizada que conecta gestores hospitalares a profissionais de saúde.

### Perfis de Usuário
| Perfil | Plataforma Principal | Papel |
|--------|---------------------|-------|
| **Gestor** | Web Dashboard + Mobile | Cria e publica escalas, gerencia equipes |
| **Profissional** | App Mobile (primário) | Visualiza e confirma plantões |
| **Admin SaaS** | Painel interno | Gerencia tenants, planos, suporte |

### Proposta de Valor
- Reduzir de 4–6h para ~30 min/semana o tempo de gestão de escalas
- Confirmação de plantão com 1 clique pelo profissional
- Notificações em tempo real (push + in-app + e-mail)
- Relatórios exportáveis (PDF/Excel) com analytics de ocupação e custo

---

## 2. Arquitetura do Sistema

### 2.1 Visão Macro

```
┌─────────────────────────────────────────────────────┐
│                   CLIENTES                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Web (PWA)  │  │  iOS (RN)   │  │Android (RN) │ │
│  │  Next.js 14 │  │    Expo     │  │    Expo     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
└─────────┼───────────────┼───────────────┼─────────┘
          │               │               │
          └───────────────┼───────────────┘
                          │ HTTPS / WSS
┌─────────────────────────▼───────────────────────────┐
│                  API GATEWAY                        │
│              NestJS · REST + WebSocket               │
├─────────────┬──────────────────┬────────────────────┤
│  Auth/Tenant│    Core Domain   │  Background Jobs   │
│  Guard Layer│  (8 módulos)     │  BullMQ + Redis    │
└──────┬──────┴────────┬─────────┴────────┬───────────┘
       │               │                  │
┌──────▼──────┐ ┌──────▼──────┐ ┌────────▼────────────┐
│  PostgreSQL │ │    Redis    │ │  Firebase FCM/APNs  │
│  (Supabase) │ │  (Upstash)  │ │  Push Notifications │
└─────────────┘ └─────────────┘ └─────────────────────┘
```

### 2.2 Estratégia PWA → Native

**Fase 1 — PWA (Mês 1–3):**
- Next.js 14 com next-pwa
- Service Worker com cache offline strategy (Workbox)
- Web Push Notifications via VAPID
- Manifest.json com ícones e splash screens
- Funciona em qualquer browser, instalável no Android

**Fase 2 — Wrapper Nativo (Mês 4–6):**
- Expo para iOS e Android compartilhando código com o web
- Migração progressiva de componentes críticos para React Native
- Push Notifications via Expo Notifications (FCM + APNs)
- Deep links universais (branch.io ou Expo Linking)
- Publicação nas stores: App Store + Google Play

---

## 3. Stack Tecnológica

### 3.1 Frontend Web (PWA → Dashboard)

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Framework | **Next.js 14** (App Router) | SSR para landing, CSR para dashboard |
| Linguagem | **TypeScript 5** | Type safety em todo o projeto |
| UI Library | **shadcn/ui** + Radix UI | Componentes acessíveis e customizáveis |
| Estilo | **Tailwind CSS 3** | Utility-first, consistência no design system |
| Animações | **Framer Motion 11** | Spring physics, layout animations, gestures |
| Estado | **TanStack Query v5** | Server state, cache, real-time sync |
| Estado Global | **Zustand** | UI state leve sem boilerplate |
| Formulários | **React Hook Form + Zod** | Validação tipada de ponta a ponta |
| Calendário | **FullCalendar** (premium) ou **react-big-calendar** | Visualização de escalas |
| Tabelas | **TanStack Table v8** | Paginação, filtros, exportação |
| Gráficos | **Recharts** | Dashboard de analytics |
| WebSocket | **Socket.io-client** | Atualizações em tempo real |
| PWA | **next-pwa** + Workbox | Service Worker, offline, instalação |
| Ícones | **Lucide React** | Consistência com shadcn/ui |
| Testes | **Vitest + Testing Library** | Unit e integração de componentes |

### 3.2 App Mobile (React Native / Expo)

| Camada | Tecnologia |
|--------|-----------|
| Framework | **Expo SDK 51** (managed workflow) |
| Roteamento | **Expo Router** (file-based) |
| UI | **NativeWind** (Tailwind para RN) + React Native Paper |
| Animações | **React Native Reanimated 3** + **Moti** |
| Gestos | **React Native Gesture Handler** |
| Push | **Expo Notifications** (FCM + APNs) |
| Cache/State | **TanStack Query v5** (mesma lib do web) |
| Offline | **AsyncStorage** + MMKV (dados críticos) |
| Calendário | **react-native-calendars** |
| Biometria | **Expo Local Authentication** |
| Navegação | Bottom Tabs + Stack + Modal (Bottom Sheet) |

### 3.3 Backend

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Runtime | **Node.js 20 LTS** | Ecossistema maduro |
| Framework | **NestJS 10** | Modular, DI, decorators, WebSocket |
| Linguagem | **TypeScript 5** | Shared types com frontend |
| ORM | **Prisma** | Type-safe, migrations, multi-tenant |
| Banco Principal | **PostgreSQL 16** (Supabase) | RLS, relações complexas |
| Cache/Sessão | **Redis** (Upstash) | Session store, rate limiting |
| Filas | **BullMQ** + Redis | Jobs assíncronos, notificações |
| Auth | **JWT** + Refresh Tokens | Access token curto, refresh longo |
| Push | **Firebase Admin SDK** (FCM) | Notificações iOS + Android |
| E-mail | **Resend** + React Email | Templates bonitos em React |
| Storage | **Cloudflare R2** | PDFs, relatórios, avatares |
| Pagamentos | **Stripe** + **Pagar.me** | Stripe global + Pagar.me para PIX |
| Validação | **class-validator + class-transformer** | Zod no frontend |
| Testes | **Jest + Supertest** | Unit + E2E dos endpoints |
| Docs API | **Swagger/OpenAPI** | @nestjs/swagger |

### 3.4 Infraestrutura

| Serviço | Plataforma | Tier Inicial |
|---------|-----------|-------------|
| Frontend | **Vercel** | Pro (R$ 100/mês) |
| Backend | **Railway** ou **Render** | Starter (US$ 20/mês) |
| Banco | **Supabase** | Pro (US$ 25/mês) |
| Redis | **Upstash** | Pay-per-use (< US$ 10/mês) |
| CDN/R2 | **Cloudflare** | Workers + R2 (< US$ 5/mês) |
| Push | **Firebase** (FCM) | Gratuito |
| Monitoramento | **Sentry** | Team (US$ 26/mês) |
| CI/CD | **GitHub Actions** | Free |
| Pagamentos | **Stripe + Pagar.me** | Fee por transação |

---

## 4. Design System

### 4.1 Identidade Visual

**Conceito:** "Medical Clarity" — precisão cirúrgica com humanidade.
**Estética:** Refinamento moderno com profundidade. Limpo mas não estéril. Confiante, não frio.

#### Paleta de Cores (CSS Custom Properties)

```css
:root {
  /* Brand Principal */
  --brand-50:  #eef2ff;
  --brand-100: #e0e7ff;
  --brand-200: #c7d2fe;
  --brand-300: #a5b4fc;
  --brand-400: #818cf8;
  --brand-500: #6366f1;  /* primary */
  --brand-600: #4f46e5;  /* primary-dark */
  --brand-700: #4338ca;
  --brand-800: #3730a3;
  --brand-900: #312e81;

  /* Accent Verde (confirmações, sucesso) */
  --green-400: #4ade80;
  --green-500: #22c55e;
  --green-600: #16a34a;

  /* Semânticas */
  --color-success:   var(--green-500);
  --color-warning:   #f59e0b;
  --color-danger:    #ef4444;
  --color-info:      #3b82f6;

  /* Superfícies (Light Mode) */
  --bg-base:         #f8faff;
  --bg-surface:      #ffffff;
  --bg-elevated:     #f1f5f9;
  --border-subtle:   #e2e8f0;
  --text-primary:    #0f172a;
  --text-secondary:  #475569;
  --text-muted:      #94a3b8;

  /* Tokens de espaçamento */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Sombras com cor */
  --shadow-brand: 0 4px 24px -4px rgba(99, 102, 241, 0.25);
  --shadow-card:  0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  --shadow-elevated: 0 8px 32px rgba(0,0,0,0.08);
}

[data-theme="dark"] {
  --bg-base:         #09090f;
  --bg-surface:      #111120;
  --bg-elevated:     #1a1a2e;
  --border-subtle:   #1e2035;
  --text-primary:    #f0f4ff;
  --text-secondary:  #a0aec0;
  --text-muted:      #4a5568;
  --shadow-card:     0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2);
}
```

#### Tipografia

```css
/* Display — Geist (moderna, legível, tech) */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

/* Body — DM Sans (humanista, médico, confiável) */

:root {
  --font-display: 'Geist', 'SF Pro Display', sans-serif;
  --font-body:    'DM Sans', 'SF Pro Text', sans-serif;
  --font-mono:    'Geist Mono', 'SF Mono', monospace;

  /* Escala tipográfica */
  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */
  --text-3xl:  1.875rem;  /* 30px */
  --text-4xl:  2.25rem;   /* 36px */
  --text-5xl:  3rem;      /* 48px */
}
```

### 4.2 Tailwind Config Extendido

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
      },
      fontFamily: {
        sans:    ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
      },
      boxShadow: {
        brand:    '0 4px 24px -4px rgba(99, 102, 241, 0.25)',
        card:     '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        elevated: '0 8px 32px rgba(0,0,0,0.08)',
      },
      animation: {
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in':    'fadeIn 0.3s ease-out',
        'scale-in':   'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        slideUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
}
export default config
```

### 4.3 Componentes-Chave com Framer Motion

#### Animações de Página
```typescript
// lib/animations.ts
export const pageVariants = {
  initial:  { opacity: 0, y: 16, scale: 0.99 },
  animate:  { opacity: 1, y: 0,  scale: 1,    transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit:     { opacity: 0, y: -8, scale: 0.99,  transition: { duration: 0.2 } },
}

export const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 25, delay: i * 0.06 }
  }),
}

export const listVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
}

export const listItemVariants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
}
```

#### Skeleton Loader
```tsx
// components/ui/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-md bg-gradient-to-r',
        'from-slate-100 via-slate-200 to-slate-100',
        'dark:from-slate-800 dark:via-slate-700 dark:to-slate-800',
        'bg-[length:200%_100%]',
        className
      )}
    />
  )
}
```

#### Bottom Sheet (Mobile)
```tsx
// Usar @gorhom/bottom-sheet no React Native
// Usar Vaul (drawer) na PWA mobile

import { Drawer } from 'vaul'

export function BottomSheet({ children, trigger }: Props) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 rounded-t-2xl bg-surface p-4 pb-safe">
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-border-subtle" />
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
```

### 4.4 Regras de Design (NUNCA VIOLAR)

1. **Sem bordas visíveis em cards** — use sombra (`shadow-card`) como separador
2. **Raio de borda mínimo 12px** para cards, 8px para inputs
3. **Transições mínimas de 200ms** com easing spring
4. **Feedback de 100ms** em toda interação (pressionar botão, tap, etc.)
5. **Skeleton loaders obrigatórios** em qualquer dado assíncrono
6. **Mínimo 44px de área de toque** em elementos interativos mobile
7. **Cores semânticas** — verde=confirmado, amarelo=pendente, vermelho=cancelado, cinza=disponível
8. **Hierarquia clara** — máximo 3 níveis de ênfase em qualquer tela
9. **Dark mode nativo** — todos os componentes devem suportar desde o início

---

## 5. Estrutura do Projeto

```
agendaplantao/
├── apps/
│   ├── web/                    # Next.js 14 (PWA + Dashboard Web)
│   │   ├── src/
│   │   │   ├── app/            # App Router
│   │   │   │   ├── (marketing)/  # Landing page (público)
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── (auth)/     # Login, registro, forgot
│   │   │   │   ├── (dashboard)/ # Área autenticada do gestor
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── overview/
│   │   │   │   │   ├── schedules/
│   │   │   │   │   │   ├── page.tsx      # Lista de escalas
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx  # Detalhe + calendário
│   │   │   │   │   ├── professionals/
│   │   │   │   │   ├── locations/
│   │   │   │   │   ├── reports/
│   │   │   │   │   ├── finances/
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── subscription/
│   │   │   │   └── api/        # Route handlers (BFF)
│   │   │   ├── components/
│   │   │   │   ├── ui/         # shadcn/ui components (base)
│   │   │   │   ├── layout/     # Sidebar, Header, Footer
│   │   │   │   ├── dashboard/  # KPI cards, charts
│   │   │   │   ├── schedules/  # Calendar, shift cards
│   │   │   │   ├── professionals/ # Team cards, invite modal
│   │   │   │   └── shared/     # Common patterns
│   │   │   ├── lib/
│   │   │   │   ├── api.ts      # API client (ky ou axios)
│   │   │   │   ├── auth.ts     # Auth helpers
│   │   │   │   ├── animations.ts
│   │   │   │   └── utils.ts
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── store/          # Zustand stores
│   │   │   └── types/          # TypeScript types compartilhados
│   │   ├── public/
│   │   │   ├── icons/          # PWA icons (múltiplos tamanhos)
│   │   │   ├── manifest.json
│   │   │   └── sw.js           # Service Worker (gerado)
│   │   ├── next.config.ts
│   │   └── tailwind.config.ts
│   │
│   └── mobile/                 # Expo (React Native)
│       ├── app/                # Expo Router
│       │   ├── (auth)/
│       │   │   ├── login.tsx
│       │   │   ├── register.tsx
│       │   │   └── forgot.tsx
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx
│       │   │   ├── index.tsx     # Home / Feed
│       │   │   ├── calendar.tsx  # Calendário pessoal
│       │   │   ├── shifts.tsx    # Meus plantões
│       │   │   ├── finances.tsx  # Financeiro
│       │   │   └── profile.tsx   # Perfil
│       │   └── notifications.tsx
│       ├── components/
│       ├── hooks/
│       └── lib/
│
├── packages/
│   ├── shared/                 # Tipos TypeScript compartilhados
│   │   ├── types/
│   │   │   ├── user.ts
│   │   │   ├── schedule.ts
│   │   │   ├── shift.ts
│   │   │   └── notification.ts
│   │   └── constants/
│   │       └── plans.ts        # Limites por plano
│   │
│   └── ui/                     # Componentes compartilhados (futuro)
│
├── api/                        # NestJS Backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── tenants/
│   │   │   ├── users/
│   │   │   ├── locations/
│   │   │   ├── schedules/
│   │   │   ├── shifts/
│   │   │   ├── confirmations/
│   │   │   ├── notifications/
│   │   │   ├── reports/
│   │   │   ├── finances/
│   │   │   ├── subscriptions/
│   │   │   └── integrations/
│   │   ├── shared/
│   │   │   ├── decorators/
│   │   │   ├── guards/         # AuthGuard, RolesGuard, TenantGuard
│   │   │   ├── interceptors/   # AuditInterceptor, LoggingInterceptor
│   │   │   ├── middleware/     # TenantMiddleware
│   │   │   └── pipes/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── main.ts
│   ├── test/
│   └── .env.example
│
├── docker-compose.yml          # Postgres + Redis local
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
└── turbo.json                  # Turborepo config
```

---

## 6. Modelo de Dados (Prisma Schema)

```prisma
// api/src/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════
// MULTI-TENANT
// ═══════════════════════════════════════

model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  logoUrl     String?
  cnpj        String?  @unique
  phone       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subscription  Subscription?
  locations     Location[]
  users         User[]
  schedules     Schedule[]

  @@map("organizations")
}

model Subscription {
  id             String           @id @default(cuid())
  organizationId String           @unique
  plan           Plan             @default(BASIC)
  billingCycle   BillingCycle     @default(MONTHLY)
  status         SubscriptionStatus @default(TRIAL)
  trialEndsAt    DateTime?
  currentPeriodEnd DateTime?
  stripeSubId    String?
  pagarmeSubId   String?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  organization   Organization     @relation(fields: [organizationId], references: [id])

  @@map("subscriptions")
}

// ═══════════════════════════════════════
// USUÁRIOS
// ═══════════════════════════════════════

model User {
  id             String    @id @default(cuid())
  organizationId String
  name           String
  email          String    @unique
  passwordHash   String?
  role           UserRole  @default(PROFESSIONAL)
  crm            String?
  specialty      String?
  phone          String?
  avatarUrl      String?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  lastLoginAt    DateTime?

  organization   Organization       @relation(fields: [organizationId], references: [id])
  pushTokens     PushToken[]
  confirmations  ShiftConfirmation[]
  notifications  Notification[]
  financialRecords FinancialRecord[]
  auditLogs      AuditLog[]

  @@index([organizationId])
  @@map("users")
}

model PushToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  platform  Platform
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("push_tokens")
}

// ═══════════════════════════════════════
// ESCALAS E PLANTÕES
// ═══════════════════════════════════════

model Location {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  address        String?
  city           String?
  state          String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id])
  schedules      Schedule[]
  shifts         Shift[]

  @@index([organizationId])
  @@map("locations")
}

model Schedule {
  id             String         @id @default(cuid())
  organizationId String
  locationId     String
  title          String
  description    String?
  startDate      DateTime
  endDate        DateTime
  status         ScheduleStatus @default(DRAFT)
  publishedAt    DateTime?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  organization   Organization   @relation(fields: [organizationId], references: [id])
  location       Location       @relation(fields: [locationId], references: [id])
  shifts         Shift[]

  @@index([organizationId, status])
  @@index([locationId])
  @@map("schedules")
}

model Shift {
  id             String    @id @default(cuid())
  scheduleId     String
  locationId     String
  date           DateTime  @db.Date
  startTime      String    // "07:00"
  endTime        String    // "19:00"
  specialty      String?
  requiredCount  Int       @default(1)
  valuePerShift  Decimal   @db.Decimal(10, 2)
  notes          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  schedule       Schedule          @relation(fields: [scheduleId], references: [id])
  location       Location          @relation(fields: [locationId], references: [id])
  confirmations  ShiftConfirmation[]

  @@index([scheduleId])
  @@index([date])
  @@map("shifts")
}

model ShiftConfirmation {
  id          String             @id @default(cuid())
  shiftId     String
  userId      String
  status      ConfirmationStatus @default(PENDING)
  confirmedAt DateTime?
  cancelledAt DateTime?
  notes       String?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt

  shift       Shift              @relation(fields: [shiftId], references: [id])
  user        User               @relation(fields: [userId], references: [id])
  financialRecord FinancialRecord?

  @@unique([shiftId, userId])
  @@index([userId])
  @@map("shift_confirmations")
}

// ═══════════════════════════════════════
// NOTIFICAÇÕES
// ═══════════════════════════════════════

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  body      String
  data      Json?
  readAt    DateTime?
  sentAt    DateTime?
  createdAt DateTime         @default(now())

  user      User             @relation(fields: [userId], references: [id])

  @@index([userId, readAt])
  @@map("notifications")
}

// ═══════════════════════════════════════
// FINANCEIRO
// ═══════════════════════════════════════

model FinancialRecord {
  id             String          @id @default(cuid())
  userId         String
  confirmationId String          @unique
  amount         Decimal         @db.Decimal(10, 2)
  status         FinancialStatus @default(PENDING)
  dueDate        DateTime?
  paidAt         DateTime?
  notes          String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  user           User              @relation(fields: [userId], references: [id])
  confirmation   ShiftConfirmation @relation(fields: [confirmationId], references: [id])

  @@index([userId, status])
  @@map("financial_records")
}

// ═══════════════════════════════════════
// AUDITORIA
// ═══════════════════════════════════════

model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String   // "schedule.published", "shift.confirmed"
  entityType String
  entityId   String
  before     Json?
  after      Json?
  ip         String?
  userAgent  String?
  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id])

  @@index([entityType, entityId])
  @@index([userId])
  @@map("audit_logs")
}

// ═══════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════

enum Plan {
  BASIC
  PREMIUM
  ENTERPRISE
}

enum BillingCycle {
  MONTHLY
  QUARTERLY
  ANNUAL
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELLED
  EXPIRED
}

enum UserRole {
  ADMIN        // Dono/gestor principal
  MANAGER      // Gestor adicional
  PROFESSIONAL // Profissional de saúde
}

enum ScheduleStatus {
  DRAFT
  PUBLISHED
  CLOSED
  ARCHIVED
}

enum ConfirmationStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
}

enum Platform {
  IOS
  ANDROID
  WEB
}

enum NotificationType {
  SHIFT_AVAILABLE
  SHIFT_CONFIRMED
  SHIFT_CANCELLED
  SCHEDULE_PUBLISHED
  SCHEDULE_UPDATED
  PAYMENT_RECEIVED
  SYSTEM
}

enum FinancialStatus {
  PENDING
  CONFIRMED
  PAID
  CANCELLED
}
```

---

## 7. Módulos do Backend (NestJS)

### 7.1 Estrutura de Cada Módulo

```
modules/schedules/
├── schedules.module.ts
├── schedules.controller.ts      # REST endpoints
├── schedules.service.ts         # Business logic
├── schedules.gateway.ts         # WebSocket events
├── schedules.repository.ts      # Prisma queries
├── dto/
│   ├── create-schedule.dto.ts
│   ├── update-schedule.dto.ts
│   └── schedule-filters.dto.ts
└── events/
    └── schedule-published.event.ts
```

### 7.2 Guards e Isolamento Multi-tenant

```typescript
// shared/guards/tenant.guard.ts
// Extrai organizationId do JWT e injeta em todos os requests
// NUNCA permitir acesso cross-tenant sem verificação explícita

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest()
    const user = req.user
    const tenantId = req.params.organizationId || req.body.organizationId
    return !tenantId || user.organizationId === tenantId
  }
}
```

### 7.3 Sistema de Limites por Plano

```typescript
// shared/decorators/plan-limit.decorator.ts
// Verificar antes de criar entidades se o plano permite

const PLAN_LIMITS = {
  BASIC:      { professionals: 15, locations: 1, managers: 2 },
  PREMIUM:    { professionals: 30, locations: 2, managers: 3 },
  ENTERPRISE: { professionals: 100, locations: 8, managers: 10 },
}
```

### 7.4 Fila de Notificações (BullMQ)

```typescript
// modules/notifications/queues/notification.queue.ts
// Jobs: send-push, send-email, batch-notify
// Retry: 3 tentativas com backoff exponencial
// Dead letter queue para falhas permanentes
// Tracking de entrega por notification ID
```

---

## 8. Telas Principais e Fluxos

### 8.1 Fluxo de Autenticação

```
/login
  → JWT access token (15min) + refresh token (30d) em httpOnly cookie
  → Redirect para /overview (gestor) ou app mobile (profissional)

/register
  → Wizard em 3 passos: Dados pessoais → Dados da organização → Plano
  → Trial de 7 dias ativado automaticamente
  → E-mail de boas-vindas com link de onboarding

/forgot-password
  → Link temporário por e-mail (15min de validade)
  → Rate limit: 3 tentativas por hora por IP
```

### 8.2 Dashboard do Gestor (Web)

#### /overview
- KPI cards: escalas ativas, profissionais confirmados, taxa de ocupação, custo do mês
- Feed de atividades recentes em tempo real (WebSocket)
- Alertas: plantões com vagas abertas, confirmações pendentes
- Mini-calendário da semana atual

#### /schedules
- Lista de escalas com status visual (badge colorido)
- Botão "Nova Escala" → Modal/Sheet de criação rápida
- Filtros por local, status, período

#### /schedules/[id]
- Calendário de plantões (FullCalendar — Monthly/Weekly/Daily view)
- Sidebar com lista de profissionais confirmados por turno
- Ações em lote: duplicar escala, fechar, arquivar
- Real-time: indicador de quem confirmou ao vivo

### 8.3 App Mobile (Profissional)

#### Home/Feed
- Lista de plantões disponíveis no topo (destaque visual)
- Feed cronológico de notificações
- Quick stats: próximo plantão, ganhos do mês

#### Confirmar Plantão (1 clique)
1. Push notification → tap abre detalhes
2. Tela de detalhe: local, data, horário, valor
3. Botão grande "Confirmar Plantão" com haptic feedback
4. Animação de sucesso (confetti ou check animado)
5. Calendário pessoal atualizado instantaneamente

---

## 9. Fluxo de Desenvolvimento

### 9.1 Fases e Prioridades

#### Fase 1 — MVP (8 semanas)
**Semana 1-2: Infraestrutura e Auth**
- [ ] Monorepo com Turborepo
- [ ] Docker Compose (Postgres + Redis)
- [ ] NestJS com Prisma + migrations
- [ ] Auth: JWT + refresh tokens + 2FA básico
- [ ] Multi-tenant guard
- [ ] Next.js 14 setup com shadcn/ui

**Semana 3-4: Core — Escalas e Plantões**
- [ ] CRUD de Escalas (Schedules)
- [ ] CRUD de Plantões (Shifts)
- [ ] Publicação de escala (status PUBLISHED)
- [ ] Confirmação de plantão pelo profissional

**Semana 5-6: Notificações e Real-time**
- [ ] BullMQ filas de notificação
- [ ] FCM push notifications
- [ ] WebSocket para dashboard (Socket.io)
- [ ] E-mail transacional (Resend)

**Semana 7: Dashboard Web**
- [ ] Layout dashboard + sidebar
- [ ] Tela /overview com KPIs
- [ ] Tela /schedules + calendário
- [ ] Gestão de profissionais básica

**Semana 8: MVP Mobile + PWA**
- [ ] Expo app com auth
- [ ] Feed de plantões disponíveis
- [ ] Confirmação com 1 clique
- [ ] PWA manifest + Service Worker básico

#### Fase 2 — Growth (semanas 9-16)
- [ ] Relatórios e exportação (PDF/Excel)
- [ ] Gestão financeira
- [ ] Onboarding wizard
- [ ] Planos e pagamentos (Stripe + Pagar.me)
- [ ] Painel admin SaaS
- [ ] App iOS/Android nas stores

#### Fase 3 — Scale (semanas 17+)
- [ ] Integrações (webhooks, HIS)
- [ ] Analytics avançado
- [ ] White-label
- [ ] API pública documentada
- [ ] Performance: edge caching, read replicas

### 9.2 Convenções de Código

#### Commits (Conventional Commits)
```
feat(schedules): add bulk shift creation
fix(auth): handle refresh token expiry correctly
chore(deps): update prisma to v5.10
docs(api): add swagger annotations to shifts module
test(notifications): add push delivery tracking tests
```

> **ATENÇÃO — Workflow Multi-Agente:** O dono pode trabalhar com vários agentes de IA simultaneamente (Claude, Gemini, Codex, Cursor, etc.). Por isso, **todo agente DEVE fazer `git commit` + `git push` imediatamente após qualquer alteração**, identificando qual agente realizou o commit. Veja a Seção 15 para as regras completas.

#### Nomenclatura
- **Arquivos:** kebab-case (`shift-confirmation.service.ts`)
- **Classes/Interfaces:** PascalCase (`ShiftConfirmation`)
- **Funções/variáveis:** camelCase (`getShiftsBySchedule`)
- **Constantes:** SCREAMING_SNAKE_CASE (`MAX_PROFESSIONALS_BASIC`)
- **Rotas API:** kebab-case (`/shifts/bulk-confirm`)
- **Banco:** snake_case (`shift_confirmations`)

#### Estrutura de Endpoint REST
```
GET    /api/v1/schedules              # listar
GET    /api/v1/schedules/:id          # buscar por ID
POST   /api/v1/schedules              # criar
PATCH  /api/v1/schedules/:id          # atualizar
DELETE /api/v1/schedules/:id          # deletar (soft delete)
POST   /api/v1/schedules/:id/publish  # ação especial
```

#### Tratamento de Erros
```typescript
// Sempre retornar erros padronizados
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Limite de profissionais atingido para o plano BASIC",
  "code": "PLAN_LIMIT_EXCEEDED",
  "details": { "current": 15, "max": 15, "plan": "BASIC" }
}
```

---

## 10. PWA — Configuração Completa

### 10.1 Manifest
```json
{
  "name": "CONFIRMA PLANTÃO",
  "short_name": "Plantão",
  "description": "Gestão inteligente de escalas médicas",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#09090f",
  "theme_color": "#6366f1",
  "categories": ["medical", "productivity", "business"],
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable any" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable any" }
  ],
  "screenshots": [
    { "src": "/screenshots/dashboard.png", "sizes": "1280x720", "type": "image/png" }
  ]
}
```

### 10.2 Service Worker (Workbox via next-pwa)
```typescript
// Estratégias de cache:
// - CacheFirst: assets estáticos, ícones, fontes
// - NetworkFirst: dados da API com fallback para cache
// - StaleWhileRevalidate: dados de dashboard
// Pré-cache: rotas principais do app
// Background sync: confirmações offline → sync quando conectar
```

---

## 11. Segurança e LGPD

### 11.1 Checklist de Segurança
- [ ] Rate limiting em todos os endpoints (nestjs-throttler)
- [ ] Helmet.js (headers de segurança)
- [ ] CORS restrito ao domínio do frontend
- [ ] Input sanitization (class-validator + sanitize-html)
- [ ] SQL injection impossível via Prisma (parameterized queries)
- [ ] JWT em httpOnly cookies (não localStorage)
- [ ] Refresh token rotation após cada uso
- [ ] 2FA via TOTP (qrcode + speakeasy)
- [ ] Row-Level Security no PostgreSQL por organização
- [ ] Auditoria de todas as ações sensíveis

### 11.2 LGPD
- [ ] Consentimento explícito no cadastro
- [ ] Página de Privacy Policy e Termos
- [ ] API de exportação de dados do usuário
- [ ] API de exclusão de conta (soft delete → hard delete após 30d)
- [ ] Data Processing Agreement para organizações
- [ ] Logs de acesso retidos por 6 meses
- [ ] Criptografia AES-256 para dados sensíveis em repouso

---

## 12. Deploy e Infraestrutura (Render)

### 12.1 Arquitetura Unificada

O backend (NestJS) e o frontend (Next.js) são servidos na **mesma URL e porta** por um servidor unificado (`server.js` na raiz do projeto).

```
https://plantaosync.onrender.com
├── /api/v1/*  → NestJS (backend)
└── /*         → Next.js (frontend)
```

**Como funciona:**
- `server.js` cria uma instância Express compartilhada
- NestJS registra suas rotas em `/api/v1/*` nessa instância
- Next.js atua como fallback para todas as outras rotas
- Ambos rodam no mesmo processo Node.js, na mesma porta

**Render Service:** `plantaosync` (Web Service, Node, Oregon)
- **Build Command:** `npm install -g pnpm && pnpm install --frozen-lockfile && pnpm --filter=api run db:generate && pnpm run build --filter=web... && pnpm --filter=api run build`
- **Start Command:** `node server.js`
- **Service ID:** `srv-d6blqdmr433s73d8lfng`

### 12.2 Render CLI

O Render CLI está instalado e autenticado na máquina local. Use-o para acessar logs e diagnosticar problemas diretamente pelo terminal, sem precisar abrir o browser.

```bash
# Ver logs em tempo real do serviço
render logs --service srv-d6blqdmr433s73d8lfng --tail

# Ver logs recentes
render logs --service srv-d6blqdmr433s73d8lfng

# Listar deploys
render deploys list --service srv-d6blqdmr433s73d8lfng

# Disparar deploy manual
render deploys create --service srv-d6blqdmr433s73d8lfng

# Ver status do serviço
render services show srv-d6blqdmr433s73d8lfng
```

**Dica:** Quando houver erro no deploy, use `render logs` para ver os logs de build e runtime diretamente no terminal. É mais rápido que navegar pelo dashboard.

### 12.3 Variáveis de Ambiente

Todas as variáveis estão configuradas tanto no `.env` (raiz do monorepo) quanto no dashboard do Render.

```env
NODE_ENV=production
PORT=3001
APP_URL=https://plantaosync.onrender.com
FRONTEND_URL=https://plantaosync.onrender.com
API_URL=https://plantaosync.onrender.com
CORS_ORIGINS=https://plantaosync.onrender.com
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
REDIS_URL=
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false
JWT_ACCESS_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES_IN=30d
JWT_SECRET=
NEXT_PUBLIC_APP_URL=https://plantaosync.onrender.com
NEXT_PUBLIC_API_URL=https://plantaosync.onrender.com
NEXT_PUBLIC_WS_URL=wss://plantaosync.onrender.com
NEXT_PUBLIC_APP_ENV=production
EXPO_PUBLIC_API_URL=https://plantaosync.onrender.com
EXPO_PUBLIC_WS_URL=wss://plantaosync.onrender.com
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
RESEND_API_KEY=
EMAIL_FROM=noreply@plantaosync.com
EMAIL_FROM_NAME=CONFIRMA PLANTAO
R2_ACCOUNT_ID=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Importante:** Todas as URLs (APP_URL, API_URL, NEXT_PUBLIC_API_URL, etc.) apontam para o mesmo domínio `https://plantaosync.onrender.com` pois backend e frontend estão unificados.

---

## 13. Comandos de Desenvolvimento

```bash
# Instalar dependências (usar pnpm)
pnpm install

# Iniciar ambiente local
docker-compose up -d          # Postgres + Redis
pnpm dev                      # Todos os apps em paralelo (Turborepo)

# Ou individualmente:
pnpm --filter=api dev          # Backend :3001
pnpm --filter=web dev          # Frontend :3002
pnpm --filter=mobile start     # Expo app

# Banco de dados
pnpm --filter=api db:migrate   # Rodar migrations
pnpm --filter=api db:seed      # Popular com dados de teste
pnpm --filter=api db:studio    # Prisma Studio :5555

# Testes
pnpm test                      # Todos os testes
pnpm --filter=api test:e2e     # E2E do backend

# Build de produção
pnpm build

# Servidor unificado (produção local)
NODE_ENV=production node server.js
```

---

## 14. Pontos de Atenção Críticos

1. **Multi-tenant desde o início** — nunca fazer query sem filtrar por `organizationId`
2. **Notificações são o core do produto** — implementar retry, delivery tracking e dead-letter queue
3. **Performance mobile** — FlatList virtualizada, imagens otimizadas, bundle splitting
4. **Offline no mobile** — confirmações devem ser enfileiradas e sincronizadas
5. **Calendário de escalas** — componente mais complexo; usar biblioteca madura
6. **Limites de plano** — verificar ANTES de criar qualquer entidade limitada
7. **Auditoria** — registrar tudo: quem, o quê, quando, de onde
8. **Dark mode** — implementar desde o componente 1, não como afterthought
9. **Acessibilidade** — ARIA labels, contraste mínimo AA, navegação por teclado
10. **Exportação PDF** — hospitais precisam de relatórios para auditorias regulatórias
11. **Deploy unificado** — backend e frontend rodam no mesmo serviço Render via `server.js`; para debug use o Render CLI (`render logs`)

---

## 15. Workflow Multi-Agente — Regras de Git OBRIGATÓRIAS

> Este projeto é desenvolvido com **múltiplos agentes de IA trabalhando em paralelo** (Claude, Gemini, Codex, Cursor, e outros). Para evitar conflitos e manter o histórico rastreável, **todos os agentes devem seguir estas regras sem exceção**.

### 15.1 Regra de Ouro

**Todo agente que fizer qualquer alteração em qualquer arquivo DEVE, imediatamente após a alteração:**

1. `git add` nos arquivos modificados
2. `git commit` com mensagem identificando o agente
3. `git push origin main`

Não existe "vou commitar depois" ou "vou agrupar alterações". **Cada sessão de trabalho termina com um push.**

### 15.2 Formato de Commit com Identificação do Agente

O trailer `Co-Authored-By` identifica qual agente fez o commit. Use exatamente o formato abaixo conforme o agente:

```
<tipo>(<escopo>): <descrição breve do que foi feito>

Co-Authored-By: Claude Sonnet <claude@anthropic.com>
```

#### Identificadores por Agente

| Agente | Trailer obrigatório no commit |
|--------|-------------------------------|
| **Claude** (Anthropic / Claude Code) | `Co-Authored-By: Claude Sonnet <claude@anthropic.com>` |
| **Gemini** (Google) | `Co-Authored-By: Gemini <gemini@google.com>` |
| **Codex / ChatGPT** (OpenAI) | `Co-Authored-By: OpenAI Codex <codex@openai.com>` |
| **Cursor** (Cursor AI) | `Co-Authored-By: Cursor AI <cursor@cursor.sh>` |
| **Copilot** (GitHub) | `Co-Authored-By: GitHub Copilot <copilot@github.com>` |
| **Outro agente** | `Co-Authored-By: <Nome do Agente> <identificador>` |

#### Exemplos de commits válidos

```bash
# Claude fazendo uma correção de bug
git commit -m "fix(auth): corrigir refresh token expirado

Co-Authored-By: Claude Sonnet <claude@anthropic.com>"

# Gemini adicionando uma feature
git commit -m "feat(schedules): adicionar filtro por especialidade

Co-Authored-By: Gemini <gemini@google.com>"

# Codex refatorando um componente
git commit -m "refactor(ui): simplificar componente de calendário

Co-Authored-By: OpenAI Codex <codex@openai.com>"
```

### 15.3 Procedimento Completo Passo a Passo

Todo agente deve executar exatamente esta sequência ao finalizar qualquer trabalho:

```bash
# 1. Ver o que foi alterado
git status

# 2. Adicionar os arquivos relevantes (nunca usar git add -A às cegas)
git add <arquivo1> <arquivo2> ...

# 3. Commitar com identificação do agente
git commit -m "$(cat <<'EOF'
<tipo>(<escopo>): <descrição>

Co-Authored-By: <Nome do Agente> <email-do-agente>
EOF
)"

# 4. Push imediato
git push origin main
```

### 15.4 Resolução de Conflitos

Como múltiplos agentes podem trabalhar simultaneamente, conflitos de merge podem ocorrer:

1. **Antes de começar qualquer trabalho:** `git pull origin main` para ter o código mais recente
2. **Se o push falhar por conflito:**
   ```bash
   git pull --rebase origin main
   # Resolver conflitos manualmente se necessário
   git push origin main
   ```
3. **Nunca usar `--force` no push** sem autorização explícita do dono
4. **Em caso de conflito complexo:** parar e avisar o dono antes de prosseguir

### 15.5 O Que NÃO Fazer

- ❌ Fazer alterações sem commitar
- ❌ Acumular várias alterações em um único commit ao final da sessão
- ❌ Usar `git add .` ou `git add -A` sem revisar o que está sendo adicionado
- ❌ Omitir o trailer `Co-Authored-By` no commit
- ❌ Fazer push sem ter feito pull primeiro quando há trabalho paralelo
- ❌ Ignorar erros de push — sempre resolver antes de continuar

---

*Documento atualizado em 20/02/2026.*

