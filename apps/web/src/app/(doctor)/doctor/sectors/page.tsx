'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'

const criticalityClass = {
  3: 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300',
  2: 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  1: 'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
}

function resolvePriority(openShifts: number) {
  if (openShifts >= 3) return { value: 3, label: 'Prioridade alta' }
  if (openShifts >= 2) return { value: 2, label: 'Prioridade média' }
  return { value: 1, label: 'Prioridade estável' }
}

export default function DoctorSectorsPage() {
  const sectors = useDoctorDemoStore((state) => state.sectors)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-foreground">Setores disponíveis no hospital</h2>
        <p className="text-sm text-muted-foreground">
          Visualize os setores com plantões abertos e acesse rapidamente as vagas por especialidade.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {sectors.map((sector) => {
          const priority = resolvePriority(sector.openShifts)
          return (
            <article key={sector.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{sector.name}</h3>
                  <p className="text-sm text-muted-foreground">{sector.floor}</p>
                </div>
                <Badge className={criticalityClass[priority.value as 1 | 2 | 3]}>{priority.label}</Badge>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Plantões em aberto</p>
                  <p className="mt-1 text-foreground">{sector.openShifts}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Janela crítica</p>
                  <p className="mt-1 text-foreground">{sector.nextCriticalWindow}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Perfis aceitos</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sector.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <Button asChild className="bg-brand-600 text-white shadow-brand hover:bg-brand-700">
                  <Link href={`/doctor/available?sector=${sector.id}`}>Ver plantões deste setor</Link>
                </Button>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
