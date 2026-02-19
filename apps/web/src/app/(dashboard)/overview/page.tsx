'use client'

import { Users, Calendar, CheckCircle, DollarSign, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { StaggerList, StaggerItem } from '@/components/shared/page-transition'
import { PageTransition } from '@/components/shared/page-transition'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Hook de stats (conecta com /api/v1/tenants/me/stats)
function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Dados mock enquanto API não está conectada
      return {
        totalProfessionals: 24,
        activeSchedules: 3,
        confirmedThisWeek: 18,
        pendingConfirmations: 6,
        monthlyCost: 89400_00, // R$ 89.400,00 em centavos
        occupancyRate: 78,
      }
    },
  })
}

function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      return [
        { id: '1', type: 'confirmation', message: 'Dra. Ana Costa confirmou cobertura na UTI Adulto', time: new Date(Date.now() - 5 * 60 * 1000) },
        { id: '2', type: 'schedule',     message: 'Ciclo de escala da Clínica Médica foi publicado',   time: new Date(Date.now() - 32 * 60 * 1000) },
        { id: '3', type: 'confirmation', message: 'Dr. Carlos Mendes assumiu plantão noturno',         time: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { id: '4', type: 'alert',        message: 'Turno de 15/03 ainda requer confirmação final',     time: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      ]
    },
  })
}

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activity, isLoading: activityLoading } = useRecentActivity()

  const kpis = [
    {
      title:    'Profissionais Aptos',
      value:    stats?.totalProfessionals ?? 0,
      icon:     Users,
      color:    'brand' as const,
      subtitle: 'na operação atual',
    },
    {
      title:    'Escalas em Curso',
      value:    stats?.activeSchedules ?? 0,
      icon:     Calendar,
      color:    'green' as const,
      subtitle: 'com acompanhamento ativo',
    },
    {
      title:    'Confirmações da Semana',
      value:    stats?.confirmedThisWeek ?? 0,
      icon:     CheckCircle,
      color:    'green' as const,
      trend:    { value: 12, label: 'frente ao ciclo anterior' },
    },
    {
      title:    'Custo Projetado',
      value:    stats ? formatCurrency(stats.monthlyCost) : '—',
      icon:     DollarSign,
      color:    'amber' as const,
      subtitle: 'escalas em andamento',
    },
  ]

  return (
    <PageTransition>
      <Header
        title="Central Operacional"
        subtitle={`Panorama de cobertura - ${formatDate(new Date(), "EEEE, dd 'de' MMMM")}`}
      />

      <div className="p-6 space-y-8">
        {/* KPIs */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Pulso da Operação
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi, i) => (
              <KpiCard key={kpi.title} {...kpi} loading={statsLoading} index={i} />
            ))}
          </div>
        </section>

        {/* Pendências e Atividade */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Ocupação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 380, damping: 28 }}
            className="lg:col-span-1 rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <h3 className="font-display text-sm font-semibold text-foreground mb-4">
              Cobertura Assistencial
            </h3>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Geral</span>
                  <span className="font-display text-lg font-bold text-foreground">
                    {stats?.occupancyRate}%
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.occupancyRate ?? 0}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-brand-500"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-amber-500" />
                    {stats?.pendingConfirmations} pendências
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {stats?.confirmedThisWeek} confirmações
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Feed de atividade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 380, damping: 28 }}
            className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card"
          >
            <h3 className="font-display text-sm font-semibold text-foreground mb-4">
              Movimentos Recentes
            </h3>
            {activityLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <StaggerList className="space-y-3">
                {activity?.map((item) => (
                  <StaggerItem key={item.id}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        item.type === 'confirmation' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                        item.type === 'alert' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                        'bg-brand-100 text-brand-600 dark:bg-brand-900/30'
                      }`}>
                        {item.type === 'confirmation' ? <CheckCircle className="h-3.5 w-3.5" /> :
                         item.type === 'alert' ? <AlertCircle className="h-3.5 w-3.5" /> :
                         <Calendar className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{item.message}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.time, "HH:mm")}
                        </p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
