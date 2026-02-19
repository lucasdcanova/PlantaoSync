import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { DEMO_LOCATIONS } from '@/lib/demo-data'
import { formatCurrency } from '@/lib/utils'

export default function LocationsPage() {
  const totalPending = DEMO_LOCATIONS.reduce((sum, location) => sum + location.pendingShifts, 0)
  const avgOccupancy = Math.round(
    DEMO_LOCATIONS.reduce((sum, location) => sum + location.occupancyRate, 0) / DEMO_LOCATIONS.length,
  )
  const totalMonthlyCost = DEMO_LOCATIONS.reduce((sum, location) => sum + location.monthlyCost, 0)

  const criticalityClassName: Record<(typeof DEMO_LOCATIONS)[number]['criticality'], string> = {
    Alta:
      'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300',
    Média:
      'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
    Baixa:
      'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
  }

  return (
    <>
      <Header
        title="Locais"
        subtitle="Unidades, setores e níveis de criticidade assistencial"
      />

      <div className="space-y-6 p-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Unidades monitoradas</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{DEMO_LOCATIONS.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ocupação média</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{avgOccupancy}%</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Plantões pendentes</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{totalPending}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Custo mensal consolidado</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">{formatCurrency(totalMonthlyCost)}</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {DEMO_LOCATIONS.map((location) => (
            <article key={location.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">{location.name}</h2>
                  <p className="text-sm text-muted-foreground">Gestão de cobertura por criticidade e custo</p>
                </div>
                <Badge className={criticalityClassName[location.criticality]}>
                  Criticidade {location.criticality}
                </Badge>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ocupação assistencial</span>
                  <span className="font-medium text-foreground">{location.occupancyRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${location.occupancyRate}%` }} />
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Profissionais ativos</p>
                  <p className="mt-1 text-foreground">{location.activeProfessionals}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Plantões pendentes</p>
                  <p className="mt-1 text-foreground">{location.pendingShifts}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Custo mensal</p>
                  <p className="mt-1 text-foreground">{formatCurrency(location.monthlyCost)}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  )
}
