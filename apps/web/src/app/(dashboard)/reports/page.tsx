import { Header } from '@/components/layout/header'
import { DEMO_REPORT_HIGHLIGHTS, DEMO_REPORT_METRICS } from '@/lib/demo-data'

export default function ReportsPage() {
  return (
    <>
      <Header
        title="Relatórios"
        subtitle="Cobertura, produtividade e risco por mês"
      />

      <div className="space-y-6 p-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DEMO_REPORT_METRICS.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.context}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Destaques operacionais do mês</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bloco pronto para diretoria clínica, coordenação e governança assistencial.
          </p>

          <div className="mt-5 grid gap-3">
            {DEMO_REPORT_HIGHLIGHTS.map((highlight) => (
              <article
                key={highlight}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
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
