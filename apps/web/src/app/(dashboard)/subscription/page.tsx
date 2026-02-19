import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { DEMO_SUBSCRIPTION } from '@/lib/demo-data'

export default function SubscriptionPage() {
  const usageItems = [
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

  return (
    <>
      <Header
        title="Plano"
        subtitle="Capacidade contratada e limites operacionais"
      />

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
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {item.used} / {item.limit}
                  </p>
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
