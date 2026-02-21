'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarPlus2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Hospital,
  MapPin,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { useSchedulesStore } from '@/store/schedules.store'
import { useLocationsStore } from '@/store/locations.store'
import { useAuthStore } from '@/store/auth.store'
import { createShiftValueResolver } from '@/lib/shift-pricing'
import { cn, formatCurrency } from '@/lib/utils'

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

type PrivateShiftFormValues = {
  institutionName: string
  locationName: string
  specialty: string
  startTime: string
  endTime: string
  value: string
  notes: string
}

const DEFAULT_PRIVATE_SHIFT_FORM: PrivateShiftFormValues = {
  institutionName: '',
  locationName: '',
  specialty: '',
  startTime: '19:00',
  endTime: '07:00',
  value: '1500,00',
  notes: '',
}

const shiftStatusClassName: Record<string, string> = {
  CONCLUIDO:
    'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
  CONFIRMADO:
    'border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300',
  TROCA_SOLICITADA:
    'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  CANCELADO:
    'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300',
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

function parseCurrencyToCents(value: string) {
  const cleaned = value.replace(/[^\d,.-]/g, '').trim()
  if (!cleaned) return Number.NaN
  const normalized = Number(
    cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned,
  )
  if (!Number.isFinite(normalized) || normalized <= 0) return Number.NaN
  return Math.round(normalized * 100)
}

function sortByStartTime<T extends { startTime: string }>(items: T[]) {
  return [...items].sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export default function DoctorCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1))
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [privateShiftForm, setPrivateShiftForm] = useState<PrivateShiftFormValues>(
    DEFAULT_PRIVATE_SHIFT_FORM,
  )

  const myShifts = useDoctorDemoStore((state) => state.myShifts)
  const privateShifts = useDoctorDemoStore((state) => state.privateShifts)
  const availableShifts = useDoctorDemoStore((state) => state.availableShifts)
  const addPrivateShift = useDoctorDemoStore((state) => state.addPrivateShift)
  const claimShift = useDoctorDemoStore((state) => state.claimShift)
  const schedules = useSchedulesStore((state) => state.schedules)
  const locations = useLocationsStore((state) => state.locations)
  const hospitalName = useAuthStore((state) => state.user?.organization?.name ?? 'Hospital')
  const resolveShiftValue = useMemo(
    () => createShiftValueResolver(schedules, locations),
    [locations, schedules],
  )

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const hospitalShiftsByDay = useMemo(() => {
    const map = new Map<number, typeof myShifts>()
    myShifts.forEach((shift) => {
      const shiftDate = new Date(`${shift.date}T00:00:00`)
      if (shiftDate.getFullYear() !== year || shiftDate.getMonth() !== month) return
      const day = shiftDate.getDate()
      const current = map.get(day) ?? []
      map.set(day, [...current, shift])
    })
    return map
  }, [month, myShifts, year])

  const privateShiftsByDay = useMemo(() => {
    const map = new Map<number, typeof privateShifts>()
    privateShifts.forEach((shift) => {
      const shiftDate = new Date(`${shift.date}T00:00:00`)
      if (shiftDate.getFullYear() !== year || shiftDate.getMonth() !== month) return
      const day = shiftDate.getDate()
      const current = map.get(day) ?? []
      map.set(day, [...current, shift])
    })
    return map
  }, [month, privateShifts, year])

  const swapOptionsByDay = useMemo(() => {
    const map = new Map<number, typeof availableShifts>()
    availableShifts.forEach((shift) => {
      const shiftDate = new Date(`${shift.date}T00:00:00`)
      if (shiftDate.getFullYear() !== year || shiftDate.getMonth() !== month) return
      const day = shiftDate.getDate()
      const current = map.get(day) ?? []
      map.set(day, [...current, shift])
    })
    return map
  }, [availableShifts, month, year])

  const selectedDateKey = selectedDay ? toISODate(year, month, selectedDay) : null

  const selectedHospitalShifts = useMemo(
    () => (selectedDay ? sortByStartTime(hospitalShiftsByDay.get(selectedDay) ?? []) : []),
    [hospitalShiftsByDay, selectedDay],
  )
  const selectedPrivateShifts = useMemo(
    () => (selectedDay ? sortByStartTime(privateShiftsByDay.get(selectedDay) ?? []) : []),
    [privateShiftsByDay, selectedDay],
  )
  const selectedSwapOptions = useMemo(
    () => (selectedDay ? sortByStartTime(swapOptionsByDay.get(selectedDay) ?? []) : []),
    [selectedDay, swapOptionsByDay],
  )

  const prevMonth = () => setCurrentDate(new Date(year, month - 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1))

  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const monthlyHospitalShifts = useMemo(
    () => Array.from(hospitalShiftsByDay.values()).flat().length,
    [hospitalShiftsByDay],
  )
  const monthlyPrivateShifts = useMemo(
    () => Array.from(privateShiftsByDay.values()).flat().length,
    [privateShiftsByDay],
  )
  const monthlySwapOptions = useMemo(
    () => Array.from(swapOptionsByDay.values()).flat().length,
    [swapOptionsByDay],
  )
  const monthlyActiveDays = useMemo(() => {
    const set = new Set<number>()
    hospitalShiftsByDay.forEach((_, day) => set.add(day))
    privateShiftsByDay.forEach((_, day) => set.add(day))
    return set.size
  }, [hospitalShiftsByDay, privateShiftsByDay])

  const calendarDays: Array<number | null> = []
  for (let index = 0; index < firstDay; index += 1) calendarDays.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) calendarDays.push(day)

  const handleAddPrivateShift = () => {
    if (!selectedDateKey) {
      toast.error('Selecione um dia para registrar o plantão externo.')
      return
    }

    const parsedValue = parseCurrencyToCents(privateShiftForm.value)
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      toast.error('Informe um valor válido para o plantão externo.')
      return
    }

    try {
      addPrivateShift({
        date: selectedDateKey,
        startTime: privateShiftForm.startTime,
        endTime: privateShiftForm.endTime,
        institutionName: privateShiftForm.institutionName,
        locationName: privateShiftForm.locationName,
        specialty: privateShiftForm.specialty,
        value: parsedValue,
        notes: privateShiftForm.notes,
      })

      setPrivateShiftForm((current) => ({
        ...current,
        locationName: '',
        specialty: '',
        value: current.value,
        notes: '',
      }))
      toast.success('Plantão externo privado salvo. Somente você pode visualizar.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao salvar plantão externo.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-foreground text-xl font-bold tracking-tight sm:text-2xl">
          Meu Calendário
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Selecione um dia para ver seus plantões, oportunidades de troca e registrar plantões
          externos privados.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base overflow-hidden"
        >
          <div className="border-border flex items-center justify-between border-b px-5 py-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="font-display text-foreground text-base font-semibold">
              {MONTHS[month]} <span className="text-muted-foreground font-normal">{year}</span>
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="border-border/50 grid grid-cols-7 border-b">
            {WEEKDAYS.map((weekday) => (
              <div
                key={weekday}
                className="text-muted-foreground py-2.5 text-center text-[11px] font-medium uppercase tracking-wider"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="border-border/30 aspect-square border-b border-r"
                  />
                )
              }

              const hasHospital = hospitalShiftsByDay.has(day)
              const hasPrivate = privateShiftsByDay.has(day)
              const hasSwapOptions = swapOptionsByDay.has(day)
              const isSelected = selectedDay === day

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={cn(
                    'border-border/30 hover:bg-accent/50 relative aspect-square border-b border-r p-1 transition-colors',
                    isSelected && 'bg-brand-50 dark:bg-brand-900/20',
                    isToday(day) && !isSelected && 'bg-accent/30',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                      isToday(day) && 'bg-brand-700 font-semibold text-white',
                      isSelected &&
                        !isToday(day) &&
                        'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300 font-medium',
                      !isToday(day) && !isSelected && 'text-foreground',
                    )}
                  >
                    {day}
                  </span>

                  {(hasHospital || hasPrivate || hasSwapOptions) && (
                    <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                      {hasHospital && <span className="bg-brand-500 h-1.5 w-1.5 rounded-full" />}
                      {hasPrivate && <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />}
                      {hasSwapOptions && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="border-border flex flex-wrap items-center gap-4 border-t px-5 py-3">
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <span className="bg-brand-500 h-2 w-2 rounded-full" />
              Plantões no Hospital
            </span>
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              Plantões externos privados
            </span>
            <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Disponíveis para troca
            </span>
          </div>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedDay ? (
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
                className="space-y-4"
              >
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display text-foreground text-3xl font-bold">{selectedDay}</h3>
                  <p className="text-muted-foreground text-sm">
                    {MONTHS[month].slice(0, 3)} {year}
                  </p>
                </div>

                <section className="card-base p-4">
                  <h4 className="font-display text-foreground text-sm font-semibold">
                    Meus plantões no dia
                  </h4>
                  <div className="mt-3 space-y-2">
                    {selectedHospitalShifts.length > 0 ? (
                      selectedHospitalShifts.map((shift) => (
                        <article
                          key={shift.id}
                          className="border-border/70 bg-background rounded-xl border p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-foreground text-sm font-medium">
                                {shift.sectorName}
                              </p>
                              <p className="text-muted-foreground text-xs">{shift.specialty}</p>
                            </div>
                            <Badge
                              className={
                                shiftStatusClassName[shift.status] ??
                                shiftStatusClassName.CONFIRMADO
                              }
                            >
                              {shift.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-xs">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="text-brand-600 h-3.5 w-3.5" />
                              {shift.startTime} - {shift.endTime}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="text-brand-600 h-3.5 w-3.5" />
                              {shift.patientLoad}
                            </span>
                            <span className="text-foreground font-medium">
                              {formatCurrency(shift.value)}
                            </span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <p className="border-border text-muted-foreground rounded-xl border border-dashed px-3 py-4 text-sm">
                        Nenhum plantão seu no hospital neste dia.
                      </p>
                    )}
                  </div>
                </section>

                <section className="card-base p-4">
                  <h4 className="font-display text-foreground text-sm font-semibold">
                    Plantões disponíveis para troca
                  </h4>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Você pode assumir o plantão diretamente por aqui.
                  </p>
                  <div className="mt-3 space-y-2">
                    {selectedSwapOptions.length > 0 ? (
                      selectedSwapOptions.map((shift) => {
                        const resolvedValue = resolveShiftValue({
                          date: shift.date,
                          sectorName: shift.sectorName,
                          fallbackValue: shift.value,
                        })

                        return (
                          <article
                            key={shift.id}
                            className="rounded-xl border border-amber-200 bg-amber-50/50 p-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-foreground text-sm font-medium">
                                  {shift.sectorName}
                                </p>
                                <p className="text-muted-foreground text-xs">{shift.specialty}</p>
                              </div>
                              <Badge className="border-amber-300 bg-amber-100 text-amber-700">
                                {shift.slotsLeft} vaga{shift.slotsLeft > 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-xs">
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5 text-amber-700" />
                                {shift.startTime} - {shift.endTime}
                              </span>
                              <span className="text-foreground font-medium">
                                {formatCurrency(resolvedValue)}
                              </span>
                            </div>
                            <div className="mt-3">
                              <Button
                                type="button"
                                size="sm"
                                className="bg-brand-700 hover:bg-brand-800 h-8 w-full text-white"
                                onClick={() => {
                                  claimShift(shift.id, resolvedValue)
                                  toast.success('Plantão assumido e adicionado aos seus plantões.')
                                }}
                              >
                                Assumir plantão
                              </Button>
                            </div>
                          </article>
                        )
                      })
                    ) : (
                      <p className="border-border text-muted-foreground rounded-xl border border-dashed px-3 py-4 text-sm">
                        Não há plantões disponíveis para troca neste dia.
                      </p>
                    )}
                  </div>
                </section>

                <section className="card-base p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-display text-foreground text-sm font-semibold">
                      Plantões externos privados
                    </h4>
                    <Badge className="border-slate-300 bg-slate-100 text-slate-700">
                      Privado pessoal
                    </Badge>
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <p className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Fora do sistema do {hospitalName}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Gestor e colegas não podem visualizar estes plantões. Os registros são somente
                      para sua organização pessoal.
                    </p>
                  </div>

                  <div className="mt-3 space-y-2">
                    {selectedPrivateShifts.length > 0 ? (
                      selectedPrivateShifts.map((shift) => (
                        <article
                          key={shift.id}
                          className="bg-background rounded-xl border border-slate-200 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-foreground text-sm font-medium">
                                {shift.institutionName}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {shift.locationName} · {shift.specialty}
                              </p>
                            </div>
                            <Badge className="border-slate-300 bg-slate-100 text-slate-700">
                              Privado
                            </Badge>
                          </div>
                          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-xs">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5 text-slate-600" />
                              {shift.startTime} - {shift.endTime}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Hospital className="h-3.5 w-3.5 text-slate-600" />
                              Outra instituição
                            </span>
                            <span className="text-foreground font-medium">
                              {formatCurrency(shift.value)}
                            </span>
                          </div>
                          {shift.notes && (
                            <p className="text-muted-foreground mt-2 text-xs">{shift.notes}</p>
                          )}
                        </article>
                      ))
                    ) : (
                      <p className="border-border text-muted-foreground rounded-xl border border-dashed px-3 py-4 text-sm">
                        Nenhum plantão externo privado cadastrado neste dia.
                      </p>
                    )}
                  </div>
                </section>

                <section className="card-base p-4">
                  <div className="flex items-center gap-2">
                    <CalendarPlus2 className="text-brand-600 h-4 w-4" />
                    <h4 className="font-display text-foreground text-sm font-semibold">
                      Adicionar plantão externo (privado)
                    </h4>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Registro pessoal: este plantão não entra nas escalas do {hospitalName}.
                  </p>

                  <div className="mt-3 grid gap-2">
                    <Input
                      value={privateShiftForm.institutionName}
                      onChange={(event) =>
                        setPrivateShiftForm((current) => ({
                          ...current,
                          institutionName: event.target.value,
                        }))
                      }
                      placeholder="Instituição (ex.: Hospital Santa Helena)"
                    />
                    <Input
                      value={privateShiftForm.locationName}
                      onChange={(event) =>
                        setPrivateShiftForm((current) => ({
                          ...current,
                          locationName: event.target.value,
                        }))
                      }
                      placeholder="Setor/local do plantão externo"
                    />
                    <Input
                      value={privateShiftForm.specialty}
                      onChange={(event) =>
                        setPrivateShiftForm((current) => ({
                          ...current,
                          specialty: event.target.value,
                        }))
                      }
                      placeholder="Especialidade"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={privateShiftForm.startTime}
                        onChange={(event) =>
                          setPrivateShiftForm((current) => ({
                            ...current,
                            startTime: event.target.value,
                          }))
                        }
                      />
                      <Input
                        type="time"
                        value={privateShiftForm.endTime}
                        onChange={(event) =>
                          setPrivateShiftForm((current) => ({
                            ...current,
                            endTime: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <Input
                      value={privateShiftForm.value}
                      onChange={(event) =>
                        setPrivateShiftForm((current) => ({
                          ...current,
                          value: event.target.value,
                        }))
                      }
                      placeholder="Valor do plantão (R$)"
                    />
                    <textarea
                      value={privateShiftForm.notes}
                      onChange={(event) =>
                        setPrivateShiftForm((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      rows={3}
                      className="border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background block w-full rounded-md border px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      placeholder="Observações pessoais (opcional)"
                    />
                    <Button type="button" className="mt-1 w-full" onClick={handleAddPrivateShift}>
                      Salvar plantão externo privado
                    </Button>
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="empty-day"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card-base p-6 text-center"
              >
                <div className="bg-brand-50 mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                  <CalendarIcon className="text-brand-600 h-5 w-5" />
                </div>
                <p className="text-foreground text-sm font-medium">Selecione um dia</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Toque em um dia para ver plantões e cadastrar plantão externo privado.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-base p-5"
          >
            <p className="text-muted-foreground mb-3 text-[11px] font-medium uppercase tracking-wider">
              Resumo do mês
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-lg p-3 text-center">
                <p className="font-display text-foreground text-xl font-bold">
                  {monthlyHospitalShifts}
                </p>
                <p className="text-muted-foreground text-[11px]">no hospital</p>
              </div>
              <div className="bg-background rounded-lg p-3 text-center">
                <p className="font-display text-foreground text-xl font-bold">
                  {monthlyPrivateShifts}
                </p>
                <p className="text-muted-foreground text-[11px]">externos privados</p>
              </div>
              <div className="bg-background rounded-lg p-3 text-center">
                <p className="font-display text-foreground text-xl font-bold">
                  {monthlySwapOptions}
                </p>
                <p className="text-muted-foreground text-[11px]">disponíveis p/ troca</p>
              </div>
              <div className="bg-background rounded-lg p-3 text-center">
                <p className="font-display text-foreground text-xl font-bold">
                  {monthlyActiveDays}
                </p>
                <p className="text-muted-foreground text-[11px]">dias ativos</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  )
}
