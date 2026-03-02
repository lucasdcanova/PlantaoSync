'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar, Filter, MapPin, Plus, Search, ShieldAlert, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { PageTransition, StaggerItem, StaggerList } from '@/components/shared/page-transition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiClient } from '@/lib/api'
import { mapApiScheduleToManager } from '@/lib/backend-mappers'
import { isOpenEndedSchedule } from '@/lib/schedule-range'
import { SHIFT_STATUS_CONFIG, cn, formatCurrency, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useLocationsStore } from '@/store/locations.store'
import { useSchedulesStore } from '@/store/schedules.store'

export default function SchedulesPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const schedules = useSchedulesStore((state) => state.schedules)
  const setSchedules = useSchedulesStore((state) => state.setSchedules)
  const locations = useLocationsStore((state) => state.locations)

  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    const loadSchedules = async () => {
      try {
        const api = getApiClient()
        const response = await api
          .get('schedules', { searchParams: { limit: 200 } })
          .json<{ data: unknown[] }>()

        if (cancelled) return

        const mapped = response.data.map((item) =>
          mapApiScheduleToManager(item as Parameters<typeof mapApiScheduleToManager>[0]),
        )
        setSchedules(mapped)
      } catch (error) {
        if (cancelled) return
        toast.error(
          error instanceof Error ? error.message : 'Falha ao carregar escalas da organização.',
        )
      }
    }

    void loadSchedules()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, setSchedules])

  const locationNameById = useMemo(
    () => new Map(locations.map((location) => [location.id, location.name])),
    [locations],
  )

  const filteredSchedules = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return schedules

    return schedules.filter((schedule) => {
      const locationName = locationNameById.get(schedule.locationId) ?? schedule.location?.name ?? ''
      return [schedule.title, schedule.description ?? '', locationName]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [locationNameById, schedules, search])

  return (
    <>
      <Header title="Escalas" subtitle="Planeje cobertura por unidade e turno" />

      <PageTransition>
        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar por mês, unidade ou setor..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>

            <Button variant="outline" size="icon" aria-label="Filtro indisponível nesta versão">
              <Filter className="h-4 w-4" />
            </Button>

            <Button asChild className="bg-brand-600 shadow-brand hover:bg-brand-700 gap-2 text-white">
              <Link href="/schedules/new">
                <Plus className="h-4 w-4" />
                Nova Escala
              </Link>
            </Button>
          </div>

          {filteredSchedules.length === 0 ? (
            <section className="border-border bg-background text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-sm">
              Nenhuma escala encontrada. Crie uma nova escala para começar.
            </section>
          ) : (
            <StaggerList className="space-y-3">
              {filteredSchedules.map((schedule) => {
                const statusConfig = SHIFT_STATUS_CONFIG[schedule.status]
                const locationLabel =
                  locationNameById.get(schedule.locationId) ?? schedule.location?.name ?? 'Não informado'

                return (
                  <StaggerItem key={schedule.id}>
                    <article className="border-border bg-card shadow-card rounded-xl border p-5">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-display text-foreground truncate font-semibold">
                            {schedule.title}
                          </h3>
                          {schedule.description ? (
                            <p className="text-muted-foreground mt-0.5 truncate text-sm">
                              {schedule.description}
                            </p>
                          ) : null}
                        </div>
                        <Badge className={cn('shrink-0 text-xs', statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="text-brand-400 h-3.5 w-3.5" />
                          {locationLabel}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="text-brand-400 h-3.5 w-3.5" />
                          {formatDate(schedule.startDate)} –{' '}
                          {isOpenEndedSchedule(schedule.endDate)
                            ? 'Sem data final'
                            : formatDate(schedule.endDate)}
                        </span>
                        <Badge className="border-brand-200 bg-brand-50 text-brand-700 text-[10px]">
                          Valor/plantão {formatCurrency(schedule.shiftValue)}
                        </Badge>
                        <span className="text-[11px]">
                          Cobertura: {schedule.coverageMode === 'FULL_DAY' ? '24h' : 'Período específico'}
                        </span>
                        <span className="text-[11px]">
                          Plantão: {schedule.shiftDurationHours}h · {schedule.professionalsPerShift}{' '}
                          médico(s)
                        </span>
                        <span className="flex items-center gap-1.5">
                          {schedule.requireSwapApproval ? (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                              Troca com aprovação
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                              Troca sem aprovação
                            </>
                          )}
                        </span>
                      </div>

                      <div className="mt-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/schedules/${schedule.id}`}>Abrir escala</Link>
                        </Button>
                      </div>
                    </article>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          )}
        </div>
      </PageTransition>
    </>
  )
}
