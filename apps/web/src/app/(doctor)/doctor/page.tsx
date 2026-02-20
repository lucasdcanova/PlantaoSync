'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Clock3, Repeat2, ArrowRight, Activity, ShieldAlert, TrendingUp } from 'lucide-react'
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

type DoctorLens = 'financeiro' | 'assistencial'
type TimelineWindow = '4s' | 'mes'

export default function DoctorOverviewPage() {
  const availableShifts = useDoctorDemoStore((state) => state.availableShifts)
  const myShifts = useDoctorDemoStore((state) => state.myShifts)
  const swapRequests = useDoctorDemoStore((state) => state.swapRequests)

  const [lens, setLens] = useState<DoctorLens>('financeiro')
  const [timelineWindow, setTimelineWindow] = useState<TimelineWindow>('mes')
  const [activeSwapSlice, setActiveSwapSlice] = useState(0)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const parseShiftDateTime = (date: string, time: string) => new Date(`${date}T${time}:00`)

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
  const monthProjection = monthShifts.reduce((sum, shift) => sum + shift.value, 0)
  const upsideProjection = monthOpportunities.slice(0, 3).reduce((sum, shift) => sum + shift.value, 0)
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
        base[weekIndex].confirmed += shift.value
      }
      base[weekIndex].shifts += 1
    })

    monthOpportunities.forEach((shift) => {
      const date = parseISO(shift.date)
      const weekIndex = Math.min(4, Math.max(0, Math.ceil(date.getDate() / 7) - 1))
      base[weekIndex].projected += shift.value
    })

    const merged = base.map((item) => ({
      ...item,
      projected: item.projected + item.confirmed,
    }))

    return timelineWindow === '4s' ? merged.slice(0, 4) : merged
  }, [monthOpportunities, monthShifts, timelineWindow])

  const assistentialSeries = useMemo(() => {
    const grouped = new Map<string, { name: string; shifts: number; value: number; loadScore: number }>()

    monthShifts.forEach((shift) => {
      const current = grouped.get(shift.sectorName)
      const loadWeight = shift.patientLoad === 'Alta' ? 3 : shift.patientLoad === 'Moderada' ? 2 : 1

      if (current) {
        current.shifts += 1
        current.value += shift.value
        current.loadScore += loadWeight
        return
      }

      grouped.set(shift.sectorName, {
        name: shift.sectorName,
        shifts: 1,
        value: shift.value,
        loadScore: loadWeight,
      })
    })

    return Array.from(grouped.values())
      .map((item) => ({
        name: item.name,
        shifts: item.shifts,
        pressure: Math.min(100, Math.round((item.loadScore / Math.max(1, item.shifts * 3)) * 100)),
        value: item.value,
      }))
      .sort((a, b) => b.shifts - a.shifts)
  }, [monthShifts])

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
        className="relative overflow-hidden rounded-2xl border border-brand-200/50 bg-gradient-to-br from-brand-50/95 via-card to-brand-100/45 p-5 shadow-brand sm:p-6"
      >
        <div className="pointer-events-none absolute -right-16 -top-14 h-48 w-48 rounded-full bg-brand-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-blue-300/15 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-brand-200 bg-brand-100 text-brand-800">Projeção EMS</Badge>
              <Badge variant="outline" className="text-[11px]">Resumo médico</Badge>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Projeção do mês de {monthLabel}
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {formatCurrency(monthProjection)}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Potencial de {formatCurrency(potentialProjection)} caso você confirme as melhores oportunidades abertas.
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                <span>Execução da meta EMS</span>
                <span className="font-semibold text-foreground">{emsProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-brand-100/70">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${emsProgress}%` }}
                  transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/80 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-foreground">Trajetória semanal</p>
              <div className="inline-flex rounded-full border border-border bg-background p-1">
                <button
                  type="button"
                  onClick={() => setTimelineWindow('4s')}
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                    timelineWindow === '4s'
                      ? 'bg-brand-500 text-white shadow-brand'
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
                      ? 'bg-brand-500 text-white shadow-brand'
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
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
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
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Upside de receita</p>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{formatCurrency(upsideProjection)}</p>
          <p className="text-xs text-muted-foreground">plantões disponíveis do mês</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <article className="rounded-2xl border border-border bg-card p-6 shadow-card xl:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Radar interativo de desempenho</h2>
              <p className="text-xs text-muted-foreground">
                Alterne entre foco financeiro e assistencial para navegar pelos indicadores.
              </p>
            </div>
            <div className="inline-flex rounded-full border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setLens('financeiro')}
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                  lens === 'financeiro'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Financeiro
              </button>
              <button
                type="button"
                onClick={() => setLens('assistencial')}
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                  lens === 'assistencial'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                Assistencial
              </button>
            </div>
          </div>

          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              {lens === 'financeiro' ? (
                <AreaChart data={financialSeries}>
                  <defs>
                    <linearGradient id="doctorFinanceConfirmed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ecdc4" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#4ecdc4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
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
                    fillOpacity={0}
                    name="Potencial"
                  />
                  <Area
                    type="monotone"
                    dataKey="confirmed"
                    stroke="#2bb5ab"
                    strokeWidth={2}
                    fill="url(#doctorFinanceConfirmed)"
                    name="Confirmado"
                  />
                </AreaChart>
              ) : (
                <BarChart data={assistentialSeries} barGap={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                    }}
                  />
                  <Bar dataKey="shifts" name="Plantões" fill="#4ecdc4" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pressure" name="Pressão %" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-6 shadow-card xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-foreground">Estado das trocas</h2>
            <Badge variant="outline" className="text-[11px]">Interativo</Badge>
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

          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Alerta principal</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{activeSwapStatus.name}</p>
            <p className="text-xs text-muted-foreground">
              {activeSwapStatus.value} solicitações no estado selecionado.
            </p>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                Pendências urgentes
              </span>
              <span className="font-semibold text-foreground">{pendingSwaps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                Plantões do mês
              </span>
              <span className="font-semibold text-foreground">{monthShifts.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-brand-600" />
                Oportunidades abertas
              </span>
              <span className="font-semibold text-foreground">{monthOpportunities.length}</span>
            </div>
          </div>
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
