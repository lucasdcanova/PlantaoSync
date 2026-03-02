'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HTTPError } from 'ky'
import { Activity, AlertTriangle, CalendarCheck2, MapPin, ShieldCheck, Users } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { PageTransition } from '@/components/shared/page-transition'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency, formatDate } from '@/lib/utils'

type TenantStatsResponse = {
  totalProfessionals: number
  totalLocations: number
  activeSchedules: number
  pendingConfirmations: number
  monthlyCost: number
}

type OccupancyResponse = {
  occupancyRate: number
  openSlots: number
  filledSlots: number
  totalSlots: number
}

type NotificationItem = {
  id: string
  title: string
  body: string
  createdAt: string
  readAt?: string | null
}

function useOverviewStats(enabled: boolean) {
  return useQuery({
    queryKey: ['overview-stats'],
    enabled,
    queryFn: async () => {
      const api = getApiClient()
      const [tenantStats, occupancy] = await Promise.all([
        api.get('tenants/me/stats').json<TenantStatsResponse>(),
        api.get('reports/occupancy').json<OccupancyResponse>(),
      ])

      return {
        ...tenantStats,
        occupancyRate: occupancy.occupancyRate,
        openSlots: occupancy.openSlots,
        filledSlots: occupancy.filledSlots,
        totalSlots: occupancy.totalSlots,
      }
    },
  })
}

function useRecentNotifications(enabled: boolean) {
  return useQuery({
    queryKey: ['overview-notifications'],
    enabled,
    queryFn: async () => {
      const api = getApiClient()
      try {
        const response = await api
          .get('notifications', { searchParams: { limit: 8 } })
          .json<{ data: NotificationItem[] }>()
        return response.data
      } catch (error) {
        if (error instanceof HTTPError && error.response.status === 404) {
          return []
        }
        throw error
      }
    },
  })
}

export default function OverviewPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const userRole = useAuthStore((state) => state.user?.role)
  const canLoadData =
    isAuthenticated && Boolean(accessToken) && (userRole === 'ADMIN' || userRole === 'MANAGER')

  const { data: stats, isLoading: statsLoading } = useOverviewStats(canLoadData)
  const { data: notifications, isLoading: notificationsLoading } = useRecentNotifications(canLoadData)

  const alerts = useMemo(() => {
    if (!stats) return []

    const items: string[] = []
    if (stats.pendingConfirmations > 0) {
      items.push(`${stats.pendingConfirmations} confirmação(ões) pendente(s) de validação.`)
    }
    if (stats.occupancyRate < 85) {
      items.push(`Taxa de ocupação em ${stats.occupancyRate}%. Avalie reforços de cobertura.`)
    }
    if (stats.openSlots > 0) {
      items.push(`${stats.openSlots} vaga(s) em aberto nas escalas publicadas.`)
    }

    return items.slice(0, 3)
  }, [stats])

  const kpis = [
    {
      title: 'Profissionais ativos',
      value: stats?.totalProfessionals ?? 0,
      icon: Users,
      color: 'brand' as const,
      subtitle: 'Corpo clínico vinculado',
      tooltip: 'Total de profissionais ativos na organização.',
    },
    {
      title: 'Setores ativos',
      value: stats?.totalLocations ?? 0,
      icon: MapPin,
      color: 'green' as const,
      subtitle: 'Unidades com operação',
      tooltip: 'Locais ativos cadastrados para escalas.',
    },
    {
      title: 'Escalas publicadas',
      value: stats?.activeSchedules ?? 0,
      icon: CalendarCheck2,
      color: 'green' as const,
      subtitle: 'Em acompanhamento',
      tooltip: 'Escalas com status publicado.',
    },
    {
      title: 'Custo mensal do plano',
      value: stats ? formatCurrency(stats.monthlyCost) : '—',
      icon: Activity,
      color: 'amber' as const,
      subtitle: 'Assinatura atual',
      tooltip: 'Valor de assinatura do plano vigente.',
    },
  ]

  return (
    <>
      <Header title="Central Operacional" subtitle={formatDate(new Date(), "EEEE, dd 'de' MMMM")} />

      <PageTransition>
        <div className="space-y-6 p-4 sm:p-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <KpiCard
                key={kpi.title}
                title={kpi.title}
                value={statsLoading ? '—' : kpi.value}
                icon={kpi.icon}
                color={kpi.color}
                subtitle={kpi.subtitle}
                tooltip={kpi.tooltip}
              />
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <article className="border-border bg-card shadow-card rounded-2xl border p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-foreground text-lg font-bold">Cobertura assistencial</h2>
                  <p className="text-muted-foreground text-sm">
                    Estado atual da capacidade de cobertura da organização.
                  </p>
                </div>
                <Badge className="border-brand-200 bg-brand-50 text-brand-700">
                  {statsLoading ? 'Carregando...' : `${stats?.occupancyRate ?? 0}% ocupação`}
                </Badge>
              </div>

              {statsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Vagas preenchidas</p>
                    <p className="text-foreground mt-1 text-lg font-semibold">{stats?.filledSlots ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Vagas em aberto</p>
                    <p className="text-foreground mt-1 text-lg font-semibold">{stats?.openSlots ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-3">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">Total de vagas</p>
                    <p className="text-foreground mt-1 text-lg font-semibold">{stats?.totalSlots ?? 0}</p>
                  </div>
                </div>
              )}
            </article>

            <article className="border-border bg-card shadow-card rounded-2xl border p-5">
              <h2 className="font-display text-foreground text-lg font-bold">Alertas operacionais</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Pontos que merecem acompanhamento imediato.
              </p>

              {statsLoading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-muted-foreground mt-6 rounded-xl border border-dashed border-border bg-background p-4 text-sm">
                  Nenhum alerta crítico no momento.
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                    >
                      <span className="inline-flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {alert}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="border-border bg-card shadow-card rounded-2xl border p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-foreground text-lg font-bold">Atividade recente</h2>
              <Badge variant="outline" className="text-[11px]">Notificações</Badge>
            </div>

            {notificationsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((item) => (
                  <article key={item.id} className="rounded-xl border border-border bg-background px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-foreground text-sm font-medium">{item.title}</p>
                      {!item.readAt ? (
                        <Badge className="border-brand-200 bg-brand-50 text-brand-700">Nova</Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">{item.body}</p>
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      {new Date(item.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground rounded-xl border border-dashed border-border bg-background p-4 text-sm">
                Ainda não há atividade registrada para esta organização.
              </div>
            )}
          </section>
        </div>
      </PageTransition>
    </>
  )
}
