import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { DEMO_FINANCIAL_MONTHS } from '@/lib/demo-data'
import { formatCurrency } from '@/lib/utils'

export default function FinancesPage() {
  const projected = DEMO_FINANCIAL_MONTHS.reduce((sum, month) => sum + month.projectedCost, 0)
  const confirmed = DEMO_FINANCIAL_MONTHS.reduce((sum, month) => sum + month.confirmedCost, 0)
  const paid = DEMO_FINANCIAL_MONTHS.reduce((sum, month) => sum + month.paidCost, 0)
  const variance = DEMO_FINANCIAL_MONTHS.reduce((sum, month) => sum + month.variance, 0)

  const statusClassName: Record<(typeof DEMO_FINANCIAL_MONTHS)[number]['status'], string> = {
    'Em fechamento':
      'border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300',
    Fechado:
      'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
    'Em análise':
      'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  }

  return (
    <>
      <Header
        title="Financeiro"
        subtitle="Custos de cobertura com contexto assistencial"
      />

      <div className="space-y-6 p-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Projetado</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{formatCurrency(projected)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Confirmado</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{formatCurrency(confirmed)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pago</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{formatCurrency(paid)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Variação total</p>
            <p
              className={`mt-2 font-display text-2xl font-bold ${
                variance <= 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {formatCurrency(variance)}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Meses financeiros</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparativo de previsão, confirmado, pago e desvio por mês de cobertura.
          </p>

          <div className="mt-5 space-y-3">
            {DEMO_FINANCIAL_MONTHS.map((month) => (
              <article key={month.id} className="rounded-xl border border-border bg-background p-4 md:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-foreground">{month.month}</h3>
                    <p className="text-xs text-muted-foreground">Controle de fechamento assistencial e contábil</p>
                  </div>
                  <Badge className={statusClassName[month.status]}>{month.status}</Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Projetado</p>
                    <p className="mt-1 text-foreground">{formatCurrency(month.projectedCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Confirmado</p>
                    <p className="mt-1 text-foreground">{formatCurrency(month.confirmedCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Pago</p>
                    <p className="mt-1 text-foreground">{formatCurrency(month.paidCost)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Variação</p>
                    <p
                      className={`mt-1 ${
                        month.variance <= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {formatCurrency(month.variance)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
