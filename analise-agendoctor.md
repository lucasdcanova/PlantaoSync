# Análise Completa — Agendoctor
> Documento gerado para servir de base ao desenvolvimento de um app similar.  
> URL analisada: https://agendoctor.com  
> Data da análise: 19/02/2026

---

## 1. Visão Geral do Produto

**Agendoctor** é uma plataforma SaaS (Software as a Service) B2B voltada para o setor de saúde, com foco em **gestão de escalas e plantões médicos**. Ela conecta dois perfis de usuários:

- **Gestores hospitalares** (diretores, coordenadores de RH, administradores de clínicas) — responsáveis por criar, publicar e gerenciar as escalas de trabalho.
- **Profissionais de saúde** (médicos, enfermeiros, plantonistas) — que visualizam, escolhem e confirmam os plantões disponíveis.

### Proposta de Valor Central
Substituir a gestão manual de escalas feita via planilhas e WhatsApp por uma plataforma automatizada, economizando até **80% do tempo de gestão** (de 4–6h para ~30 min/semana), reduzindo erros de comunicação e aumentando a satisfação das equipes.

### Números de Mercado (exibidos na landing page)
| Métrica | Valor |
|---|---|
| Hospitais Ativos | 500+ |
| Profissionais na plataforma | 10.000+ |
| Índice de Satisfação | 98% |
| Redução de tempo de gestão | 80% |

---

## 2. Funcionalidades do Produto

### 2.1 Publicação Rápida de Escalas
- Gestores criam e publicam escalas de plantões em segundos.
- Interface intuitiva e processo simplificado (sem necessidade de conhecimento técnico).
- Publicação ilimitada de escalas em todos os planos.
- Suporta múltiplos locais (unidades hospitalares) dependendo do plano.

### 2.2 Gestão de Equipes
- Cadastro e gerenciamento centralizado de profissionais de saúde.
- Organização por local/unidade hospitalar.
- Limite de profissionais por plano (15 no Básico, 30 no Premium, 100 no Enterprise).
- Visibilidade total das escalas em tempo real.

### 2.3 Notificações em Tempo Real
- Alertas automáticos disparados para profissionais quando novos plantões são publicados.
- Notificações de alterações em escalas existentes.
- Confirmações instantâneas quando um profissional aceita um plantão.
- Notificações proativas de vagas disponíveis (alertas proativos).

### 2.4 Fluxo de Confirmação de Plantões
- Profissional recebe notificação push/in-app de plantão disponível.
- Profissional visualiza detalhes do plantão no app mobile.
- Profissional aceita o plantão com **um único clique**.
- Sistema atualiza automaticamente a escala para todos.
- Gestor recebe confirmação em tempo real.

### 2.5 Relatórios e Analytics
- Análises de **ocupação** de leitos/vagas.
- Controle de **horas trabalhadas** por profissional.
- Análise de **performance da equipe**.
- **Dashboard** com análise de custos.
- Relatórios automáticos e **exportáveis** (CSV/Excel/PDF, inferido).
- Histórico completo de escalas e plantões confirmados.

### 2.6 Gestão Financeira para Profissionais
- Histórico financeiro integrado para profissionais.
- Controle de remuneração por plantão.
- Visibilidade de ganhos por período.

### 2.7 App Mobile Nativo
- Disponível para **iOS e Android**.
- Profissionais acessam todas as funcionalidades pelo smartphone.
- Gestores também podem gerenciar pelo mobile.
- Notificações push nativas.

### 2.8 Segurança e Compliance (LGPD)
- Conformidade total com a **Lei Geral de Proteção de Dados (LGPD)**.
- Criptografia de ponta a ponta dos dados.
- Certificações de segurança hospitalar.
- Servidores certificados.
- Rastreabilidade completa de ações (auditoria).

### 2.9 Multi-tenant e Multi-local
- Suporte a múltiplos locais/unidades por conta (1 no Básico, 2 no Premium, 8 no Enterprise).
- Múltiplos usuários gestores por conta (2, 3 ou 10 dependendo do plano).
- Arquitetura multi-tenant implícita (cada hospital é um tenant isolado).

### 2.10 Integrações
- Compatibilidade com sistemas hospitalares existentes (HIS, ERP de saúde).
- Mencionado na landing page como recurso, sem especificação de integrações específicas.

### 2.11 Suporte
- Suporte em português brasileiro.
- Horário comercial (Básico): segunda a sexta, 8h–20h.
- Suporte estendido 24h (Premium).
- Suporte prioritário 24/7 (Enterprise).
- Canais: chat, e-mail e telefone.
- Onboarding completo oferecido pela equipe.

---

## 3. Fluxo Principal do Usuário (How It Works)

```
[Gestor] → Cria escala na plataforma web/mobile
     ↓
[Sistema] → Publica escala e envia notificações push
     ↓
[Profissional] → Recebe notificação e visualiza plantões no app mobile
     ↓
[Profissional] → Aceita plantão com 1 clique
     ↓
[Sistema] → Atualiza escala automaticamente + notifica gestor
     ↓
[Gestor] → Confirma escala completa no dashboard
```

---

## 4. Modelo de Negócio e Precificação

### 4.1 Modelo SaaS com Assinaturas
- Modelo de recorrência mensal, trimestral ou anual.
- Desconto de 5% no plano trimestral e 12% no plano anual.
- Trial gratuito de 7 dias **sem cartão de crédito**.
- Garantia incondicional de 30 dias com devolução total.

### 4.2 Planos (valores no modo anual)

| Plano | Preço/mês (anual) | Preço cheio | Usuários | Locais | Profissionais |
|---|---|---|---|---|---|
| **Básico** | R$ 149,51 | R$ 169,90 | 2 | 1 | 15 |
| **Premium** | R$ 245,52 | R$ 279,00 | 3 | 2 | 30 |
| **Enterprise** | R$ 544,72 | R$ 619,00 | 10 | 8 | 100 |

### 4.3 Recursos Inclusos em Todos os Planos
- Publicação ilimitada de escalas
- Notificações em tempo real
- App mobile iOS e Android
- Relatórios e exportações
- Histórico completo
- Diferença apenas no nível de suporte e limites de usuários/locais/profissionais

---

## 5. Estrutura da Landing Page (UX/Marketing)

A landing page segue uma estrutura clássica de **SaaS de alta conversão**:

1. **Hero Section** — Headline impactante + CTA principal ("Começar Teste Grátis por 7 Dias") + social proof (500+ hospitais, 10k+ profissionais, 98% satisfação, 80% menos tempo)
2. **Problema vs. Solução** — Comparativo direto entre dores do método tradicional e benefícios da plataforma
3. **Features Grid** — 6 cards com ícones mostrando as funcionalidades principais
4. **How It Works** — 3 passos ilustrados com imagens
5. **Benefits Split** — Benefícios separados por persona (Para Gestores / Para Profissionais)
6. **ROI Section** — Números de retorno sobre investimento (80%, 95%, 2x)
7. **Testimonials** — 3 depoimentos com nome, cargo e instituição
8. **Comparison Table** — Método Tradicional vs. Com Agendoctor
9. **Trust Signals** — LGPD, Suporte 24/7, Atualizações, Integrações
10. **Pricing** — Tabela de planos com toggle mensal/trimestral/anual
11. **FAQ** — 6 perguntas frequentes em accordion
12. **CTA Final** — Chamada de ação com urgência social ("50+ hospitais este mês") + garantia de 30 dias
13. **Footer** — Links de produto, empresa e legal (Privacidade, Termos, LGPD)

---

## 6. Arquitetura Recomendada para o Backend

### 6.1 Stack Sugerida
- **Linguagem/Runtime:** Node.js (com TypeScript) ou Go para alta performance
- **Framework API:** NestJS (Node) ou Fastify — ambos excelentes para APIs REST + WebSocket
- **Banco de Dados Principal:** PostgreSQL (relacional, ideal para regras de negócio complexas de escalas)
- **Cache:** Redis (sessões, filas de notificação, dados de tempo real)
- **Fila de Mensagens:** BullMQ (sobre Redis) ou RabbitMQ para jobs assíncronos (envio de notificações, relatórios)
- **Notificações Push:** Firebase Cloud Messaging (FCM) para iOS/Android
- **Storage de Arquivos:** AWS S3 ou Cloudflare R2 (exportação de relatórios PDF/Excel)
- **Autenticação:** JWT + Refresh Tokens, com suporte a OAuth2 (Google SSO para hospitais)
- **E-mail transacional:** Resend, SendGrid ou AWS SES

### 6.2 Módulos do Backend

```
backend/
├── modules/
│   ├── auth/              # Login, registro, JWT, refresh token, 2FA
│   ├── tenants/           # Multi-tenant: hospitais/clínicas como organizações
│   ├── users/             # Gestores e profissionais de saúde
│   ├── locations/         # Unidades/locais de um tenant
│   ├── schedules/         # Escalas (criação, publicação, edição)
│   ├── shifts/            # Plantões individuais dentro de uma escala
│   ├── confirmations/     # Aceite de plantões por profissionais
│   ├── notifications/     # Gerenciamento de notificações push/email/SMS
│   ├── reports/           # Analytics, exportação de relatórios
│   ├── finances/          # Gestão financeira dos profissionais
│   ├── subscriptions/     # Planos SaaS, pagamentos, limites
│   └── integrations/      # Webhooks e APIs de terceiros
├── shared/
│   ├── guards/            # Auth guards, role guards, tenant isolation
│   ├── interceptors/      # Logging, auditoria
│   └── pipes/             # Validação
```

### 6.3 Modelo de Dados Principal (Entidades)

```sql
-- Multi-tenant
Organization (id, name, slug, plan, createdAt)
Location (id, organizationId, name, address)

-- Usuários
User (id, organizationId, name, email, role: MANAGER|PROFESSIONAL, crm, specialty)

-- Escalas e Plantões  
Schedule (id, organizationId, locationId, title, startDate, endDate, status: DRAFT|PUBLISHED|CLOSED)
Shift (id, scheduleId, locationId, date, startTime, endTime, requiredCount, specialty, valuePerShift)
ShiftConfirmation (id, shiftId, userId, status: PENDING|ACCEPTED|REJECTED|CANCELLED, confirmedAt)

-- Notificações
Notification (id, userId, type, title, body, data, readAt, sentAt)
PushToken (id, userId, token, platform: IOS|ANDROID)

-- Financeiro
FinancialRecord (id, userId, shiftId, amount, status: PENDING|PAID, dueDate)

-- Assinaturas
Subscription (id, organizationId, plan: BASIC|PREMIUM|ENTERPRISE, billingCycle, status, expiresAt)
```

### 6.4 Considerações de Segurança (LGPD)
- Isolamento de dados por tenant (Row-Level Security no PostgreSQL)
- Logs de auditoria para todas as ações sensíveis
- Criptografia de dados em repouso e em trânsito (TLS 1.3)
- Anonimização de dados para relatórios agregados
- Política de retenção e exclusão de dados conforme LGPD
- Controle de acesso baseado em roles (RBAC)

### 6.5 Tempo Real
- **WebSocket** (Socket.io ou nativo) para atualizações de escala em tempo real no dashboard do gestor
- **SSE (Server-Sent Events)** como alternativa mais leve para updates unidirecionais
- **FCM/APNs** para push notifications no mobile

---

## 7. Arquitetura Recomendada para o Frontend

### 7.1 Web App (Dashboard do Gestor)

**Stack Sugerida:**
- **Framework:** Next.js 14+ (React) — excelente para SSR/SSG da landing page + CSR do dashboard
- **UI Library:** shadcn/ui + Tailwind CSS (componentes modernos, alta customização)
- **Estado Global:** Zustand ou TanStack Query (para cache de dados do servidor)
- **Calendário/Escala:** FullCalendar.js ou react-big-calendar (visualização de escalas)
- **Gráficos:** Recharts ou Chart.js (dashboards de relatórios)
- **Formulários:** React Hook Form + Zod (validação tipada)
- **Tabelas:** TanStack Table (tabelas com filtros, paginação, exportação)
- **Notificações Real-Time:** Socket.io client
- **Exportação:** react-pdf ou server-side PDF generation

### 7.2 App Mobile (Profissionais e Gestores)

**Stack Sugerida:**
- **Framework:** React Native com Expo (compartilha código com o web, acelera desenvolvimento)
- **Navigation:** Expo Router (file-based routing moderno)
- **UI Components:** NativeWind (Tailwind para React Native) + React Native Paper
- **Push Notifications:** Expo Notifications (abstração sobre FCM/APNs)
- **Estado/Cache:** TanStack Query (mesma lib usada no web)
- **Offline Support:** AsyncStorage + estratégia de sync quando voltar online
- **Calendário Mobile:** react-native-calendars

### 7.3 Estrutura de Telas (App Mobile)

```
App Mobile
├── Auth
│   ├── Login
│   ├── Cadastro
│   └── Recuperar Senha
├── (tabs)
│   ├── Home/Feed         # Plantões disponíveis + notificações recentes
│   ├── Calendário        # Visão de escala pessoal do profissional
│   ├── Plantões          # Lista de plantões (disponíveis, confirmados, histórico)
│   ├── Financeiro        # Histórico financeiro e remuneração
│   └── Perfil            # Dados pessoais, CRM, especialidade, configurações
└── Notificações          # Central de notificações
```

### 7.4 Estrutura de Telas (Web Dashboard — Gestor)

```
Web Dashboard
├── Landing Page (público)
├── Auth (/login, /register, /forgot-password)
└── Dashboard (privado)
    ├── /overview         # Visão geral com KPIs e alertas
    ├── /schedules        # Lista de escalas + criação
    │   └── /schedules/[id]  # Detalhe da escala com calendário
    ├── /professionals    # Gestão da equipe
    ├── /locations        # Unidades/locais
    ├── /reports          # Analytics e exportações
    ├── /finances         # Controle de custos e pagamentos
    ├── /settings         # Configurações da organização
    └── /subscription     # Plano e faturamento
```

---

## 8. Infraestrutura e DevOps

| Componente | Sugestão |
|---|---|
| Hospedagem Backend | Railway, Render ou AWS ECS (Docker) |
| Hospedagem Frontend | Vercel (Next.js) |
| Banco de Dados | Supabase (PostgreSQL gerenciado) ou Neon.tech |
| Redis | Upstash (serverless Redis) |
| Push Notifications | Firebase FCM (gratuito para alto volume) |
| Monitoramento | Sentry (erros) + Datadog ou Grafana (métricas) |
| CI/CD | GitHub Actions |
| Pagamentos | Stripe (com suporte a BRL) ou Pagar.me (foco Brasil) |

---

## 9. Diferenciais e Pontos de Atenção ao Construir

1. **Multi-tenant desde o início** — não construa como single-tenant e tente migrar depois. Implemente o isolamento de dados por organização desde a modelagem inicial.
2. **Notificações são o core** — a entrega confiável de push notifications é fundamental para o produto funcionar. Invista em retry logic e delivery tracking.
3. **UX mobile-first** — os profissionais de saúde vão usar principalmente o smartphone. O app precisa ser extremamente rápido e simples.
4. **Calendário de escalas** — a visualização de escala (grid de dias × turnos × profissionais) é o componente mais complexo do dashboard. Use bibliotecas prontas e customize.
5. **Compliance LGPD** — construa os mecanismos de consentimento, exclusão de dados e portabilidade desde o início.
6. **Limites por plano** — implemente um sistema de feature flags/limits por subscription para controlar o que cada plano pode fazer.
7. **Onboarding** — a landing menciona "setup em 5 min". Invista em um wizard de onboarding com dados de exemplo para reduzir o time-to-value.
8. **Exportação de relatórios** — hospitais precisam de exportações em Excel/PDF para auditorias. Implemente isso cedo.
9. **Offline resilience no mobile** — profissionais de saúde frequentemente têm conexão instável. O app deve funcionar offline e sincronizar quando conectar.
10. **Auditoria completa** — registre todas as ações (quem criou, editou, confirmou qual plantão e quando). Isso é requisito legal e de confiança para hospitais.

---

*Documento gerado em 19/02/2026 com base na análise da landing page agendoctor.com*
