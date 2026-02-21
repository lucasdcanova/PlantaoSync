'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { useSchedulesStore } from '@/store/schedules.store'
import { useLocationsStore } from '@/store/locations.store'
import { createShiftValueResolver } from '@/lib/shift-pricing'
import { formatCurrency, formatDate } from '@/lib/utils'

type HistoryFilter = 'TODOS' | 'CONCLUIDO' | 'CONFIRMADO' | 'TROCA_SOLICITADA'

const statusClassName: Record<string, string> = {
  CONCLUIDO:
    'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
  CONFIRMADO:
    'border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300',
  TROCA_SOLICITADA:
    'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  CANCELADO:
    'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300',
}

export default function DoctorHistoryPage() {
  const myShifts = useDoctorDemoStore((state) => state.myShifts)
  const schedules = useSchedulesStore((state) => state.schedules)
  const locations = useLocationsStore((state) => state.locations)
  const [filter, setFilter] = useState<HistoryFilter>('TODOS')

  const resolveShiftValue = useMemo(
    () => createShiftValueResolver(schedules, locations),
    [locations, schedules],
  )

  const shifts = useMemo(() => {
    return myShifts.filter((shift) => (filter === 'TODOS' ? true : shift.status === filter))
  }, [filter, myShifts])

  return (
    <div className="space-y-6">
      <section className="border-border bg-card shadow-card rounded-2xl border p-5">
        <h2 className="font-display text-foreground text-xl font-bold">Histórico do médico</h2>
        <p className="text-muted-foreground text-sm">
          Consulte plantões concluídos, confirmados e plantões em processo de troca.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(['TODOS', 'CONCLUIDO', 'CONFIRMADO', 'TROCA_SOLICITADA'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                filter === status
                  ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'border-border bg-background text-muted-foreground'
              }`}
            >
              {status === 'TODOS' ? 'Todos' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {shifts.map((shift) => (
          <article
            key={shift.id}
            className="border-border bg-card shadow-card rounded-2xl border p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-foreground text-lg font-semibold">
                  {shift.sectorName}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                </p>
              </div>
              <Badge className={statusClassName[shift.status]}>
                {shift.status.replace('_', ' ')}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Carga assistencial
                </p>
                <p className="text-foreground mt-1 text-sm">{shift.patientLoad}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Valor</p>
                <p className="text-foreground mt-1 text-sm">
                  {formatCurrency(
                    resolveShiftValue({
                      date: shift.date,
                      sectorName: shift.sectorName,
                      fallbackValue: shift.value,
                    }),
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">Observação</p>
                <p className="text-foreground mt-1 text-sm">{shift.notes ?? 'Sem observações.'}</p>
              </div>
            </div>
          </article>
        ))}

        {shifts.length === 0 && (
          <div className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
            Nenhum plantão encontrado para o filtro selecionado.
          </div>
        )}
      </section>
    </div>
  )
}
