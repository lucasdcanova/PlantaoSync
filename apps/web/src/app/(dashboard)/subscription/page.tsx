'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, CreditCard, Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DEMO_SUBSCRIPTION } from '@/lib/demo-data'
import { useAuthStore } from '@/store/auth.store'
import { useInstitutionStore } from '@/store/institution.store'
import { useLocationsStore } from '@/store/locations.store'
import { useProfessionalsStore } from '@/store/professionals.store'

type PlanKey = 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
type BillingCycle = 'MONTHLY'

type PlanDefinition = {
  key: PlanKey
  name: string
  monthlyPriceInCents: number
  subtitle: string
  highlights: string[]
  features: string[]
  featured?: boolean
}

const PLAN_CATALOG: PlanDefinition[] = [
  {
    key: 'BASIC',
    name: 'Básico',
    monthlyPriceInCents: 29_700,
    subtitle: 'Para clínicas e equipes em início de digitalização.',
    highlights: ['15 profissionais', '1 unidade', '2 gestores'],
    features: [
      'Publicação e confirmação de escalas',
      'Gestão de trocas com histórico',
      'Dashboard de cobertura em tempo real',
      'Relatório financeiro mensal',
      'Suporte por e-mail',
    ],
  },
  {
    key: 'PREMIUM',
    name: 'Premium',
    monthlyPriceInCents: 59_700,
    subtitle: 'Para hospitais e operações com múltiplos setores críticos.',
    highlights: ['30 profissionais', '2 unidades', '3 gestores'],
    features: [
      'Tudo do plano Básico',
      'Visão consolidada multi-unidade',
      'Alertas inteligentes de cobertura',
      'Exportação avançada PDF/Excel',
      'Suporte prioritário',
    ],
    featured: true,
  },
  {
    key: 'ENTERPRISE',
    name: 'Enterprise',
    monthlyPriceInCents: 119_700,
    subtitle: 'Para redes hospitalares com alta complexidade operacional.',
    highlights: ['100 profissionais', '8 unidades', '10 gestores'],
    features: [
      'Tudo do plano Premium',
      'Onboarding dedicado',
      'Integração via API',
      'Gestor de conta exclusivo',
      'Relatórios para auditoria regulatória',
    ],
  },
]

const PLAN_LIMITS: Record<PlanKey, { professionals: number; locations: number; managers: number }> =
  {
    BASIC: { professionals: 15, locations: 1, managers: 2 },
    PREMIUM: { professionals: 30, locations: 2, managers: 3 },
    ENTERPRISE: { professionals: 100, locations: 8, managers: 10 },
  }

const PLAN_SUPPORT: Record<PlanKey, string> = {
  BASIC: 'Suporte por e-mail com resposta em até 48h',
  PREMIUM: 'Suporte por e-mail em horário comercial + base de conhecimento',
  ENTERPRISE: 'Suporte prioritário 24/7 + especialista dedicado',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Ativo',
  TRIAL: 'Trial',
  PAST_DUE: 'Pagamento pendente',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Expirado',
}

const STATUS_BADGE_CLASSES: Record<string, string> = {
  ACTIVE:
    'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
  TRIAL:
    'border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300',
  PAST_DUE:
    'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  CANCELLED:
    'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-300',
  EXPIRED:
    'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-300',
}

function toCurrency(valueInCents: number) {
  return (valueInCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function normalizePlan(rawPlan?: string): PlanKey {
  if (rawPlan === 'PREMIUM' || rawPlan === 'ENTERPRISE') return rawPlan
  return 'BASIC'
}

type CheckoutPayload = {
  plan: PlanKey
  billingCycle: BillingCycle
  customerEmail?: string
  organizationId?: string
  organizationName?: string
}

type CheckoutResponse = {
  url?: string
  message?: string
}

export default function SubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isDemoMode = useAuthStore((state) => state.isDemoMode)
  const user = useAuthStore((state) => state.user)
  const institution = useInstitutionStore()
  const managers = useInstitutionStore((state) => state.managers)
  const professionals = useProfessionalsStore((state) =>
    state.professionals.filter((professional) => professional.hospitalStatus === 'ATIVO'),
  )
  const locations = useLocationsStore((state) =>
    state.locations.filter((location) => location.isActive),
  )

  const [processingPlan, setProcessingPlan] = useState<PlanKey | null>(null)
  const handledCheckoutReturn = useRef(false)

  const currentPlan = useMemo(
    () => normalizePlan(user?.organization?.subscription?.plan),
    [user?.organization?.subscription?.plan],
  )

  const currentStatus =
    user?.organization?.subscription?.status ?? (isDemoMode ? 'ACTIVE' : 'TRIAL')
  const trialEndsAt = user?.organization?.subscription?.trialEndsAt
  const limits = isDemoMode ? DEMO_SUBSCRIPTION.limits : PLAN_LIMITS[currentPlan]
  const supportText = isDemoMode ? DEMO_SUBSCRIPTION.support : PLAN_SUPPORT[currentPlan]

  const usageItems = isDemoMode
    ? [
        {
          label: 'Profissionais',
          used: DEMO_SUBSCRIPTION.usage.professionals,
          limit: DEMO_SUBSCRIPTION.limits.professionals,
        },
        {
          label: 'Locais',
          used: DEMO_SUBSCRIPTION.usage.locations,
          limit: DEMO_SUBSCRIPTION.limits.locations,
        },
        {
          label: 'Gestores',
          used: DEMO_SUBSCRIPTION.usage.managers,
          limit: DEMO_SUBSCRIPTION.limits.managers,
        },
      ]
    : [
        { label: 'Profissionais', used: professionals.length, limit: limits.professionals },
        { label: 'Locais', used: locations.length, limit: limits.locations },
        { label: 'Gestores', used: managers.length, limit: limits.managers },
      ]

  useEffect(() => {
    if (handledCheckoutReturn.current) return

    const checkoutState = searchParams.get('checkout')
    if (!checkoutState) return

    handledCheckoutReturn.current = true

    if (checkoutState === 'success') {
      toast.success(
        'Pagamento iniciado com sucesso. Assim que confirmado, o plano será atualizado.',
      )
    } else if (checkoutState === 'cancel') {
      toast.info('Checkout cancelado. Você pode tentar novamente quando quiser.')
    }

    router.replace('/subscription')
  }, [router, searchParams])

  const handleStartCheckout = async (plan: PlanKey) => {
    if (isDemoMode) {
      toast.info('Checkout indisponível no modo demo.')
      return
    }

    const payload: CheckoutPayload = {
      plan,
      billingCycle: 'MONTHLY',
      customerEmail: user?.email,
      organizationId: user?.organizationId,
      organizationName: institution.name || user?.organization?.name,
    }

    setProcessingPlan(plan)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = (await response.json()) as CheckoutResponse

      if (!response.ok || !data.url) {
        throw new Error(data.message || 'Não foi possível iniciar o checkout.')
      }

      window.location.href = data.url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao iniciar checkout Stripe.')
    } finally {
      setProcessingPlan(null)
    }
  }

  const currentPlanName = PLAN_CATALOG.find((plan) => plan.key === currentPlan)?.name ?? 'Básico'
  const statusLabel = STATUS_LABELS[currentStatus] ?? currentStatus
  const statusBadgeClass =
    STATUS_BADGE_CLASSES[currentStatus] ??
    'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300'

  return (
    <>
      <Header
        title="Plano e assinatura"
        subtitle="Controle do plano, limites e aquisição com Stripe"
      />

      <div className="space-y-6 p-4 sm:p-6">
        <section className="border-border bg-card shadow-card rounded-2xl border p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Plano atual</p>
              <h2 className="text-foreground mt-1 text-xl font-bold sm:text-2xl">
                {currentPlanName}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Cobrança mensal ativa com gestão de limites por organização.
              </p>
              {trialEndsAt && currentStatus === 'TRIAL' && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Trial até {new Date(trialEndsAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            <Badge className={statusBadgeClass}>{statusLabel}</Badge>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {usageItems.map((item) => {
              const usagePercentage =
                item.limit > 0 ? Math.round((item.used / item.limit) * 100) : 0
              return (
                <article
                  key={item.label}
                  className="border-border bg-background rounded-xl border p-4"
                >
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="text-foreground mt-2 text-lg font-semibold">
                    {item.used} / {item.limit}
                  </p>
                  <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
                    <div
                      className="bg-brand-500 h-full rounded-full"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {usagePercentage}% da capacidade usada
                  </p>
                </article>
              )
            })}
          </div>

          <div className="border-border bg-background mt-5 rounded-xl border p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">Suporte</p>
            <p className="text-foreground mt-2 text-sm">{supportText}</p>
          </div>
        </section>

        <section className="border-border bg-card shadow-card rounded-2xl border p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Aquisição de plano
              </p>
              <h3 className="text-foreground mt-1 text-xl font-bold">
                Contrate ou altere seu plano
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Cobrança Stripe com os mesmos valores da landing page.
              </p>
            </div>
            <div className="border-brand-200 bg-brand-50 text-brand-700 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Checkout seguro via Stripe
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {PLAN_CATALOG.map((plan) => {
              const isCurrentPlan = plan.key === currentPlan && currentStatus === 'ACTIVE'
              const isLoading = processingPlan === plan.key

              return (
                <article
                  key={plan.key}
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    plan.featured
                      ? 'border-brand-300 bg-brand-50/40 shadow-[0_12px_32px_rgba(43,181,171,0.16)]'
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-wide">
                        {plan.name}
                      </p>
                      <div className="mt-2 flex items-end gap-1">
                        <span className="text-foreground text-3xl font-bold">
                          {toCurrency(plan.monthlyPriceInCents)}
                        </span>
                        <span className="text-muted-foreground mb-1 text-xs">/mês</span>
                      </div>
                    </div>
                    {plan.featured ? (
                      <Badge className="border-brand-300 bg-brand-100 text-brand-800 border">
                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                        Mais escolhido
                      </Badge>
                    ) : null}
                  </div>

                  <p className="text-muted-foreground mt-2 text-sm">{plan.subtitle}</p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {plan.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="bg-muted rounded-lg px-2 py-2 text-center text-[11px] font-semibold"
                      >
                        {highlight}
                      </div>
                    ))}
                  </div>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="text-foreground/90 flex items-start gap-2 text-sm"
                      >
                        <Check className="text-brand-700 mt-0.5 h-4 w-4" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleStartCheckout(plan.key)}
                    className="mt-5 w-full"
                    variant={isCurrentPlan ? 'secondary' : 'default'}
                    disabled={isLoading || (processingPlan !== null && !isLoading)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando checkout...
                      </>
                    ) : isCurrentPlan ? (
                      'Plano atual'
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Assinar com Stripe
                      </>
                    )}
                  </Button>
                </article>
              )
            })}
          </div>

          <p className="text-muted-foreground mt-4 text-xs">
            Após o pagamento, a Stripe retorna para o app e a assinatura é atualizada no próximo
            ciclo de sincronização.
          </p>
        </section>
      </div>
    </>
  )
}
