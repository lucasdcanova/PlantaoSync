import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { DEMO_DOCTOR_INVITE_CODES, DEMO_PROFESSIONALS } from '@/lib/demo-data'

export default function ProfessionalsPage() {
  const onDutyCount = DEMO_PROFESSIONALS.filter((professional) => professional.status === 'Em cobertura').length
  const unavailableCount = DEMO_PROFESSIONALS.filter(
    (professional) => professional.status === 'Indisponível',
  ).length
  const avgAcceptance = Math.round(
    DEMO_PROFESSIONALS.reduce((sum, professional) => sum + professional.acceptanceRate, 0) /
      DEMO_PROFESSIONALS.length,
  )

  const statusClassName: Record<(typeof DEMO_PROFESSIONALS)[number]['status'], string> = {
    Ativo:
      'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
    'Em cobertura':
      'border border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300',
    Indisponível:
      'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  }

  return (
    <>
      <Header
        title="Profissionais"
        subtitle="Elegibilidade, disponibilidade e histórico assistencial"
      />

      <div className="space-y-6 p-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Profissionais ativos</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{DEMO_PROFESSIONALS.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Em cobertura agora</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{onDutyCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Taxa média de aceite</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{avgAcceptance}%</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Indisponíveis no mês</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{unavailableCount}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Base de profissionais da demonstração</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Estrutura completa para testar segmentação por especialidade, disponibilidade e unidade.
          </p>

          <div className="mt-5 space-y-3">
            {DEMO_PROFESSIONALS.map((professional) => (
              <article
                key={professional.id}
                className="rounded-xl border border-border bg-background p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-foreground">{professional.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {professional.crm} · {professional.specialty}
                    </p>
                  </div>
                  <Badge className={statusClassName[professional.status]}>{professional.status}</Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Taxa de aceite</p>
                    <p className="mt-1 text-foreground">{professional.acceptanceRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Plantões concluídos</p>
                    <p className="mt-1 text-foreground">{professional.completedShifts}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Próxima disponibilidade</p>
                    <p className="mt-1 text-foreground">{professional.nextAvailability}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Unidades aptas</p>
                    <p className="mt-1 text-foreground">{professional.locations.join(' · ')}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Convites para cadastro médico</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compartilhe os códigos ativos com médicos para cadastro no ambiente interno via rota <code>/invite</code>.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {DEMO_DOCTOR_INVITE_CODES.map((invite) => (
              <article key={invite.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{invite.sectorName}</p>
                    <p className="text-xs text-muted-foreground">Código: {invite.code}</p>
                  </div>
                  <Badge
                    className={
                      invite.status === 'ATIVO'
                        ? 'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300'
                        : 'border border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300'
                    }
                  >
                    {invite.status}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Emitido por {invite.issuedBy} · expira em {invite.expiresAt}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
