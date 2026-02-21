'use client'

import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { DEMO_FINANCIAL_MONTHS } from '@/lib/demo-data'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency } from '@/lib/utils'
import { DollarSign } from 'lucide-react'

const statusClassName: Record<string, string> = {
  'Em fechamento':
    'border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300',
  Fechado:
    'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
  'Em análise':
    'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
}

export default function FinancesPage() {
  const isDemoMode = useAuthStore((s) => s.isDemoMode)

  const months = isDemoMode ? DEMO_FINANCIAL_MONTHS : []
  const projected = months.reduce((sum, m) => sum + m.projectedCost, 0)
  const confirmed = months.reduce((sum, m) => sum + m.confirmedCost, 0)
  const paid = months.reduce((sum, m) => sum + m.paidCost, 0)
  const variance = months.reduce((sum, m) => sum + m.variance, 0)

  return (
    <>
      <Header title="Financeiro" subtitle="Custos de cobertura com contexto assistencial" />

      <div className="space-y-6 p-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Projetado', value: projected },
            { label: 'Confirmado', value: confirmed },
            { label: 'Pago', value: paid },
            { label: 'Variação total', value: variance, colored: true },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p
                className={`mt-2 font-display text-2xl font-bold ${
                  stat.colored
                    ? stat.value <= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400'
                    : 'text-foreground'
                }`}
              >
                {formatCurrency(stat.value)}
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Meses financeiros</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparativo de previsão, confirmado, pago e desvio por mês de cobertura.
          </p>

          {months.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Nenhum registro financeiro ainda</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Os dados financeiros aparecem aqui conforme as escalas são publicadas e os plantões confirmados.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {months.map((month) => (
                <article key={month.id} className="rounded-xl border border-border bg-background p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-foreground">{month.month}</h3>
                      <p className="text-xs text-muted-foreground">Controle de fechamento assistencial e contábil</p>
                    </div>
                    <Badge className={statusClassName[month.status] ?? ''}>{month.status}</Badge>
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
                      <p className={`mt-1 ${month.variance <= 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {formatCurrency(month.variance)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
