'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  CalendarDays,
  CircleDollarSign,
  Download,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { PageTransition } from '@/components/shared/page-transition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency } from '@/lib/utils'

type OccupancyResponse = {
  totalShifts: number
  totalSlots: number
  filledSlots: number
  openSlots: number
  occupancyRate: number
  byLocation: Array<{ location: string; slots: number; filled: number }>
}

type HoursRow = {
  userId: string
  name: string
  specialty?: string
  shifts: number
  hours: number
  earnings: number
}

type HoursResponse = {
  professionals: HoursRow[]
}

type CostsResponse = Array<{ month: string; label: string; total: number }>

function buildCsv(rows: HoursRow[]) {
  const headers = ['Nome', 'Especialidade', 'Plantoes', 'Horas', 'Ganhos (R$)']
  const lines = rows.map((row) =>
    [
      row.name,
      row.specialty ?? 'Não informado',
      String(row.shifts),
      String(row.hours),
      (row.earnings / 100).toFixed(2),
    ]
      .map((value) => `"${value.replaceAll('"', '""')}"`)
      .join(','),
  )

  return [headers.join(','), ...lines].join('\n')
}

export default function ReportsPage() {
  const [search, setSearch] = useState('')
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const userRole = useAuthStore((state) => state.user?.role)
  const canLoadReports =
    isAuthenticated && Boolean(accessToken) && (userRole === 'ADMIN' || userRole === 'MANAGER')

  const { data: occupancy, isLoading: occupancyLoading } = useQuery({
    queryKey: ['reports-occupancy'],
    enabled: canLoadReports,
    queryFn: async () => {
      const api = getApiClient()
      return api.get('reports/occupancy').json<OccupancyResponse>()
    },
  })

  const { data: hours, isLoading: hoursLoading } = useQuery({
    queryKey: ['reports-hours'],
    enabled: canLoadReports,
    queryFn: async () => {
      const api = getApiClient()
      return api.get('reports/hours').json<HoursResponse>()
    },
  })

  const { data: costs, isLoading: costsLoading } = useQuery({
    queryKey: ['reports-costs'],
    enabled: canLoadReports,
    queryFn: async () => {
      const api = getApiClient()
      return api.get('reports/costs').json<CostsResponse>()
    },
  })

  const professionals = useMemo(() => {
    const rows = hours?.professionals ?? []
    const term = search.trim().toLowerCase()
    if (!term) return rows

    return rows.filter((row) =>
      [row.name, row.specialty ?? '']
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [hours?.professionals, search])

  const totalProfessionalHours = (hours?.professionals ?? []).reduce((sum, row) => sum + row.hours, 0)
  const totalProfessionalEarnings = (hours?.professionals ?? []).reduce((sum, row) => sum + row.earnings, 0)
  const latestCost = costs && costs.length > 0 ? costs[costs.length - 1].total : 0

  const handleExportCsv = () => {
    if (professionals.length === 0) return
    const csv = buildCsv(professionals)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'relatorio-profissionais.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header title="Relatórios" subtitle="Cobertura, horas e custos da operação" />

      <PageTransition>
        <div className="space-y-6 p-4 sm:p-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                <CalendarDays className="h-4 w-4" />
                Escalas do período
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {occupancyLoading ? '—' : occupancy?.totalShifts ?? 0}
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                <Activity className="h-4 w-4" />
                Taxa de ocupação
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {occupancyLoading ? '—' : `${occupancy?.occupancyRate ?? 0}%`}
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                <Users className="h-4 w-4" />
                Horas profissionais
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {hoursLoading ? '—' : `${totalProfessionalHours.toFixed(1)}h`}
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                <CircleDollarSign className="h-4 w-4" />
                Custo recente
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {costsLoading ? '—' : formatCurrency(latestCost)}
              </p>
            </article>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Cobertura por setor</h2>
                <p className="text-sm text-muted-foreground">
                  Visão das vagas totais, preenchidas e em aberto por local.
                </p>
              </div>
              <Badge className="border-brand-200 bg-brand-50 text-brand-700">
                {occupancy?.openSlots ?? 0} vaga(s) em aberto
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {(occupancy?.byLocation ?? []).map((row) => {
                const rate = row.slots > 0 ? Math.round((row.filled / row.slots) * 100) : 0
                return (
                  <article key={row.location} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{row.location}</p>
                      <span className="text-xs text-muted-foreground">{rate}% ocupação</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.filled} preenchidas · {Math.max(0, row.slots - row.filled)} em aberto · {row.slots} totais
                    </p>
                  </article>
                )
              })}

              {!occupancyLoading && (occupancy?.byLocation?.length ?? 0) === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground">
                  Sem dados de cobertura para o período atual.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Produtividade médica</h2>
                <p className="text-sm text-muted-foreground">Horas e ganhos por profissional.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por médico ou especialidade"
                    className="h-9 w-72 pl-9"
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCsv}>
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {professionals.map((row) => (
                <article key={row.userId} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.specialty ?? 'Especialidade não informada'}</p>
                    </div>
                    <Badge className="border-green-200 bg-green-50 text-green-700">
                      {formatCurrency(row.earnings)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>{row.shifts} plantão(ões)</span>
                    <span>{row.hours.toFixed(1)}h</span>
                  </div>
                </article>
              ))}

              {!hoursLoading && professionals.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground">
                  Nenhum profissional encontrado para os filtros atuais.
                </div>
              ) : null}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total de ganhos no período</p>
              <p className="mt-2 text-xl font-bold text-foreground">{formatCurrency(totalProfessionalEarnings)}</p>
              <p className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Baseado em confirmações com status aceito.
              </p>
            </div>
          </section>
        </div>
      </PageTransition>
    </>
  )
}
