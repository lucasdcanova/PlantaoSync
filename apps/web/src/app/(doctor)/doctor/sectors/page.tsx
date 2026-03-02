'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getApiClient } from '@/lib/api'

type AvailableShift = {
  id: string
  specialty?: string | null
  requiredCount: number
  _count: {
    confirmations: number
  }
  location: {
    id: string
    name: string
  }
}

const criticalityClass = {
  3: 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300',
  2: 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  1: 'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
}

function resolvePriority(openShifts: number) {
  if (openShifts >= 6) return { value: 3 as const, label: 'Prioridade alta' }
  if (openShifts >= 3) return { value: 2 as const, label: 'Prioridade média' }
  return { value: 1 as const, label: 'Prioridade estável' }
}

export default function DoctorSectorsPage() {
  const { data: availableShifts = [], isLoading } = useQuery({
    queryKey: ['doctor-available-shifts'],
    queryFn: async () => {
      const api = getApiClient()
      return api.get('confirmations/available').json<AvailableShift[]>()
    },
  })

  const sectors = useMemo(() => {
    const grouped = new Map<
      string,
      {
        id: string
        name: string
        openShifts: number
        skills: string[]
      }
    >()

    availableShifts.forEach((shift) => {
      const key = shift.location.id
      const current = grouped.get(key) ?? {
        id: shift.location.id,
        name: shift.location.name,
        openShifts: 0,
        skills: [],
      }

      const slotsLeft = Math.max(0, (shift.requiredCount ?? 0) - (shift._count?.confirmations ?? 0))
      current.openShifts += slotsLeft

      if (shift.specialty && !current.skills.includes(shift.specialty)) {
        current.skills.push(shift.specialty)
      }

      grouped.set(key, current)
    })

    return Array.from(grouped.values()).sort((a, b) => b.openShifts - a.openShifts)
  }, [availableShifts])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl font-bold text-foreground">Setores disponíveis no hospital</h2>
        <p className="text-sm text-muted-foreground">
          Visualize setores com plantões abertos e acesse rapidamente as vagas por especialidade.
        </p>
      </section>

      {isLoading ? (
        <section className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Carregando setores...
        </section>
      ) : sectors.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {sectors.map((sector) => {
            const priority = resolvePriority(sector.openShifts)
            return (
              <article key={sector.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{sector.name}</h3>
                    <p className="text-sm text-muted-foreground">Unidade assistencial</p>
                  </div>
                  <Badge className={criticalityClass[priority.value]}>{priority.label}</Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Plantões em aberto</p>
                    <p className="mt-1 text-foreground">{sector.openShifts}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                    <p className="mt-1 text-foreground">{priority.label}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Perfis aceitos</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sector.skills.length > 0 ? (
                      sector.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Sem especialidade definida.</span>
                    )}
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
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Não há setores com plantões disponíveis neste momento.
        </section>
      )}
    </div>
  )
}
