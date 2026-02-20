'use client'

import { Users, Calendar, CheckCircle, DollarSign, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { StaggerList, StaggerItem } from '@/components/shared/page-transition'
import { PageTransition } from '@/components/shared/page-transition'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { DEMO_DASHBOARD_STATS, DEMO_RECENT_ACTIVITY } from '@/lib/demo-data'

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

export default function OverviewPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activity, isLoading: activityLoading } = useRecentActivity()

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
      trend: { value: 12, label: 'vs. ciclo anterior' },
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
    <PageTransition>
      <Header
        title="Central Operacional"
        subtitle={formatDate(new Date(), "EEEE, dd 'de' MMMM")}
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* KPIs */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {kpis.map((kpi, i) => (
            <KpiCard key={kpi.title} {...kpi} loading={statsLoading} index={i} />
          ))}
        </section>

        {/* Priority Monitoring */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Coverage Meter */}
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:col-span-2 card-base p-5"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-sm font-semibold text-foreground italic">
                Cobertura Assistencial
              </h3>
              <Badge variant="outline" className="text-[10px] font-medium border-border/60">Geral</Badge>
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
                    {stats?.occupancyRate}%
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">Turnos preenchidos</p>
                </div>

                <div className="relative h-1.5 overflow-hidden rounded-full bg-muted/60">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.occupancyRate ?? 0}%` }}
                    transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-brand-500 shadow-[0_0_12px_rgba(78,205,196,0.4)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span className="text-xs text-muted-foreground">
                      {stats?.pendingConfirmations} pendentes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-muted-foreground">
                      {stats?.confirmedThisWeek} novas
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.article>

          {/* Activity Feed */}
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:col-span-3 card-base p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-sm font-semibold text-foreground italic">
                Ações em Tempo Real
              </h3>
              <Button variant="ghost" size="sm" className="text-[11px] h-7 text-brand-700">Ver todas</Button>
            </div>

            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
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
                      <div className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/40",
                        item.type === 'confirmation' ? 'bg-green-50 text-green-600' :
                          item.type === 'alert' ? 'bg-amber-50 text-amber-600' :
                            'bg-brand-50 text-brand-600'
                      )}>
                        {item.type === 'confirmation' ? <CheckCircle className="h-3.5 w-3.5" /> :
                          item.type === 'alert' ? <AlertCircle className="h-3.5 w-3.5" /> :
                            <Calendar className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-foreground/90">{item.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Há {Math.floor(Math.random() * 60)} min
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
  )
}
