'use client'

import Link from 'next/link'
import { CalendarDays, Clock3, Repeat2, ArrowRight } from 'lucide-react'
import { parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DoctorOverviewPage() {
  const availableShifts = useDoctorDemoStore((state) => state.availableShifts)
  const myShifts = useDoctorDemoStore((state) => state.myShifts)
  const swapRequests = useDoctorDemoStore((state) => state.swapRequests)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const parseShiftDateTime = (date: string, time: string) => new Date(`${date}T${time}:00`)

  const monthShifts = myShifts.filter((shift) => {
    const shiftDate = parseISO(shift.date)
    return shiftDate >= monthStart && shiftDate < monthEnd
  })

  const upcoming = monthShifts
    .filter((shift) => parseShiftDateTime(shift.date, shift.startTime) >= now)
    .sort(
      (a, b) =>
        parseShiftDateTime(a.date, a.startTime).getTime() -
        parseShiftDateTime(b.date, b.startTime).getTime(),
    )
    .slice(0, 3)

  const confirmedInMonth = monthShifts.filter((shift) => shift.status !== 'CANCELADO').length
  const pendingSwaps = swapRequests.filter((swap) => swap.status === 'PENDENTE').length
  const monthProjection = monthShifts.reduce((sum, shift) => sum + shift.value, 0)
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Plantões disponíveis</p>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{availableShifts.length}</p>
          <p className="text-xs text-muted-foreground">abertos para confirmação</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Confirmados no mês</p>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{confirmedInMonth}</p>
          <p className="text-xs text-muted-foreground">{monthLabel}</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Trocas pendentes</p>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{pendingSwaps}</p>
          <p className="text-xs text-muted-foreground">aguardando decisão</p>
        </article>
        <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Projeção do mês</p>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{formatCurrency(monthProjection)}</p>
          <p className="text-xs text-muted-foreground">com base nos plantões de {monthLabel}</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-foreground">Próximas oportunidades</h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/doctor/available" className="gap-1.5">
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {availableShifts.slice(0, 3).map((shift) => (
              <div key={shift.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{shift.sectorName}</p>
                    <p className="text-xs text-muted-foreground">{shift.specialty}</p>
                  </div>
                  <Badge className="border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300">
                    {shift.slotsLeft} vaga{shift.slotsLeft > 1 ? 's' : ''}
                  </Badge>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-brand-500" />
                  {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-foreground">Meus plantões</h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/doctor/history" className="gap-1.5">
                Histórico
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {upcoming.map((shift) => (
              <div key={shift.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{shift.sectorName}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(shift.value)}</p>
                  </div>
                  <Badge className="border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300">
                    {shift.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4 text-brand-500" />
                  {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                </p>
              </div>
            ))}

            {upcoming.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                Nenhum plantão confirmado para o restante deste mês.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-foreground">Solicitações de troca</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/doctor/swaps" className="gap-1.5">
              Gerenciar trocas
              <Repeat2 className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Você tem {pendingSwaps} solicitação(ões) pendente(s) para revisar.
        </p>
      </section>
    </div>
  )
}
