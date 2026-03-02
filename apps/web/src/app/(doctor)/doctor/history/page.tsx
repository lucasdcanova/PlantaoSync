'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { getApiClient } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

type HistoryFilter = 'TODOS' | 'CONCLUIDO' | 'CONFIRMADO' | 'CANCELADO'

type ConfirmationRow = {
  id: string
  status: 'ACCEPTED' | 'CANCELLED' | string
  shift: {
    id: string
    date: string
    startTime: string
    endTime: string
    specialty?: string | null
    valuePerShift: string | number
    location?: {
      name: string
    } | null
  }
}

const statusClassName: Record<string, string> = {
  CONCLUIDO:
    'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
  CONFIRMADO:
    'border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300',
  CANCELADO:
    'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300',
}

function toNumber(value: number | string) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeStatus(row: ConfirmationRow): 'CONCLUIDO' | 'CONFIRMADO' | 'CANCELADO' {
  if (row.status === 'CANCELLED') return 'CANCELADO'

  const endDate = new Date(`${row.shift.date.slice(0, 10)}T${row.shift.endTime}:00`)
  const startDate = new Date(`${row.shift.date.slice(0, 10)}T${row.shift.startTime}:00`)
  if (endDate <= startDate) endDate.setDate(endDate.getDate() + 1)

  return endDate < new Date() ? 'CONCLUIDO' : 'CONFIRMADO'
}

export default function DoctorHistoryPage() {
  const [filter, setFilter] = useState<HistoryFilter>('TODOS')

  const { data: confirmations = [], isLoading } = useQuery({
    queryKey: ['doctor-my-confirmations'],
    queryFn: async () => {
      const api = getApiClient()
      const response = await api.get('confirmations/mine', { searchParams: { limit: 200 } }).json<{ data: ConfirmationRow[] }>()
      return response.data
    },
  })

  const shifts = useMemo(() => {
    const rows = confirmations.map((confirmation) => ({
      id: confirmation.id,
      status: normalizeStatus(confirmation),
      sectorName: confirmation.shift.location?.name ?? 'Setor não informado',
      specialty: confirmation.shift.specialty ?? 'Especialidade não informada',
      date: confirmation.shift.date,
      startTime: confirmation.shift.startTime,
      endTime: confirmation.shift.endTime,
      value: toNumber(confirmation.shift.valuePerShift),
      notes: '',
    }))

    if (filter === 'TODOS') return rows
    return rows.filter((row) => row.status === filter)
  }, [confirmations, filter])

  return (
    <div className="space-y-6">
      <section className="border-border bg-card shadow-card rounded-2xl border p-5">
        <h2 className="font-display text-foreground text-xl font-bold">Histórico do médico</h2>
        <p className="text-muted-foreground text-sm">
          Consulte plantões concluídos, confirmados e cancelados.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(['TODOS', 'CONCLUIDO', 'CONFIRMADO', 'CANCELADO'] as const).map((status) => (
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
        {isLoading ? (
          <div className="border-border bg-card text-muted-foreground rounded-2xl border p-10 text-center text-sm">
            Carregando histórico...
          </div>
        ) : shifts.length > 0 ? (
          shifts.map((shift) => (
            <article key={shift.id} className="border-border bg-card shadow-card rounded-2xl border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-foreground text-lg font-semibold">{shift.sectorName}</h3>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                  </p>
                </div>
                <Badge className={statusClassName[shift.status]}>{shift.status.replace('_', ' ')}</Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Especialidade</p>
                  <p className="text-foreground mt-1 text-sm">{shift.specialty}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Valor</p>
                  <p className="text-foreground mt-1 text-sm">{formatCurrency(shift.value)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Observação</p>
                  <p className="text-foreground mt-1 text-sm">{shift.notes || 'Sem observações.'}</p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
            Nenhum plantão encontrado para o filtro selecionado.
          </div>
        )}
      </section>
    </div>
  )
}
