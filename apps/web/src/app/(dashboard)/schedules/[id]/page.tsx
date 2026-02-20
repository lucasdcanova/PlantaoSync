import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SHIFT_STATUS_CONFIG, formatDate } from '@/lib/utils'
import { getDemoScheduleById } from '@/lib/demo-data'

export default function ScheduleDetailsPage({ params }: { params: { id: string } }) {
  const schedule = getDemoScheduleById(params.id) ?? {
    id: params.id,
    title: `Escala ${params.id}`,
    location: { id: 'loc-unknown', name: 'Não informado' },
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'DRAFT' as const,
    description: 'Detalhes dessa escala ainda não foram sincronizados nesta visualização.',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-01',
    organizationId: 'org-demo',
    locationId: 'loc-unknown',
  }

  const status = SHIFT_STATUS_CONFIG[schedule.status]

  return (
    <>
      <Header title="Detalhes do Mês" subtitle="Visão consolidada de cobertura mensal" />

      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-5">
          <Button asChild variant="ghost" className="w-fit gap-2">
            <Link href="/schedules">
              <ArrowLeft className="h-4 w-4" />
              Voltar para meses
            </Link>
          </Button>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">{schedule.title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {schedule.description ?? 'Sem descrição cadastrada para este mês.'}
                </p>
              </div>
              <Badge className={status.color}>{status.label}</Badge>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Local</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="h-4 w-4 text-brand-500" />
                  {schedule.location?.name ?? 'Não informado'}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Início</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-foreground">
                  <Calendar className="h-4 w-4 text-brand-500" />
                  {formatDate(schedule.startDate)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Fim</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-foreground">
                  <Clock className="h-4 w-4 text-brand-500" />
                  {formatDate(schedule.endDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
