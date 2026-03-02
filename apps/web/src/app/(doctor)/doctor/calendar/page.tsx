'use client'

import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getApiClient } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

type AvailableShift = {
  id: string
  date: string
  startTime: string
  endTime: string
  specialty?: string | null
  valuePerShift: string | number
  location: { id: string; name: string }
  schedule: { title: string }
  requiredCount: number
  _count: { confirmations: number }
}

type Confirmation = {
  id: string
  status: 'ACCEPTED' | 'CANCELLED' | string
  shift: {
    date: string
    startTime: string
    endTime: string
    specialty?: string | null
    valuePerShift: string | number
    location?: { name: string } | null
    schedule?: { title: string } | null
  }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function toISODate(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function toNumber(value: number | string) {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function DoctorCalendarPage() {
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const { data: availableShifts = [] } = useQuery({
    queryKey: ['doctor-available-shifts'],
    queryFn: async () => {
      const api = getApiClient()
      return api.get('confirmations/available').json<AvailableShift[]>()
    },
  })

  const { data: myConfirmations = [] } = useQuery({
    queryKey: ['doctor-calendar-confirmations'],
    queryFn: async () => {
      const api = getApiClient()
      const response = await api.get('confirmations/mine', { searchParams: { limit: 250 } }).json<{ data: Confirmation[] }>()
      return response.data
    },
  })

  const myShifts = useMemo(
    () => myConfirmations.filter((confirmation) => confirmation.status === 'ACCEPTED'),
    [myConfirmations],
  )

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const calendarDays: Array<number | null> = []
  for (let index = 0; index < firstDay; index += 1) calendarDays.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) calendarDays.push(day)

  const myShiftMap = useMemo(() => {
    const map = new Map<string, Confirmation[]>()
    myShifts.forEach((confirmation) => {
      const key = confirmation.shift.date.slice(0, 10)
      const list = map.get(key) ?? []
      list.push(confirmation)
      map.set(key, list)
    })
    return map
  }, [myShifts])

  const availableMap = useMemo(() => {
    const map = new Map<string, AvailableShift[]>()
    availableShifts.forEach((shift) => {
      const key = shift.date.slice(0, 10)
      const list = map.get(key) ?? []
      list.push(shift)
      map.set(key, list)
    })
    return map
  }, [availableShifts])

  const selectedDateIso = selectedDay ? toISODate(year, month, selectedDay) : null
  const selectedMyShifts = selectedDateIso ? myShiftMap.get(selectedDateIso) ?? [] : []
  const selectedAvailableShifts = selectedDateIso ? availableMap.get(selectedDateIso) ?? [] : []

  const handleConfirmShift = async (shiftId: string) => {
    try {
      const api = getApiClient()
      await api.post(`confirmations/confirm/${shiftId}`)
      toast.success('Plantão confirmado com sucesso.')
      await queryClient.invalidateQueries({ queryKey: ['doctor-available-shifts'] })
      await queryClient.invalidateQueries({ queryKey: ['doctor-calendar-confirmations'] })
      await queryClient.invalidateQueries({ queryKey: ['doctor-my-confirmations'] })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao confirmar plantão.')
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">Calendário de plantões</h2>
            <p className="text-sm text-muted-foreground">Acompanhe seus plantões confirmados e as vagas disponíveis.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="px-3 py-1">
              {MONTHS[month]} de {year}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 border border-border/60">
          <div className="grid grid-cols-7">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="border-b border-r border-border/60 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                {weekday}
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square border-b border-r border-border/40 bg-muted/20" />
              }

              const dateIso = toISODate(year, month, day)
              const myCount = myShiftMap.get(dateIso)?.length ?? 0
              const availableCount = availableMap.get(dateIso)?.length ?? 0
              const isSelected = selectedDay === day

              return (
                <button
                  key={dateIso}
                  type="button"
                  onClick={() => setSelectedDay((current) => (current === day ? null : day))}
                  className={`relative aspect-square border-b border-r border-border/40 px-1 py-0.5 text-left transition-colors ${
                    isSelected ? 'bg-brand-50' : 'hover:bg-accent/40'
                  }`}
                >
                  <span className="text-[11px] font-medium text-foreground">{day}</span>
                  {myCount > 0 ? (
                    <span className="absolute top-1 right-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-semibold text-green-700">
                      {myCount}
                    </span>
                  ) : null}
                  {availableCount > 0 ? (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {availableCount}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">Meus plantões do dia</h3>
            <Badge variant="outline">{selectedMyShifts.length}</Badge>
          </div>

          {selectedDay ? (
            selectedMyShifts.length > 0 ? (
              <div className="space-y-2">
                {selectedMyShifts.map((item) => (
                  <article key={item.id} className="rounded-xl border border-border bg-background p-3">
                    <p className="text-sm font-medium text-foreground">{item.shift.location?.name ?? 'Setor não informado'}</p>
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
              <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                Nenhum plantão confirmado para este dia.
              </div>
            )
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
              Selecione um dia no calendário.
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">Disponíveis no dia</h3>
            <Badge className="border-brand-200 bg-brand-50 text-brand-700">{selectedAvailableShifts.length}</Badge>
          </div>

          {selectedDay ? (
            selectedAvailableShifts.length > 0 ? (
              <div className="space-y-2">
                {selectedAvailableShifts.map((shift) => {
                  const slotsLeft = Math.max(0, shift.requiredCount - (shift._count?.confirmations ?? 0))
                  return (
                    <article key={shift.id} className="rounded-xl border border-border bg-background p-3">
                      <p className="text-sm font-medium text-foreground">{shift.location.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {shift.specialty ?? 'Especialidade não informada'} · {formatCurrency(toNumber(shift.valuePerShift))}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{slotsLeft} vaga(s) restantes</p>
                      <Button
                        size="sm"
                        className="mt-2 bg-brand-600 text-white hover:bg-brand-700"
                        onClick={() => void handleConfirmShift(shift.id)}
                        disabled={slotsLeft <= 0}
                      >
                        Confirmar plantão
                      </Button>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                Sem vagas disponíveis neste dia.
              </div>
            )
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
              Selecione um dia no calendário.
            </div>
          )}
        </article>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          O calendário mostra dados reais de confirmações e vagas disponíveis da sua organização.
        </p>
      </section>
    </div>
  )
}
