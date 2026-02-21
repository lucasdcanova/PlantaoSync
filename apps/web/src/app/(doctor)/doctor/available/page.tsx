'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarDays, Filter, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { useSchedulesStore } from '@/store/schedules.store'
import { useLocationsStore } from '@/store/locations.store'
import { createShiftValueResolver } from '@/lib/shift-pricing'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function DoctorAvailableShiftsPage() {
  const searchParams = useSearchParams()
  const sectors = useDoctorDemoStore((state) => state.sectors)
  const availableShifts = useDoctorDemoStore((state) => state.availableShifts)
  const claimShift = useDoctorDemoStore((state) => state.claimShift)
  const schedules = useSchedulesStore((state) => state.schedules)
  const locations = useLocationsStore((state) => state.locations)
  const [search, setSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState<string>(searchParams.get('sector') ?? 'all')

  const resolveShiftValue = useMemo(
    () => createShiftValueResolver(schedules, locations),
    [locations, schedules],
  )

  const filteredShifts = useMemo(() => {
    return availableShifts.filter((shift) => {
      const bySector = sectorFilter === 'all' || shift.sectorId === sectorFilter
      const bySearch =
        search.trim() === '' ||
        shift.sectorName.toLowerCase().includes(search.toLowerCase()) ||
        shift.specialty.toLowerCase().includes(search.toLowerCase())
      return bySector && bySearch
    })
  }, [availableShifts, search, sectorFilter])

  return (
    <div className="space-y-6">
      <section className="border-border bg-card shadow-card rounded-2xl border p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-foreground text-xl font-bold">Plantões disponíveis</h2>
            <p className="text-muted-foreground text-sm">
              Veja todos os plantões abertos pelo gestor e assuma cobertura em poucos cliques.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="relative">
              <Filter className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar setor ou especialidade"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9 sm:w-72"
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
        {filteredShifts.map((shift) => {
          const resolvedValue = resolveShiftValue({
            date: shift.date,
            sectorName: shift.sectorName,
            fallbackValue: shift.value,
          })

          return (
            <article
              key={shift.id}
              className="border-border bg-card shadow-card rounded-2xl border p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-foreground text-lg font-semibold">
                    {shift.sectorName}
                  </h3>
                  <p className="text-muted-foreground text-sm">{shift.specialty}</p>
                </div>
                <Badge className="border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300 border">
                  {shift.slotsLeft} vaga{shift.slotsLeft > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <p className="text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="text-brand-500 h-4 w-4" />
                  {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                </p>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="text-brand-500 h-4 w-4" />
                  {shift.issuedBy}
                </p>
                <p className="text-foreground">{formatCurrency(resolvedValue)}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="bg-brand-600 shadow-brand hover:bg-brand-700 text-white"
                  onClick={() => {
                    claimShift(shift.id, resolvedValue)
                    toast.success('Plantão assumido com sucesso.')
                  }}
                >
                  Assumir plantão
                </Button>
              </div>
            </article>
          )
        })}

        {filteredShifts.length === 0 && (
          <div className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed p-10 text-center text-sm">
            Nenhum plantão disponível para os filtros aplicados.
          </div>
        )}
      </section>
    </div>
  )
}
