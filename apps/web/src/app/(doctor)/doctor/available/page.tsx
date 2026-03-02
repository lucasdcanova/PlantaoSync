'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Filter, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiClient } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

type AvailableShift = {
  id: string
  date: string
  startTime: string
  endTime: string
  specialty?: string | null
  valuePerShift: string | number
  requiredCount: number
  location: {
    id: string
    name: string
  }
  schedule: {
    id: string
    title: string
  }
  _count: {
    confirmations: number
  }
}

function toNumber(value: number | string) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function DoctorAvailableShiftsPage() {
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState<string>(searchParams.get('sector') ?? 'all')

  const { data: availableShifts = [], isLoading } = useQuery({
    queryKey: ['doctor-available-shifts'],
    queryFn: async () => {
      const api = getApiClient()
      return api.get('confirmations/available').json<AvailableShift[]>()
    },
  })

  const sectors = useMemo(() => {
    const byId = new Map<string, string>()
    availableShifts.forEach((shift) => {
      byId.set(shift.location.id, shift.location.name)
    })

    return Array.from(byId.entries()).map(([id, name]) => ({ id, name }))
  }, [availableShifts])

  const filteredShifts = useMemo(() => {
    return availableShifts.filter((shift) => {
      const bySector = sectorFilter === 'all' || shift.location.id === sectorFilter
      const bySearch =
        search.trim() === '' ||
        shift.location.name.toLowerCase().includes(search.toLowerCase()) ||
        (shift.specialty ?? '').toLowerCase().includes(search.toLowerCase()) ||
        shift.schedule.title.toLowerCase().includes(search.toLowerCase())
      return bySector && bySearch
    })
  }, [availableShifts, search, sectorFilter])

  const handleClaimShift = async (shiftId: string) => {
    try {
      const api = getApiClient()
      await api.post(`confirmations/confirm/${shiftId}`)
      toast.success('Plantão confirmado com sucesso.')
      await queryClient.invalidateQueries({ queryKey: ['doctor-available-shifts'] })
      await queryClient.invalidateQueries({ queryKey: ['doctor-my-confirmations'] })
      await queryClient.invalidateQueries({ queryKey: ['doctor-calendar-confirmations'] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao confirmar plantão.')
    }
  }

  return (
    <div className="space-y-6">
      <section className="border-border bg-card shadow-card rounded-2xl border p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-foreground text-xl font-bold">Plantões disponíveis</h2>
            <p className="text-muted-foreground text-sm">
              Veja os plantões abertos e confirme cobertura com um clique.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="relative">
              <Filter className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar setor, escala ou especialidade"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9 sm:w-80"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSectorFilter('all')}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              sectorFilter === 'all'
                ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300'
                : 'border-border bg-background text-muted-foreground'
            }`}
          >
            Todos os setores
          </button>
          {sectors.map((sector) => (
            <button
              type="button"
              key={sector.id}
              onClick={() => setSectorFilter(sector.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                sectorFilter === sector.id
                  ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300'
                  : 'border-border bg-background text-muted-foreground'
              }`}
            >
              {sector.name}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {isLoading ? (
          <div className="border-border bg-card text-muted-foreground rounded-2xl border p-10 text-center text-sm">
            Carregando plantões disponíveis...
          </div>
        ) : filteredShifts.length > 0 ? (
          filteredShifts.map((shift) => {
            const confirmedCount = shift._count?.confirmations ?? 0
            const slotsLeft = Math.max(0, (shift.requiredCount ?? 0) - confirmedCount)
            const value = toNumber(shift.valuePerShift)

            return (
              <article key={shift.id} className="border-border bg-card shadow-card rounded-2xl border p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-foreground text-lg font-semibold">{shift.location.name}</h3>
                    <p className="text-muted-foreground text-sm">{shift.specialty ?? 'Especialidade não informada'}</p>
                    <p className="text-muted-foreground mt-1 text-xs">Escala: {shift.schedule.title}</p>
                  </div>
                  <Badge className="border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300 border">
                    {slotsLeft} vaga{slotsLeft !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="text-brand-500 h-4 w-4" />
                    {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <MapPin className="text-brand-500 h-4 w-4" />
                    {shift.location.name}
                  </p>
                  <p className="text-foreground">{formatCurrency(value)}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    className="bg-brand-600 shadow-brand hover:bg-brand-700 text-white"
                    onClick={() => void handleClaimShift(shift.id)}
                    disabled={slotsLeft <= 0}
                  >
                    Confirmar plantão
                  </Button>
                </div>
              </article>
            )
          })
        ) : (
          <div className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
            Nenhum plantão disponível para os filtros aplicados.
          </div>
        )}
      </section>
    </div>
  )
}
