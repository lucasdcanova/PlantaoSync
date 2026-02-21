'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CalendarDays,
  Clock3,
  Repeat2,
  ArrowRight,
  Activity,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react'
import { InfoTooltip } from '@/components/ui/info-tooltip'
import { motion } from 'framer-motion'
import { parseISO } from 'date-fns'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { useSchedulesStore } from '@/store/schedules.store'
import { useLocationsStore } from '@/store/locations.store'
import { createShiftValueResolver } from '@/lib/shift-pricing'

type TimelineWindow = '4s' | 'mes'
type HoursWindow = 'semana' | 'mes'

export default function DoctorOverviewPage() {
  const availableShifts = useDoctorDemoStore((state) => state.availableShifts)
  const myShifts = useDoctorDemoStore((state) => state.myShifts)
  const swapRequests = useDoctorDemoStore((state) => state.swapRequests)
  const schedules = useSchedulesStore((state) => state.schedules)
  const locations = useLocationsStore((state) => state.locations)

  const [timelineWindow, setTimelineWindow] = useState<TimelineWindow>('mes')
  const [hoursWindow, setHoursWindow] = useState<HoursWindow>('semana')
  const [activeSwapSlice, setActiveSwapSlice] = useState(0)

  const resolveShiftValue = useMemo(
    () => createShiftValueResolver(schedules, locations),
    [locations, schedules],
  )

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const parseShiftDateTime = (date: string, time: string) => new Date(`${date}T${time}:00`)

  const getShiftDurationHours = (date: string, startTime: string, endTime: string) => {
    const start = parseShiftDateTime(date, startTime)
    const end = parseShiftDateTime(date, endTime)
    if (end <= start) {
      end.setDate(end.getDate() + 1)
    }

    return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  }

  const monthShifts = myShifts.filter((shift) => {
    const shiftDate = parseISO(shift.date)
    return shiftDate >= monthStart && shiftDate < monthEnd
  })

  const monthOpportunities = availableShifts.filter((shift) => {
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
  const monthProjection = monthShifts.reduce(
    (sum, shift) =>
      sum +
      resolveShiftValue({
        date: shift.date,
        sectorName: shift.sectorName,
        fallbackValue: shift.value,
      }),
    0,
  )
  const upsideProjection = monthOpportunities.slice(0, 3).reduce(
    (sum, shift) =>
      sum +
      resolveShiftValue({
        date: shift.date,
        sectorName: shift.sectorName,
        fallbackValue: shift.value,
      }),
    0,
  )
  const potentialProjection = monthProjection + upsideProjection
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const emsTarget = Math.max(potentialProjection, 680_000)
  const emsProgress = Math.min(100, Math.round((monthProjection / emsTarget) * 100))

  const financialSeries = useMemo(() => {
    const base = Array.from({ length: 5 }, (_, i) => ({
      label: `S${i + 1}`,
      confirmed: 0,
      projected: 0,
      shifts: 0,
    }))

    monthShifts.forEach((shift) => {
      const date = parseISO(shift.date)
      const weekIndex = Math.min(4, Math.max(0, Math.ceil(date.getDate() / 7) - 1))
      if (shift.status !== 'CANCELADO') {
        base[weekIndex].confirmed += resolveShiftValue({
          date: shift.date,
          sectorName: shift.sectorName,
          fallbackValue: shift.value,
        })
      }
      base[weekIndex].shifts += 1
    })

    monthOpportunities.forEach((shift) => {
      const date = parseISO(shift.date)
      const weekIndex = Math.min(4, Math.max(0, Math.ceil(date.getDate() / 7) - 1))
      base[weekIndex].projected += resolveShiftValue({
        date: shift.date,
        sectorName: shift.sectorName,
        fallbackValue: shift.value,
      })
    })

    const merged = base.map((item) => ({
      ...item,
      projected: item.projected + item.confirmed,
    }))

    return timelineWindow === '4s' ? merged.slice(0, 4) : merged
  }, [monthOpportunities, monthShifts, resolveShiftValue, timelineWindow])

  const workedShifts = useMemo(
    () =>
      myShifts.filter((shift) => {
        if (shift.status === 'CANCELADO') return false
        return parseShiftDateTime(shift.date, shift.startTime) <= now
      }),
    [myShifts, now],
  )

  const hoursWorkedSeries = useMemo(() => {
    if (hoursWindow === 'semana') {
      const dayBuckets = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index))
        const key = date.toISOString().slice(0, 10)

        return {
          key,
          label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          hours: 0,
        }
      })

      const dayMap = new Map(dayBuckets.map((bucket) => [bucket.key, bucket]))

      workedShifts.forEach((shift) => {
        const bucket = dayMap.get(shift.date.slice(0, 10))
        if (!bucket) return
        bucket.hours += getShiftDurationHours(shift.date, shift.startTime, shift.endTime)
      })

      return dayBuckets.map((bucket) => ({
        label: bucket.label,
        hours: Number(bucket.hours.toFixed(1)),
      }))
    }

    const monthBuckets = Array.from({ length: 5 }, (_, index) => ({
      label: `S${index + 1}`,
      hours: 0,
    }))

    workedShifts.forEach((shift) => {
      const date = parseISO(shift.date)
      const inCurrentMonth = date >= monthStart && date < monthEnd
      if (!inCurrentMonth) return

      const weekIndex = Math.min(4, Math.max(0, Math.ceil(date.getDate() / 7) - 1))
      monthBuckets[weekIndex].hours += getShiftDurationHours(
        shift.date,
        shift.startTime,
        shift.endTime,
      )
    })

    return monthBuckets.map((bucket) => ({
      ...bucket,
      hours: Number(bucket.hours.toFixed(1)),
    }))
  }, [getShiftDurationHours, hoursWindow, monthEnd, monthStart, now, workedShifts])

  const totalWorkedHours = useMemo(
    () => Number(hoursWorkedSeries.reduce((sum, point) => sum + point.hours, 0).toFixed(1)),
    [hoursWorkedSeries],
  )

  const swapSeries = useMemo(() => {
    const statusCount = swapRequests.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1
      return acc
    }, {})

    return [
      { name: 'Pendentes', value: statusCount.PENDENTE ?? 0, color: '#f59e0b' },
      { name: 'Aceitas', value: statusCount.ACEITA ?? 0, color: '#22c55e' },
      { name: 'Recusadas', value: statusCount.RECUSADA ?? 0, color: '#ef4444' },
    ]
  }, [swapRequests])

  const activeSwapStatus = swapSeries[activeSwapSlice] ?? swapSeries[0]

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="border-brand-200/50 from-brand-50/95 via-card to-brand-100/45 shadow-brand relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 sm:p-6"
      >
        <div className="bg-brand-300/25 pointer-events-none absolute -right-16 -top-14 h-48 w-48 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-blue-300/15 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-brand-200 bg-brand-100 text-brand-800">Projeção EMS</Badge>
              <Badge variant="outline" className="text-[11px]">
                Resumo médico
              </Badge>
              <InfoTooltip
                title="Projeção EMS"
                description="Projeção dos seus ganhos com base nos plantões confirmados deste mês. O potencial inclui oportunidades abertas que você ainda pode aceitar para aumentar sua receita."
                side="bottom"
              />
            </div>

            <p className="text-muted-foreground mt-4 text-xs uppercase tracking-[0.18em]">
              Projeção do mês de {monthLabel}
            </p>
            <h1 className="font-display text-foreground mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {formatCurrency(monthProjection)}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Potencial de {formatCurrency(potentialProjection)} caso você confirme as melhores
              oportunidades abertas.
            </p>

            <div className="mt-4 space-y-2">
              <div className="text-muted-foreground flex items-center justify-between text-[11px] uppercase tracking-wide">
                <span className="inline-flex items-center gap-1">
                  Execução da meta EMS
                  <InfoTooltip
                    title="Execução da Meta EMS"
                    description="Percentual da sua projeção atual em relação à meta EMS do mês, calculada como o maior valor entre sua projeção confirmada e o potencial total de oportunidades abertas."
                    side="top"
                  />
                </span>
                <span className="text-foreground font-semibold">{emsProgress}%</span>
              </div>
              <div className="bg-brand-100/70 h-2 overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${emsProgress}%` }}
                  transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-brand-500 h-full rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="border-border/60 bg-card/80 rounded-xl border p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-foreground text-xs font-medium">Trajetória semanal</p>
              <div className="border-border bg-background inline-flex rounded-full border p-1">
                <button
                  type="button"
                  onClick={() => setTimelineWindow('4s')}
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                    timelineWindow === '4s'
                      ? 'bg-brand-500 shadow-brand text-white'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  4 semanas
                </button>
                <button
                  type="button"
                  onClick={() => setTimelineWindow('mes')}
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                    timelineWindow === 'mes'
                      ? 'bg-brand-500 shadow-brand text-white'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  mês
                </button>
              </div>
            </div>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialSeries}>
                  <defs>
                    <linearGradient id="doctorConfirmed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ecdc4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4ecdc4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="doctorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#doctorProjected)"
                    name="Potencial"
                  />
                  <Area
                    type="monotone"
                    dataKey="confirmed"
                    stroke="#2bb5ab"
                    strokeWidth={2}
                    fill="url(#doctorConfirmed)"
                    name="Confirmado"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="border-border bg-card shadow-card rounded-2xl border p-5">
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Plantões disponíveis
            </p>
            <InfoTooltip
              title="Plantões Disponíveis"
              description="Total de plantões publicados pelo hospital que estão abertos para confirmação, considerando sua especialidade e os turnos ainda não preenchidos."
              side="top"
            />
          </div>
          <p className="font-display text-foreground mt-2 text-2xl font-bold">
            {availableShifts.length}
          </p>
          <p className="text-muted-foreground text-xs">abertos para confirmação</p>
        </article>
        <article className="border-border bg-card shadow-card rounded-2xl border p-5">
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Confirmados no mês
            </p>
            <InfoTooltip
              title="Confirmados no Mês"
              description="Plantões que você aceitou e que não foram cancelados neste mês calendário. Inclui plantões passados e futuros já confirmados."
              side="top"
            />
          </div>
          <p className="font-display text-foreground mt-2 text-2xl font-bold">{confirmedInMonth}</p>
          <p className="text-muted-foreground text-xs">{monthLabel}</p>
        </article>
        <article className="border-border bg-card shadow-card rounded-2xl border p-5">
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Trocas pendentes
            </p>
            <InfoTooltip
              title="Trocas Pendentes"
              description="Solicitações de troca de plantão que ainda aguardam resposta sua ou da coordenação. Trocas não respondidas podem expirar automaticamente."
              side="top"
            />
          </div>
          <p className="font-display text-foreground mt-2 text-2xl font-bold">{pendingSwaps}</p>
          <p className="text-muted-foreground text-xs">aguardando decisão</p>
        </article>
        <article className="border-border bg-card shadow-card rounded-2xl border p-5">
          <div className="flex items-center gap-1">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Upside de receita
            </p>
            <InfoTooltip
              title="Upside de Receita"
              description="Valor acumulado das 3 melhores oportunidades abertas disponíveis neste mês. Representa o ganho adicional que você pode alcançar confirmando esses plantões."
              side="top"
            />
          </div>
          <p className="font-display text-foreground mt-2 text-2xl font-bold">
            {formatCurrency(upsideProjection)}
          </p>
          <p className="text-muted-foreground text-xs">plantões disponíveis do mês</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <article className="border-border bg-card shadow-card rounded-2xl border p-6 xl:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-foreground text-lg font-bold">
                  Horas trabalhadas
                </h2>
                <InfoTooltip
                  title="Horas trabalhadas"
                  description="Visualize sua carga real de horas em plantões já realizados. No filtro semanal, cada barra representa um dia; no filtro mensal, a soma é agrupada por semana."
                  side="top"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Acompanhe sua carga horária com granularidade semanal ou mensal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[11px]">
                {totalWorkedHours.toFixed(1)}h
              </Badge>

              <div className="border-border bg-background inline-flex rounded-full border p-1">
                <button
                  type="button"
                  onClick={() => setHoursWindow('semana')}
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                    hoursWindow === 'semana'
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Semana
                </button>
                <button
                  type="button"
                  onClick={() => setHoursWindow('mes')}
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                    hoursWindow === 'mes'
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Mês
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursWorkedSeries} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `${value}h`}
                  width={36}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} horas`, 'Carga horária']}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                  }}
                />
                <Bar
                  dataKey="hours"
                  name="Horas trabalhadas"
                  fill="#2bb5ab"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={hoursWindow === 'semana' ? 30 : 42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="border-border bg-card shadow-card rounded-2xl border p-6 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-foreground text-lg font-bold">Estado das trocas</h2>
              <InfoTooltip
                title="Estado das Trocas"
                description="Distribuição das suas solicitações de troca de plantão por status: Pendentes = aguardando decisão; Aceitas = trocas aprovadas pela coordenação; Recusadas = não aprovadas."
                side="top"
              />
            </div>
            <Badge variant="outline" className="text-[11px]">
              Interativo
            </Badge>
          </div>

          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: number) => `${value} solicitações`}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                  }}
                />
                <Pie
                  data={swapSeries}
                  dataKey="value"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={3}
                  onMouseEnter={(_, index) => setActiveSwapSlice(index)}
                >
                  {swapSeries.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                      opacity={activeSwapSlice === index ? 1 : 0.72}
                      stroke={activeSwapSlice === index ? '#ffffff' : 'transparent'}
                      strokeWidth={activeSwapSlice === index ? 2 : 0}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="border-border bg-muted/20 rounded-xl border p-3">
            <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
              Alerta principal
            </p>
            <p className="text-foreground mt-1 text-sm font-semibold">{activeSwapStatus.name}</p>
            <p className="text-muted-foreground text-xs">
              {activeSwapStatus.value} solicitações no estado selecionado.
            </p>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                Pendências urgentes
                <InfoTooltip
                  title="Pendências Urgentes"
                  description="Trocas pendentes que requerem atenção imediata — a outra parte está aguardando sua resposta ou a data do plantão se aproxima."
                  side="left"
                />
              </span>
              <span className="text-foreground font-semibold">{pendingSwaps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                Plantões do mês
                <InfoTooltip
                  title="Plantões do Mês"
                  description="Total de plantões na sua escala neste mês calendário, incluindo passados, futuros, confirmados e cancelados."
                  side="left"
                />
              </span>
              <span className="text-foreground font-semibold">{monthShifts.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground inline-flex items-center gap-1.5">
                <Activity className="text-brand-600 h-3.5 w-3.5" />
                Oportunidades abertas
                <InfoTooltip
                  title="Oportunidades Abertas"
                  description="Plantões publicados pelo hospital disponíveis para você confirmar neste mês. Confirmar oportunidades aumenta sua projeção EMS."
                  side="left"
                />
              </span>
              <span className="text-foreground font-semibold">{monthOpportunities.length}</span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="border-border bg-card shadow-card rounded-2xl border p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-foreground text-lg font-bold">
              Próximas oportunidades
            </h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/doctor/available" className="gap-1.5">
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {availableShifts.slice(0, 3).map((shift) => (
              <div key={shift.id} className="border-border bg-background rounded-xl border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-foreground font-medium">{shift.sectorName}</p>
                    <p className="text-muted-foreground text-xs">{shift.specialty}</p>
                  </div>
                  <Badge className="border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300 border">
                    {shift.slotsLeft} vaga{shift.slotsLeft > 1 ? 's' : ''}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
                  <CalendarDays className="text-brand-500 h-4 w-4" />
                  {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="border-border bg-card shadow-card rounded-2xl border p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-foreground text-lg font-bold">Meus plantões</h2>
            <Button asChild size="sm" variant="outline">
              <Link href="/doctor/history" className="gap-1.5">
                Histórico
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {upcoming.map((shift) => (
              <div key={shift.id} className="border-border bg-background rounded-xl border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-foreground font-medium">{shift.sectorName}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatCurrency(
                        resolveShiftValue({
                          date: shift.date,
                          sectorName: shift.sectorName,
                          fallbackValue: shift.value,
                        }),
                      )}
                    </p>
                  </div>
                  <Badge className="border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300">
                    {shift.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
                  <Clock3 className="text-brand-500 h-4 w-4" />
                  {formatDate(shift.date)} · {shift.startTime} - {shift.endTime}
                </p>
              </div>
            ))}

            {upcoming.length === 0 && (
              <div className="border-border bg-background text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
                Nenhum plantão confirmado para o restante deste mês.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="border-border bg-card shadow-card rounded-2xl border p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-foreground text-lg font-bold">Solicitações de troca</h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/doctor/swaps" className="gap-1.5">
              Gerenciar trocas
              <Repeat2 className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground mt-2 text-sm">
          Você tem {pendingSwaps} solicitação(ões) pendente(s) para revisar.
        </p>
      </section>
    </div>
  )
}
