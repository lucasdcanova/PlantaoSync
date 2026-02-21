'use client'

import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { DEMO_SUBSCRIPTION } from '@/lib/demo-data'
import { useAuthStore } from '@/store/auth.store'
import { useInstitutionStore } from '@/store/institution.store'
import { useProfessionalsStore } from '@/store/professionals.store'
import { useLocationsStore } from '@/store/locations.store'

const PLAN_LIMITS: Record<string, { professionals: number; locations: number; managers: number }> = {
  BASIC:      { professionals: 15,  locations: 1,  managers: 2  },
  PREMIUM:    { professionals: 30,  locations: 2,  managers: 3  },
  ENTERPRISE: { professionals: 100, locations: 8,  managers: 10 },
}

const PLAN_LABELS: Record<string, string> = {
  BASIC:      'Básico',
  PREMIUM:    'Premium',
  ENTERPRISE: 'Enterprise',
}

export default function SubscriptionPage() {
  const isDemoMode = useAuthStore((s) => s.isDemoMode)
  const user = useAuthStore((s) => s.user)
  const managers = useInstitutionStore((s) => s.managers)
  const professionals = useProfessionalsStore((s) => s.professionals.filter((p) => p.hospitalStatus === 'ATIVO'))
  const locations = useLocationsStore((s) => s.locations.filter((l) => l.isActive))

  if (isDemoMode) {
    const usageItems = [
      { label: 'Profissionais', used: DEMO_SUBSCRIPTION.usage.professionals, limit: DEMO_SUBSCRIPTION.limits.professionals },
      { label: 'Locais',        used: DEMO_SUBSCRIPTION.usage.locations,     limit: DEMO_SUBSCRIPTION.limits.locations     },
      { label: 'Gestores',      used: DEMO_SUBSCRIPTION.usage.managers,      limit: DEMO_SUBSCRIPTION.limits.managers      },
    ]

    return (
      <>
        <Header title="Plano" subtitle="Capacidade contratada e limites operacionais" />
        <div className="space-y-6 p-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">{DEMO_SUBSCRIPTION.planName}</h2>
                <p className="text-sm text-muted-foreground">Renovação em {DEMO_SUBSCRIPTION.renewalDate}</p>
              </div>
              <Badge className="border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300">
                {DEMO_SUBSCRIPTION.status}
              </Badge>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {usageItems.map((item) => {
                const percentage = Math.round((item.used / item.limit) * 100)
                return (
                  <article key={item.label} className="rounded-xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">{item.used} / {item.limit}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{percentage}% da capacidade usada</p>
                  </article>
                )
              })}
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-lg font-bold text-foreground">Suporte e acompanhamento</h2>
            <p className="mt-2 text-sm text-muted-foreground">{DEMO_SUBSCRIPTION.support}</p>
          </section>
        </div>
      </>
    )
  }

  // Real user — derive from auth + stores
  const planKey = user?.organization?.subscription?.plan ?? 'BASIC'
  const planLabel = PLAN_LABELS[planKey] ?? planKey
  const limits = PLAN_LIMITS[planKey] ?? PLAN_LIMITS.BASIC
  const subStatus = user?.organization?.subscription?.status ?? 'TRIAL'
  const trialEndsAt = user?.organization?.subscription?.trialEndsAt

  const usageItems = [
    { label: 'Profissionais', used: professionals.length, limit: limits.professionals },
    { label: 'Locais',        used: locations.length,     limit: limits.locations     },
    { label: 'Gestores',      used: managers.length,      limit: limits.managers      },
  ]

  const statusBadgeClass =
    subStatus === 'ACTIVE'
      ? 'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300'
      : subStatus === 'TRIAL'
      ? 'border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300'
      : 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300'

  const statusLabel =
    subStatus === 'ACTIVE' ? 'Ativo'
    : subStatus === 'TRIAL' ? 'Trial'
    : subStatus === 'PAST_DUE' ? 'Pagamento pendente'
    : subStatus === 'CANCELLED' ? 'Cancelado'
    : subStatus

  return (
    <>
      <Header title="Plano" subtitle="Capacidade contratada e limites operacionais" />
      <div className="space-y-6 p-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Plano {planLabel}</h2>
              {trialEndsAt && subStatus === 'TRIAL' && (
                <p className="text-sm text-muted-foreground">Trial até {new Date(trialEndsAt).toLocaleDateString('pt-BR')}</p>
              )}
            </div>
            <Badge className={statusBadgeClass}>{statusLabel}</Badge>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {usageItems.map((item) => {
              const percentage = item.limit > 0 ? Math.round((item.used / item.limit) * 100) : 0
              return (
                <article key={item.label} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{item.used} / {item.limit}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(percentage, 100)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{percentage}% da capacidade usada</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Suporte e acompanhamento</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {planKey === 'ENTERPRISE'
              ? 'Suporte prioritário 24/7 + especialista dedicado'
              : planKey === 'PREMIUM'
              ? 'Suporte por e-mail em horário comercial + base de conhecimento'
              : 'Suporte por e-mail com resposta em até 48h'}
          </p>
        </section>
      </div>
    </>
  )
}
