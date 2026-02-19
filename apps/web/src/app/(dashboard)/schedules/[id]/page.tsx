import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SHIFT_STATUS_CONFIG, formatDate } from '@/lib/utils'

const mockSchedules = [
  {
    id: '1',
    title: 'Cobertura UTI Adulto - Ciclo Fevereiro 2026',
    location: 'UTI Adulto',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'PUBLISHED' as const,
    summary:
      'Escala mensal com cobertura para turnos diurnos e noturnos. Distribuição equilibrada entre equipes titulares e suporte.',
  },
  {
    id: '2',
    title: 'Cobertura Pronto-Socorro - Ciclo Fevereiro 2026',
    location: 'Pronto-Socorro',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'PUBLISHED' as const,
    summary:
      'Escala com reforço em horários de maior demanda e janela extra para cobertura de pico nos fins de semana.',
  },
  {
    id: '3',
    title: 'Cobertura UTI Adulto - Planejamento Março 2026',
    location: 'UTI Adulto',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'DRAFT' as const,
    summary:
      'Planejamento inicial aguardando validação de disponibilidade de profissionais e ajustes de cobertura por especialidade.',
  },
]

export default function ScheduleDetailsPage({ params }: { params: { id: string } }) {
  const schedule = mockSchedules.find((item) => item.id === params.id) ?? {
    id: params.id,
    title: `Escala ${params.id}`,
    location: 'Não informado',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'DRAFT' as const,
    summary: 'Detalhes dessa escala ainda não foram sincronizados nesta visualização.',
  }

  const status = SHIFT_STATUS_CONFIG[schedule.status]

  return (
    <>
      <Header title="Detalhes do Ciclo" subtitle="Visão consolidada de cobertura por período" />

      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-5">
          <Button asChild variant="ghost" className="w-fit gap-2">
            <Link href="/schedules">
              <ArrowLeft className="h-4 w-4" />
              Voltar para ciclos
            </Link>
          </Button>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">{schedule.title}</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{schedule.summary}</p>
              </div>
              <Badge className={status.color}>{status.label}</Badge>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Local</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="h-4 w-4 text-brand-500" />
                  {schedule.location}
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
