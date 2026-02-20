'use client'

import { useMemo } from 'react'
import { Download } from 'lucide-react'
import { Header } from '@/components/layout/header'
import {
  DEMO_MONTHLY_DOCTOR_REPORT,
  DEMO_REPORT_HIGHLIGHTS,
  DEMO_REPORT_METRICS,
} from '@/lib/demo-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSchedulesStore } from '@/store/schedules.store'
import { formatDate } from '@/lib/utils'

function daysSince(dateString: string) {
  const from = new Date(`${dateString}T00:00:00`).getTime()
  const now = Date.now()
  return Math.floor((now - from) / (1000 * 60 * 60 * 24))
}

function buildReportCsv() {
  const headers = [
    'Nome',
    'Telefone',
    'Dias de plantao',
    'Horas realizadas',
    'Numero de plantoes',
    'Carga fixa (%)',
    'Ultimo plantao',
  ]

  const lines = DEMO_MONTHLY_DOCTOR_REPORT.map((row) =>
    [
      row.name,
      row.phone,
      String(row.daysWorked),
      String(row.totalHours),
      String(row.shiftsCount),
      String(row.fixedCoverageRate),
      row.lastShiftAt,
    ]
      .map((value) => `"${value.replaceAll('"', '""')}"`)
      .join(','),
  )

  return [headers.join(','), ...lines].join('\n')
}

export default function ReportsPage() {
  const schedules = useSchedulesStore((state) => state.schedules)

  const doctorsOver70Percent = useMemo(
    () => DEMO_MONTHLY_DOCTOR_REPORT.filter((row) => row.fixedCoverageRate > 70),
    [],
  )

  const inactiveOverThreeMonths = useMemo(
    () => DEMO_MONTHLY_DOCTOR_REPORT.filter((row) => daysSince(row.lastShiftAt) > 90),
    [],
  )

  const schedulesRequiringSwapApproval = schedules.filter(
    (schedule) => schedule.requireSwapApproval,
  )

  const handleDownloadMonthlyReport = () => {
    const csv = buildReportCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `relatorio-final-plantoes-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()

    window.URL.revokeObjectURL(url)
  }

  return (
    <>
      <Header title="Relatórios" subtitle="Cobertura, produtividade e risco por mês" />

      <div className="space-y-6 p-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DEMO_REPORT_METRICS.map((metric) => (
            <article
              key={metric.label}
              className="border-border bg-card shadow-card rounded-xl border p-5"
            >
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                {metric.label}
              </p>
              <p className="font-display text-foreground mt-2 text-2xl font-bold">{metric.value}</p>
              <p className="text-muted-foreground mt-1 text-xs">{metric.context}</p>
            </article>
          ))}
        </section>

        <section className="border-border bg-card shadow-card rounded-2xl border p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-foreground text-lg font-bold">
                Relatório final do mês
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Nome do médico, telefone, dias, horas e total de plantões realizados no período.
              </p>
            </div>

            <Button type="button" className="gap-2" onClick={handleDownloadMonthlyReport}>
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                    Médico
                  </th>
                  <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                    Telefone
                  </th>
                  <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                    Dias
                  </th>
                  <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                    Horas
                  </th>
                  <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                    Plantões
                  </th>
                  <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                    Carga fixa
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEMO_MONTHLY_DOCTOR_REPORT.map((row) => (
                  <tr key={row.professionalId}>
                    <td className="border-border/70 text-foreground border-b px-3 py-2 text-sm">
                      {row.name}
                    </td>
                    <td className="border-border/70 text-muted-foreground border-b px-3 py-2 text-sm">
                      {row.phone}
                    </td>
                    <td className="border-border/70 text-foreground border-b px-3 py-2 text-sm">
                      {row.daysWorked} dias
                    </td>
                    <td className="border-border/70 text-foreground border-b px-3 py-2 text-sm">
                      {row.totalHours} h
                    </td>
                    <td className="border-border/70 text-foreground border-b px-3 py-2 text-sm">
                      {row.shiftsCount}
                    </td>
                    <td className="border-border/70 border-b px-3 py-2 text-sm">
                      <Badge
                        className={
                          row.fixedCoverageRate > 70
                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                            : 'border-green-200 bg-green-50 text-green-700'
                        }
                      >
                        {row.fixedCoverageRate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className="border-border bg-card shadow-card rounded-2xl border p-5">
            <h3 className="font-display text-foreground text-base font-semibold">
              Alerta de concentração
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Plantonistas fixos acima de 70% da carga mensal.
            </p>

            <div className="mt-4 space-y-2">
              {doctorsOver70Percent.length > 0 ? (
                doctorsOver70Percent.map((doctor) => (
                  <div
                    key={doctor.professionalId}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-amber-800">{doctor.name}</p>
                    <p className="text-xs text-amber-700">
                      {doctor.fixedCoverageRate}% da carga mensal ({doctor.totalHours}h)
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  Nenhum profissional acima de 70%.
                </p>
              )}
            </div>
          </article>

          <article className="border-border bg-card shadow-card rounded-2xl border p-5">
            <h3 className="font-display text-foreground text-base font-semibold">
              Inatividade {'>'} 3 meses
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Profissionais sem atuação recente para revisão de cadastro.
            </p>

            <div className="mt-4 space-y-2">
              {inactiveOverThreeMonths.length > 0 ? (
                inactiveOverThreeMonths.map((doctor) => (
                  <div
                    key={doctor.professionalId}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-red-800">{doctor.name}</p>
                    <p className="text-xs text-red-700">Último plantão: {doctor.lastShiftAt}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  Todos os profissionais estão ativos no trimestre.
                </p>
              )}
            </div>
          </article>

          <article className="border-border bg-card shadow-card rounded-2xl border p-5">
            <h3 className="font-display text-foreground text-base font-semibold">
              Trocas com trava da gestão
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              Escalas que exigem autorização do gestor para confirmar troca.
            </p>

            <div className="mt-4 space-y-2">
              {schedulesRequiringSwapApproval.length > 0 ? (
                schedulesRequiringSwapApproval.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border-brand-200 bg-brand-50 rounded-lg border px-3 py-2"
                  >
                    <p className="text-brand-800 text-sm font-medium">{schedule.title}</p>
                    <p className="text-brand-700 text-xs">
                      {schedule.location?.name ?? 'Local não informado'} ·{' '}
                      {formatDate(schedule.startDate)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Nenhuma escala está com trava de troca ativa.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="border-border bg-card shadow-card rounded-2xl border p-6">
          <h2 className="font-display text-foreground text-lg font-bold">
            Destaques operacionais do mês
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Bloco pronto para diretoria clínica, coordenação e governança assistencial.
          </p>

          <div className="mt-5 grid gap-3">
            {DEMO_REPORT_HIGHLIGHTS.map((highlight) => (
              <article
                key={highlight}
                className="border-border bg-background text-foreground rounded-xl border px-4 py-3 text-sm"
              >
                {highlight}
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
