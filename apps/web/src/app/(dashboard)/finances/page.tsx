'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DollarSign } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

type FinanceRecord = {
  id: string
  amount: number | string
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  createdAt: string
}

type MonthSummary = {
  id: string
  month: string
  projectedCost: number
  confirmedCost: number
  paidCost: number
  variance: number
  status: 'Em fechamento' | 'Fechado' | 'Em análise'
}

const statusClassName: Record<MonthSummary['status'], string> = {
  'Em fechamento':
    'border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300',
  Fechado:
    'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
  'Em análise':
    'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
}

function toNumber(value: number | string) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function monthKeyLabel(dateString: string) {
  const date = new Date(dateString)
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const month = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return { key, month }
}

function computeMonthSummaries(records: FinanceRecord[]): MonthSummary[] {
  const byMonth = new Map<string, MonthSummary>()

  records.forEach((record) => {
    const { key, month } = monthKeyLabel(record.createdAt)
    const current =
      byMonth.get(key) ??
      {
        id: key,
        month,
        projectedCost: 0,
        confirmedCost: 0,
        paidCost: 0,
        variance: 0,
        status: 'Em análise' as const,
      }

    const amount = toNumber(record.amount)
    if (record.status !== 'CANCELLED') {
      current.projectedCost += amount
      current.confirmedCost += amount
    }

    if (record.status === 'PAID') {
      current.paidCost += amount
    }

    byMonth.set(key, current)
  })

  const result = Array.from(byMonth.values())
    .map((month) => {
      const pending = Math.max(0, month.confirmedCost - month.paidCost)
      const variance = month.projectedCost - month.paidCost
      const status: MonthSummary['status'] =
        pending <= 0 ? 'Fechado' : pending < month.confirmedCost ? 'Em fechamento' : 'Em análise'

      return {
        ...month,
        variance,
        status,
      }
    })
    .sort((a, b) => b.id.localeCompare(a.id))

  return result
}

export default function FinancesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['finances-records'],
    queryFn: async () => {
      const api = getApiClient()
      return api.get('finances').json<FinanceRecord[]>()
    },
  })

  const months = useMemo(() => computeMonthSummaries(data ?? []), [data])
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
              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-24" />
              ) : (
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
              )}
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Meses financeiros</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparativo de previsão, confirmado, pago e desvio por mês de cobertura.
          </p>

          {isLoading ? (
            <div className="mt-5 space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : months.length === 0 ? (
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
