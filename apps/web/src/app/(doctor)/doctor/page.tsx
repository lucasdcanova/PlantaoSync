'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock3, Repeat2, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getApiClient } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

type AvailableShift = {
  id: string
  date: string
  startTime: string
  endTime: string
  location: { name: string }
  specialty?: string | null
  valuePerShift: string | number
}

type Confirmation = {
  id: string
  status: 'ACCEPTED' | 'CANCELLED' | string
  shift: {
    id: string
    date: string
    startTime: string
    endTime: string
    location?: { name: string } | null
    valuePerShift: string | number
  }
}

type FinanceSummary = {
  total: number
  monthly: number
  pending: number
  paid: number
}

function toNumber(value: number | string) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function DoctorOverviewPage() {
  const { data: availableShifts = [], isLoading: loadingAvailable } = useQuery({
    queryKey: ['doctor-available-shifts'],
    queryFn: async () => {
      const api = getApiClient()
      return api.get('confirmations/available').json<AvailableShift[]>()
    },
  })

  const { data: myConfirmations = [], isLoading: loadingMine } = useQuery({
    queryKey: ['doctor-my-confirmations'],
    queryFn: async () => {
      const api = getApiClient()
      const response = await api.get('confirmations/mine', { searchParams: { limit: 200 } }).json<{ data: Confirmation[] }>()
      return response.data
    },
  })

  const { data: financeSummary } = useQuery({
    queryKey: ['doctor-finance-summary'],
    queryFn: async () => {
      const api = getApiClient()
      return api.get('finances/my-summary').json<FinanceSummary>()
    },
  })

  const acceptedConfirmations = useMemo(
    () => myConfirmations.filter((item) => item.status === 'ACCEPTED'),
    [myConfirmations],
  )

  const upcomingShifts = useMemo(() => {
    const now = new Date()
    return acceptedConfirmations
      .filter((item) => {
        const start = new Date(`${item.shift.date.slice(0, 10)}T${item.shift.startTime}:00`)
        return start >= now
      })
      .sort(
        (a, b) =>
          new Date(`${a.shift.date.slice(0, 10)}T${a.shift.startTime}:00`).getTime() -
          new Date(`${b.shift.date.slice(0, 10)}T${b.shift.startTime}:00`).getTime(),
      )
      .slice(0, 3)
  }, [acceptedConfirmations])

  const monthProjection = useMemo(() => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    return acceptedConfirmations.reduce((sum, item) => {
      const shiftDate = new Date(item.shift.date)
      if (shiftDate < start || shiftDate >= end) return sum
      return sum + toNumber(item.shift.valuePerShift)
    }, 0)
  }, [acceptedConfirmations])

  return (
    <div className="space-y-6">
      <section className="border-brand-200/50 from-brand-50/95 via-card to-brand-100/45 shadow-brand rounded-2xl border bg-gradient-to-br p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Confirmações ativas</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{loadingMine ? '—' : acceptedConfirmations.length}</p>
          </article>
          <article className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Plantões disponíveis</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{loadingAvailable ? '—' : availableShifts.length}</p>
          </article>
          <article className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Projeção do mês</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(monthProjection)}</p>
          </article>
          <article className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">A receber</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {financeSummary ? formatCurrency(financeSummary.pending) : '—'}
            </p>
          </article>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">Próximos plantões</h2>
            <Badge variant="outline" className="text-[11px]">Agenda</Badge>
          </div>

          {upcomingShifts.length > 0 ? (
            <div className="space-y-2">
              {upcomingShifts.map((item) => (
                <article key={item.id} className="rounded-xl border border-border bg-background p-3">
                  <p className="text-sm font-medium text-foreground">
                    {item.shift.location?.name ?? 'Setor não informado'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(item.shift.date)} · {item.shift.startTime} - {item.shift.endTime}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Valor {formatCurrency(toNumber(item.shift.valuePerShift))}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background px-3 py-5 text-sm text-muted-foreground">
              Sem próximos plantões confirmados.
            </div>
          )}

          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/doctor/calendar">Ver calendário completo</Link>
            </Button>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Atalhos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Acesse rapidamente os fluxos principais.</p>

          <div className="mt-4 space-y-2">
            <Button asChild className="w-full justify-start gap-2 bg-brand-600 text-white hover:bg-brand-700">
              <Link href="/doctor/available">
                <TrendingUp className="h-4 w-4" />
                Confirmar plantões disponíveis
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/doctor/history">
                <Clock3 className="h-4 w-4" />
                Ver histórico de plantões
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/doctor/sectors">
                <CalendarDays className="h-4 w-4" />
                Explorar setores
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/doctor/swaps">
                <Repeat2 className="h-4 w-4" />
                Trocas (em implantação)
              </Link>
            </Button>
          </div>
        </article>
      </section>
    </div>
  )
}
