'use client'

import { useMemo, useState } from 'react'
import {
  Users,
  Calendar,
  CheckCircle,
  DollarSign,
  Clock,
  AlertCircle,
  Activity,
  ShieldAlert,
  Stethoscope,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
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
import { Header } from '@/components/layout/header'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { StaggerList, StaggerItem } from '@/components/shared/page-transition'
import { PageTransition } from '@/components/shared/page-transition'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { DEMO_DASHBOARD_STATS, DEMO_PROFESSIONALS, DEMO_RECENT_ACTIVITY } from '@/lib/demo-data'

type InsightPersona = 'gestor' | 'medico'
type ProjectionWindow = '7d' | '30d'

// Hook de stats (conecta com /api/v1/tenants/me/stats)
function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Dados mock enquanto API não está conectada
      return DEMO_DASHBOARD_STATS
    },
  })
}

function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      return DEMO_RECENT_ACTIVITY
    },
  })
}

function getMinutesAgo(time: Date) {
  const diff = Date.now() - new Date(time).getTime()
  return Math.max(1, Math.round(diff / (1000 * 60)))
}

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activity, isLoading: activityLoading } = useRecentActivity()
  const [persona, setPersona] = useState<InsightPersona>('gestor')
  const [window, setWindow] = useState<ProjectionWindow>('30d')
  const [activeSlice, setActiveSlice] = useState(0)

  const monthlyCost = stats?.monthlyCost ?? DEMO_DASHBOARD_STATS.monthlyCost
  const occupancyRate = stats?.occupancyRate ?? DEMO_DASHBOARD_STATS.occupancyRate
  const pendingConfirmations = stats?.pendingConfirmations ?? DEMO_DASHBOARD_STATS.pendingConfirmations
  const confirmedThisWeek = stats?.confirmedThisWeek ?? DEMO_DASHBOARD_STATS.confirmedThisWeek

  const emsProjectionSeries = useMemo(() => {
    const segments =
      window === '7d'
        ? [
            { label: 'Seg', projectedShare: 0.028, confirmedShare: 0.024, pressure: 58 },
            { label: 'Ter', projectedShare: 0.031, confirmedShare: 0.027, pressure: 54 },
            { label: 'Qua', projectedShare: 0.033, confirmedShare: 0.029, pressure: 61 },
            { label: 'Qui', projectedShare: 0.034, confirmedShare: 0.031, pressure: 64 },
            { label: 'Sex', projectedShare: 0.037, confirmedShare: 0.033, pressure: 72 },
            { label: 'Sáb', projectedShare: 0.029, confirmedShare: 0.026, pressure: 66 },
            { label: 'Dom', projectedShare: 0.025, confirmedShare: 0.022, pressure: 57 },
          ]
        : [
            { label: 'Sem 1', projectedShare: 0.24, confirmedShare: 0.22, pressure: 61 },
            { label: 'Sem 2', projectedShare: 0.25, confirmedShare: 0.23, pressure: 63 },
            { label: 'Sem 3', projectedShare: 0.26, confirmedShare: 0.24, pressure: 66 },
            { label: 'Sem 4', projectedShare: 0.25, confirmedShare: 0.22, pressure: 68 },
          ]

    return segments.map((item) => ({
      ...item,
      projected: Math.round(monthlyCost * item.projectedShare),
      confirmed: Math.round(monthlyCost * item.confirmedShare),
    }))
  }, [monthlyCost, window])

  const periodProjected = emsProjectionSeries.reduce((sum, item) => sum + item.projected, 0)
  const periodConfirmed = emsProjectionSeries.reduce((sum, item) => sum + item.confirmed, 0)
  const adherenceRate = periodProjected > 0 ? Math.round((periodConfirmed / periodProjected) * 100) : 0

  const managerCoverageData = useMemo(
    () => [
      {
        name: 'UTI Adulto',
        coverage: Math.min(99, occupancyRate + 4),
        pending: Math.max(1, pendingConfirmations - 3),
        team: 11,
      },
      {
        name: 'Pronto-Socorro',
        coverage: Math.max(68, occupancyRate - 6),
        pending: Math.max(1, pendingConfirmations - 2),
        team: 13,
      },
      {
        name: 'Clínica Médica',
        coverage: Math.max(65, occupancyRate - 9),
        pending: Math.max(1, pendingConfirmations - 4),
        team: 8,
      },
      {
        name: 'UTI Neonatal',
        coverage: Math.max(62, occupancyRate - 12),
        pending: Math.max(1, pendingConfirmations - 1),
        team: 6,
      },
    ],
    [occupancyRate, pendingConfirmations],
  )

  const doctorSpecialtyData = useMemo(() => {
    const grouped = new Map<string, { name: string; acceptanceSum: number; completed: number; members: number }>()

    DEMO_PROFESSIONALS.forEach((professional) => {
      const current = grouped.get(professional.specialty)
      if (current) {
        current.acceptanceSum += professional.acceptanceRate
        current.completed += professional.completedShifts
        current.members += 1
        return
      }

      grouped.set(professional.specialty, {
        name: professional.specialty,
        acceptanceSum: professional.acceptanceRate,
        completed: professional.completedShifts,
        members: 1,
      })
    })

    return Array.from(grouped.values())
      .map((item) => ({
        name: item.name,
        acceptance: Math.round(item.acceptanceSum / item.members),
        completed: item.completed,
      }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 4)
  }, [])

  const managerMix = useMemo(
    () => [
      { name: 'Confirmados', value: confirmedThisWeek, color: '#22c55e' },
      { name: 'Pendentes', value: pendingConfirmations, color: '#f59e0b' },
      { name: 'Crítico', value: Math.max(1, Math.round(pendingConfirmations * 0.45)), color: '#ef4444' },
    ],
    [confirmedThisWeek, pendingConfirmations],
  )

  const doctorMix = useMemo(() => {
    const statusMap = DEMO_PROFESSIONALS.reduce<Record<string, number>>((acc, professional) => {
      acc[professional.status] = (acc[professional.status] ?? 0) + 1
      return acc
    }, {})

    return [
      { name: 'Em cobertura', value: statusMap['Em cobertura'] ?? 0, color: '#4ecdc4' },
      { name: 'Ativo', value: statusMap.Ativo ?? 0, color: '#3b82f6' },
      { name: 'Indisponível', value: statusMap.Indisponível ?? 0, color: '#f97316' },
    ]
  }, [])

  const pieData = persona === 'gestor' ? managerMix : doctorMix
  const activePieItem = pieData[activeSlice] ?? pieData[0]

  const kpis = [
    {
      title: 'Profissionais',
      value: stats?.totalProfessionals ?? 0,
      icon: Users,
      color: 'brand' as const,
      subtitle: 'Aptos no hospital',
    },
    {
      title: 'Escalas Ativas',
      value: stats?.activeSchedules ?? 0,
      icon: Calendar,
      color: 'green' as const,
      subtitle: 'Em acompanhamento',
    },
    {
      title: 'Confirmações',
      value: stats?.confirmedThisWeek ?? 0,
      icon: CheckCircle,
      color: 'green' as const,
      trend: { value: 12, label: 'vs. mês anterior' },
    },
    {
      title: 'Custo Projetado',
      value: stats ? formatCurrency(stats.monthlyCost) : '—',
      icon: DollarSign,
      color: 'amber' as const,
      subtitle: 'Escalas em curso',
    },
  ]

  return (
  <>
      <Header
        title="Central Operacional"
        subtitle={formatDate(new Date(), "EEEE, dd 'de' MMMM")}
      />

      <PageTransition>
        <div className="p-4 sm:p-6 space-y-6">
          {/* Projeção EMS no topo */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl border border-brand-200/50 bg-gradient-to-br from-brand-50/90 via-card to-brand-100/50 p-5 sm:p-6 shadow-brand"
          >
            <div className="pointer-events-none absolute -right-14 -top-16 h-52 w-52 rounded-full bg-brand-300/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-8 h-44 w-44 rounded-full bg-green-300/20 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-end">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-brand-200 bg-brand-100 text-brand-800">
                    Projeção EMS
                  </Badge>
                  <Badge variant="outline" className="border-border/70 text-[11px]">
                    Atualizado em tempo real
                  </Badge>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Escala mensal assistencial
                  </p>
                  {statsLoading ? (
                    <Skeleton className="mt-2 h-10 w-44" />
                  ) : (
                    <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                      {formatCurrency(window === '30d' ? monthlyCost : periodProjected)}
                    </h2>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    Aderência de {adherenceRate}% entre projeção e confirmações do período selecionado.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Confirmado</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(periodConfirmed)}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Gap atual</p>
                    <p className="mt-1 text-sm font-semibold text-amber-600">
                      {formatCurrency(Math.max(0, periodProjected - periodConfirmed))}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card/70 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pressão média</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {Math.round(
                        emsProjectionSeries.reduce((sum, item) => sum + item.pressure, 0) /
                          emsProjectionSeries.length,
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/80 p-4 backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-foreground">Curva de execução</p>
                  <div className="inline-flex rounded-full border border-border bg-background p-1">
                    {[
                      { id: '7d', label: '7 dias' },
                      { id: '30d', label: '30 dias' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setWindow(option.id as ProjectionWindow)}
                        className={cn(
                          'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                          window === option.id
                            ? 'bg-brand-500 text-white shadow-brand'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emsProjectionSeries}>
                      <defs>
                        <linearGradient id="emsProjected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ecdc4" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#4ecdc4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="emsConfirmed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.32} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }}
                        contentStyle={{
                          borderRadius: '10px',
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="projected"
                        stroke="#2bb5ab"
                        strokeWidth={2}
                        fill="url(#emsProjected)"
                        name="Projeção"
                      />
                      <Area
                        type="monotone"
                        dataKey="confirmed"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#emsConfirmed)"
                        name="Confirmado"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.section>

          {/* KPIs */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {kpis.map((kpi, i) => (
              <KpiCard key={kpi.title} {...kpi} loading={statsLoading} index={i} />
            ))}
          </section>

          {/* Gráficos interativos */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 26 }}
              className="xl:col-span-3 card-base p-5"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {persona === 'gestor' ? 'Cobertura por frente assistencial' : 'Pulso de adesão médica'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {persona === 'gestor'
                      ? 'Passe o mouse para inspecionar cobertura, pendências e alocação.'
                      : 'Visão da coordenação sobre prontidão e produtividade das especialidades.'}
                  </p>
                </div>
                <div className="inline-flex rounded-full border border-border bg-background p-1">
                  <button
                    type="button"
                    onClick={() => setPersona('gestor')}
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                      persona === 'gestor'
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Gestor
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersona('medico')}
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                      persona === 'medico'
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Médico
                  </button>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={persona === 'gestor' ? managerCoverageData : doctorSpecialtyData} barGap={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={50}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                      }}
                    />
                    {persona === 'gestor' ? (
                      <>
                        <Bar dataKey="coverage" name="Cobertura %" fill="#4ecdc4" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="pending" name="Pendências" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      </>
                    ) : (
                      <>
                        <Bar dataKey="acceptance" name="Aceite %" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="completed" name="Plantões concluídos" fill="#4ecdc4" radius={[8, 8, 0, 0]} />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 280, damping: 26 }}
              className="xl:col-span-2 card-base p-5"
            >
              <div className="mb-5 flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-foreground">
                  {persona === 'gestor' ? 'Composição operacional' : 'Status da força médica'}
                </h3>
                <Badge variant="outline" className="text-[11px]">
                  Interativo
                </Badge>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(value: number) => `${value} itens`}
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                      }}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={55}
                      outerRadius={92}
                      paddingAngle={3}
                      onMouseEnter={(_, index) => setActiveSlice(index)}
                    >
                      {pieData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={item.color}
                          opacity={activeSlice === index ? 1 : 0.7}
                          stroke={activeSlice === index ? '#ffffff' : 'transparent'}
                          strokeWidth={activeSlice === index ? 2 : 0}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 rounded-xl border border-border/70 bg-muted/20 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Destaque atual
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{activePieItem?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {activePieItem?.value} registros monitorados no momento.
                </p>
              </div>
            </motion.article>
          </section>

          {/* Prioridade + atividade */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:col-span-2 card-base p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-foreground italic">
                  Foco Prioritário
                </h3>
                <Badge variant="outline" className="border-border/60 text-[10px] font-medium">
                  Live
                </Badge>
              </div>

              {statsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <span className="font-display text-4xl font-bold tracking-tight text-foreground">
                      {occupancyRate}%
                    </span>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                      Turnos preenchidos
                    </p>
                  </div>

                  <div className="relative h-2 overflow-hidden rounded-full bg-muted/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${occupancyRate}%` }}
                      transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-brand-500 shadow-[0_0_12px_rgba(78,205,196,0.4)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <ShieldAlert className="h-3 w-3 text-amber-500" />
                        Pendências críticas
                      </span>
                      <span className="font-semibold text-foreground">{pendingConfirmations}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Stethoscope className="h-3 w-3 text-brand-600" />
                        Médicos em cobertura
                      </span>
                      <span className="font-semibold text-foreground">
                        {doctorMix.find((item) => item.name === 'Em cobertura')?.value ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        Confirmações na semana
                      </span>
                      <span className="font-semibold text-foreground">{confirmedThisWeek}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:col-span-3 card-base p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-foreground italic">
                  Ações em Tempo Real
                </h3>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] text-brand-700">
                  Ver todas
                </Button>
              </div>

              {activityLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-2 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <StaggerList className="space-y-4">
                  {activity?.map((item) => (
                    <StaggerItem key={item.id}>
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/40',
                            item.type === 'confirmation'
                              ? 'bg-green-50 text-green-600'
                              : item.type === 'alert'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-brand-50 text-brand-600',
                          )}
                        >
                          {item.type === 'confirmation' ? (
                            <CheckCircle className="h-3.5 w-3.5" />
                          ) : item.type === 'alert' ? (
                            <AlertCircle className="h-3.5 w-3.5" />
                          ) : (
                            <Activity className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug text-foreground/90">{item.message}</p>
                          <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Há {getMinutesAgo(item.time)} min
                          </p>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerList>
              )}
            </motion.article>
          </div>
        </div>
      </PageTransition>
    </>
  )
}
