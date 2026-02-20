'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  PencilLine,
  Sparkles,
  Users,
  Phone,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/page-transition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate, SHIFT_STATUS_CONFIG } from '@/lib/utils'
import {
  DEMO_DOCTOR_AVAILABLE_SHIFTS,
  DEMO_LOCATIONS,
  DEMO_MANAGER_ASSIGNED_SHIFTS,
} from '@/lib/demo-data'
import { useSchedulesStore } from '@/store/schedules.store'
import Link from 'next/link'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
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

type OpenDayEntry = {
  id: string
  kind: 'aberto' | 'extra'
  sectorName: string
  startTime: string
  endTime: string
  slots: number
  notes?: string
}

type AssignedDayEntry = {
  id: string
  professionalId: string
  professionalName: string
  professionalPhone: string
  specialty: string
  assignmentSource: 'Escala fixa' | 'Troca aprovada'
  sectorName: string
  startTime: string
  endTime: string
}

function toISODate(year: number, month: number, day: number) {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function getShiftWindow(date: string, startTime: string, endTime: string) {
  const start = new Date(`${date}T${startTime}:00`)
  const end = new Date(`${date}T${endTime}:00`)

  if (end <= start) {
    end.setDate(end.getDate() + 1)
  }

  return { start, end }
}

function isShiftActiveNow(date: string, startTime: string, endTime: string, now: Date) {
  const { start, end } = getShiftWindow(date, startTime, endTime)
  return now >= start && now < end
}

export default function SchedulesPage() {
  const schedules = useSchedulesStore((state) => state.schedules)

  const [search, setSearch] = useState('')
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const filtered = useMemo(
    () =>
      schedules.filter((schedule) =>
        [schedule.title, schedule.description ?? '', schedule.location?.name ?? '']
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [schedules, search],
  )

  useEffect(() => {
    if (schedules.length === 0) {
      setSelectedScheduleId('')
      return
    }

    const hasSelectedSchedule = schedules.some((schedule) => schedule.id === selectedScheduleId)
    if (!hasSelectedSchedule) {
      setSelectedScheduleId(schedules[0].id)
    }
  }, [schedules, selectedScheduleId])

  const selectedSchedule = useMemo(
    () => schedules.find((schedule) => schedule.id === selectedScheduleId) ?? null,
    [schedules, selectedScheduleId],
  )

  const scheduleDate = selectedSchedule
    ? new Date(`${selectedSchedule.startDate.slice(0, 10)}T00:00:00`)
    : null

  const year = scheduleDate?.getFullYear() ?? new Date().getFullYear()
  const month = scheduleDate?.getMonth() ?? new Date().getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const sectorOptions = useMemo(() => {
    const source = new Set<string>()

    if (selectedSchedule?.location?.name) {
      source.add(selectedSchedule.location.name)
    }

    DEMO_LOCATIONS.forEach((location) => source.add(location.name))
    DEMO_DOCTOR_AVAILABLE_SHIFTS.forEach((shift) => source.add(shift.sectorName))
    DEMO_MANAGER_ASSIGNED_SHIFTS.forEach((shift) => source.add(shift.sectorName))

    return ['all', ...Array.from(source)]
  }, [selectedSchedule])

  const openEntriesByDay = useMemo(() => {
    const map = new Map<number, OpenDayEntry[]>()

    if (!selectedSchedule) return map

    const inPeriod = (date: string) =>
      date.slice(0, 10) >= selectedSchedule.startDate.slice(0, 10) &&
      date.slice(0, 10) <= selectedSchedule.endDate.slice(0, 10)

    DEMO_DOCTOR_AVAILABLE_SHIFTS.forEach((shift) => {
      const date = new Date(`${shift.date}T00:00:00`)
      const sameMonth = date.getFullYear() === year && date.getMonth() === month
      const matchesSector = selectedSector === 'all' || shift.sectorName === selectedSector

      if (!sameMonth || !inPeriod(shift.date) || !matchesSector) return

      const day = date.getDate()
      const entries = map.get(day) ?? []
      entries.push({
        id: shift.id,
        kind: 'aberto',
        sectorName: shift.sectorName,
        startTime: shift.startTime,
        endTime: shift.endTime,
        slots: shift.slotsLeft,
      })
      map.set(day, entries)
    })

    selectedSchedule.extraShifts.forEach((extraShift) => {
      const date = new Date(`${extraShift.date}T00:00:00`)
      const sameMonth = date.getFullYear() === year && date.getMonth() === month
      const extraSector =
        DEMO_LOCATIONS.find((location) => location.id === extraShift.locationId)?.name ??
        selectedSchedule.location?.name ??
        'Setor da escala'
      const matchesSector = selectedSector === 'all' || extraSector === selectedSector

      if (!sameMonth || !inPeriod(extraShift.date) || !matchesSector) return

      const day = date.getDate()
      const entries = map.get(day) ?? []
      entries.push({
        id: extraShift.id,
        kind: 'extra',
        sectorName: extraSector,
        startTime: extraShift.startTime,
        endTime: extraShift.endTime,
        slots: extraShift.requiredCount,
        notes: extraShift.notes,
      })
      map.set(day, entries)
    })

    map.forEach((entries, day) => {
      entries.sort((a, b) =>
        `${a.startTime}-${a.endTime}`.localeCompare(`${b.startTime}-${b.endTime}`),
      )
      map.set(day, entries)
    })

    return map
  }, [month, selectedSchedule, selectedSector, year])

  const openCountByDay = useMemo(() => {
    const map = new Map<number, number>()

    openEntriesByDay.forEach((entries, day) => {
      map.set(
        day,
        entries.reduce((sum, entry) => sum + entry.slots, 0),
      )
    })

    return map
  }, [openEntriesByDay])

  const assignedEntriesByDay = useMemo(() => {
    const map = new Map<number, AssignedDayEntry[]>()

    if (!selectedSchedule) return map

    DEMO_MANAGER_ASSIGNED_SHIFTS.forEach((assignedShift) => {
      if (assignedShift.scheduleId !== selectedSchedule.id) return
      if (selectedSector !== 'all' && assignedShift.sectorName !== selectedSector) return

      const date = new Date(`${assignedShift.date}T00:00:00`)
      const sameMonth = date.getFullYear() === year && date.getMonth() === month
      if (!sameMonth) return

      const day = date.getDate()
      const entries = map.get(day) ?? []

      entries.push({
        id: assignedShift.id,
        professionalId: assignedShift.professionalId,
        professionalName: assignedShift.professionalName,
        professionalPhone: assignedShift.professionalPhone,
        specialty: assignedShift.specialty,
        assignmentSource: assignedShift.assignmentSource,
        sectorName: assignedShift.sectorName,
        startTime: assignedShift.startTime,
        endTime: assignedShift.endTime,
      })

      map.set(day, entries)
    })

    map.forEach((entries, day) => {
      entries.sort((a, b) =>
        `${a.startTime}-${a.professionalName}`.localeCompare(
          `${b.startTime}-${b.professionalName}`,
        ),
      )
      map.set(day, entries)
    })

    return map
  }, [selectedSchedule, selectedSector, year, month])

  const assignedCountByDay = useMemo(() => {
    const map = new Map<number, number>()

    assignedEntriesByDay.forEach((entries, day) => {
      map.set(day, entries.length)
    })

    return map
  }, [assignedEntriesByDay])

  const professionalsOnDutyNow = useMemo(() => {
    if (!selectedSchedule) return []

    const now = new Date()

    return DEMO_MANAGER_ASSIGNED_SHIFTS.filter((assignedShift) => {
      if (assignedShift.scheduleId !== selectedSchedule.id) return false
      if (selectedSector !== 'all' && assignedShift.sectorName !== selectedSector) return false

      return isShiftActiveNow(
        assignedShift.date,
        assignedShift.startTime,
        assignedShift.endTime,
        now,
      )
    }).sort((a, b) =>
      `${a.sectorName}-${a.professionalName}`.localeCompare(
        `${b.sectorName}-${b.professionalName}`,
      ),
    )
  }, [selectedSchedule, selectedSector])

  const calendarDays: Array<number | null> = []
  for (let index = 0; index < firstDay; index += 1) calendarDays.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) calendarDays.push(day)

  const selectedDayOpenEntries = selectedDay ? (openEntriesByDay.get(selectedDay) ?? []) : []
  const selectedDayAssignedEntries = selectedDay
    ? (assignedEntriesByDay.get(selectedDay) ?? [])
    : []

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
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button variant="outline" size="icon" aria-label="Filtro indisponível nesta versão">
              <Filter className="h-4 w-4" />
            </Button>

            <Button
              asChild
              className="bg-brand-600 shadow-brand hover:bg-brand-700 gap-2 text-white"
            >
              <Link href="/schedules/new">
                <Plus className="h-4 w-4" />
                Nova Escala Mensal
              </Link>
            </Button>
          </div>

          <section className="border-border bg-card shadow-card rounded-2xl border p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-foreground text-lg font-bold">
                  Visão mensal de plantões em aberto
                </h2>
                <p className="text-muted-foreground text-sm">
                  Navegue por escala e setor para localizar rapidamente dias com maior risco.
                </p>
              </div>
              <Badge variant="outline" className="gap-1 text-[11px]">
                <Sparkles className="h-3 w-3" />
                Gestor
              </Badge>
            </div>

            {selectedSchedule ? (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                <article className="border-border bg-background rounded-xl border p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <select
                      value={selectedScheduleId}
                      onChange={(event) => {
                        setSelectedScheduleId(event.target.value)
                        setSelectedDay(null)
                      }}
                      className="border-input bg-card text-foreground h-9 rounded-md border px-3 text-xs"
                    >
                      {schedules.map((schedule) => (
                        <option key={schedule.id} value={schedule.id}>
                          {schedule.title}
                        </option>
                      ))}
                    </select>

                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      {MONTHS[month]} de {year}
                    </span>

                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedSchedule.location?.name ?? 'Não informado'}
                    </span>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {sectorOptions.map((sectorName) => (
                      <button
                        key={sectorName}
                        type="button"
                        onClick={() => {
                          setSelectedSector(sectorName)
                          setSelectedDay(null)
                        }}
                        className={cn(
                          'rounded-full border px-3 py-1 text-[11px] font-medium transition-all',
                          selectedSector === sectorName
                            ? 'border-brand-300 bg-brand-50 text-brand-700'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {sectorName === 'all' ? 'Todos os setores' : sectorName}
                      </button>
                    ))}
                  </div>

                  <div className="border-border/50 grid grid-cols-7 border">
                    {WEEKDAYS.map((weekday) => (
                      <div
                        key={weekday}
                        className="border-border/50 text-muted-foreground border-b py-2 text-center text-[10px] font-medium uppercase tracking-wider"
                      >
                        {weekday}
                      </div>
                    ))}

                    {calendarDays.map((day, index) => {
                      if (day === null) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="border-border/30 bg-background/40 aspect-square border-b border-r"
                          />
                        )
                      }

                      const dateIso = toISODate(year, month, day)
                      const inScheduleRange =
                        dateIso >= selectedSchedule.startDate.slice(0, 10) &&
                        dateIso <= selectedSchedule.endDate.slice(0, 10)

                      const openCount = openCountByDay.get(day) ?? 0
                      const assignedCount = assignedCountByDay.get(day) ?? 0
                      const hasEntries = openEntriesByDay.has(day)
                      const hasAssigned = assignedEntriesByDay.has(day)
                      const isSelected = selectedDay === day

                      return (
                        <button
                          key={dateIso}
                          type="button"
                          disabled={!inScheduleRange}
                          onClick={() =>
                            setSelectedDay((current) => (current === day ? null : day))
                          }
                          className={cn(
                            'border-border/30 relative aspect-square border-b border-r px-1 py-0.5 text-left transition-colors',
                            !inScheduleRange &&
                              'bg-muted/20 text-muted-foreground/40 cursor-not-allowed',
                            inScheduleRange && 'hover:bg-accent/40',
                            isSelected && 'bg-brand-50',
                          )}
                        >
                          <span className="text-[11px] font-medium">{day}</span>

                          {hasAssigned && (
                            <span className="absolute right-1 top-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-semibold text-green-700">
                              {assignedCount} escal.
                            </span>
                          )}

                          {hasEntries && (
                            <span className="bg-brand-600 absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white">
                              {openCount} abertos
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </article>

                <article className="border-border bg-background space-y-3 rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-foreground text-base font-semibold">
                      {selectedDay
                        ? `Detalhes de ${selectedDay}/${String(month + 1).padStart(2, '0')}`
                        : 'Selecione um dia'}
                    </h3>
                    <span className="text-muted-foreground text-xs">
                      {selectedDayAssignedEntries.length} escalados ·{' '}
                      {selectedDayOpenEntries.length} disponíveis
                    </span>
                  </div>

                  <div className="border-border bg-card rounded-lg border px-3 py-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-foreground text-sm font-medium">Em plantão agora</p>
                      <Badge className="border-green-200 bg-green-50 text-[10px] text-green-700">
                        {professionalsOnDutyNow.length} ativo(s)
                      </Badge>
                    </div>

                    {professionalsOnDutyNow.length > 0 ? (
                      <div className="space-y-2">
                        {professionalsOnDutyNow.map((onDuty) => (
                          <div
                            key={onDuty.id}
                            className="border-border bg-background rounded-md border px-2.5 py-2"
                          >
                            <p className="text-foreground text-xs font-semibold">
                              {onDuty.professionalName}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-[11px]">
                              {onDuty.sectorName} · {onDuty.startTime} - {onDuty.endTime}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">
                        Nenhum médico em plantão no momento para este filtro.
                      </p>
                    )}
                  </div>

                  {selectedDay ? (
                    <div className="space-y-3">
                      <div className="border-border bg-card rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                            <Users className="text-brand-500 h-3.5 w-3.5" />
                            Médicos escalados no dia
                          </h4>
                          <Badge className="border-brand-200 bg-brand-50 text-brand-700 text-[10px]">
                            {selectedDayAssignedEntries.length} médico(s)
                          </Badge>
                        </div>

                        {selectedDayAssignedEntries.length > 0 ? (
                          <div className="space-y-2">
                            {selectedDayAssignedEntries.map((entry) => (
                              <div
                                key={entry.id}
                                className="border-border bg-background rounded-md border px-2.5 py-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-foreground text-xs font-semibold">
                                    {entry.professionalName}
                                  </p>
                                  <Badge
                                    className={cn(
                                      'text-[10px]',
                                      entry.assignmentSource === 'Troca aprovada'
                                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                                        : 'border-green-200 bg-green-50 text-green-700',
                                    )}
                                  >
                                    {entry.assignmentSource}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground mt-0.5 text-[11px]">
                                  {entry.sectorName} · {entry.startTime} - {entry.endTime}
                                </p>
                                <p className="text-muted-foreground mt-0.5 text-[11px]">
                                  {entry.specialty}
                                </p>
                                <p className="text-muted-foreground mt-0.5 inline-flex items-center gap-1 text-[11px]">
                                  <Phone className="h-3 w-3" />
                                  {entry.professionalPhone}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-border bg-background text-muted-foreground rounded-md border border-dashed px-3 py-3 text-xs">
                            Nenhum médico escalado para este dia com o filtro atual.
                          </div>
                        )}
                      </div>

                      <div className="border-border bg-card rounded-lg border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-foreground text-sm font-semibold">
                            Disponíveis para troca/cobertura
                          </h4>
                          <Badge className="border-amber-200 bg-amber-50 text-[10px] text-amber-700">
                            {selectedDayOpenEntries.length} item(ns)
                          </Badge>
                        </div>

                        {selectedDayOpenEntries.length > 0 ? (
                          <div className="space-y-2">
                            {selectedDayOpenEntries.map((entry) => (
                              <div
                                key={entry.id}
                                className="border-border bg-background rounded-md border px-2.5 py-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-foreground text-xs font-semibold">
                                    {entry.sectorName}
                                  </p>
                                  <Badge
                                    className={cn(
                                      'text-[10px]',
                                      entry.kind === 'extra'
                                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                                        : 'border-brand-200 bg-brand-50 text-brand-700',
                                    )}
                                  >
                                    {entry.kind === 'extra' ? 'Turno extra' : 'Aberto'}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1 text-[11px]">
                                  {entry.startTime} - {entry.endTime} · {entry.slots} vaga(s)
                                </p>
                                {entry.notes && (
                                  <p className="text-muted-foreground mt-1 text-[11px]">
                                    {entry.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-border bg-background text-muted-foreground rounded-md border border-dashed px-3 py-3 text-xs">
                            Não há plantões disponíveis para troca/cobertura neste dia.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border-border bg-card text-muted-foreground rounded-lg border border-dashed px-3 py-4 text-sm">
                      Clique em um dia para visualizar médicos escalados e vagas disponíveis.
                    </div>
                  )}
                </article>
              </div>
            ) : (
              <div className="border-border bg-background text-muted-foreground rounded-xl border border-dashed px-4 py-6 text-sm">
                Cadastre uma escala para habilitar a visão mensal em aberto.
              </div>
            )}
          </section>

          <StaggerList className="space-y-3">
            {filtered.map((schedule) => {
              const statusConfig = SHIFT_STATUS_CONFIG[schedule.status]

              return (
                <StaggerItem key={schedule.id}>
                  <motion.article
                    layout
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    className="border-border bg-card shadow-card hover:shadow-elevated group rounded-xl border p-5 transition-shadow"
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/schedules/${schedule.id}`}
                          className="font-display text-foreground group-hover:text-brand-600 truncate font-semibold transition-colors"
                        >
                          {schedule.title}
                        </Link>
                        {schedule.description && (
                          <p className="text-muted-foreground mt-0.5 truncate text-sm">
                            {schedule.description}
                          </p>
                        )}
                      </div>
                      <Badge className={cn('shrink-0 text-xs', statusConfig.color)}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="text-brand-400 h-3.5 w-3.5" />
                        {schedule.location?.name ?? 'Não informado'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="text-brand-400 h-3.5 w-3.5" />
                        {formatDate(schedule.startDate)} – {formatDate(schedule.endDate)}
                      </span>
                      {schedule.publishedAt && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Publicada em {formatDate(schedule.publishedAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        {schedule.requireSwapApproval ? (
                          <>
                            <Badge className="border-green-200 bg-green-50 text-[10px] text-green-700">
                              Troca com aprovação
                            </Badge>
                          </>
                        ) : (
                          <Badge className="border-amber-200 bg-amber-50 text-[10px] text-amber-700">
                            Troca sem aprovação
                          </Badge>
                        )}
                      </span>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                        <Link href={`/schedules/${schedule.id}`}>
                          <PencilLine className="h-3.5 w-3.5" />
                          Editar escala
                        </Link>
                      </Button>
                    </div>
                  </motion.article>
                </StaggerItem>
              )
            })}
          </StaggerList>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <Calendar className="text-muted-foreground/40 mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground font-medium">Nenhuma escala encontrada</p>
              <p className="text-muted-foreground/70 mt-1 text-sm">
                Inicie um novo mês clicando em "Nova Escala Mensal"
              </p>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  )
}
