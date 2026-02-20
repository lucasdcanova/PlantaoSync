'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, Filter, Calendar, MapPin, Clock, PencilLine } from 'lucide-react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/page-transition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate, SHIFT_STATUS_CONFIG } from '@/lib/utils'
import { useSchedulesStore } from '@/store/schedules.store'
import Link from 'next/link'

export default function SchedulesPage() {
  const [search, setSearch] = useState('')
  const schedules = useSchedulesStore((state) => state.schedules)

  const filtered = useMemo(
    () =>
      schedules.filter((schedule) =>
        [schedule.title, schedule.description ?? '', schedule.location?.name ?? '']
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [schedules, search],
  )

  return (
    <>
      <Header title="Escalas" subtitle="Planeje cobertura por unidade e turno" />

      <PageTransition>
        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar por mês, unidade ou setor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button variant="outline" size="icon" aria-label="Filtro indisponível nesta versão">
              <Filter className="h-4 w-4" />
            </Button>

            <Button asChild className="bg-brand-600 shadow-brand hover:bg-brand-700 text-white">
              <Link href="/schedules/new" className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Escala Mensal
              </Link>
            </Button>
          </div>

          <StaggerList className="space-y-3">
            {filtered.map((schedule) => {
              const statusConfig = SHIFT_STATUS_CONFIG[schedule.status]

              return (
                <StaggerItem key={schedule.id}>
                  <motion.article
                    layout
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    className="border-border bg-card shadow-card hover:shadow-elevated group rounded-xl border p-5 transition-shadow"
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/schedules/${schedule.id}`}
                          className="font-display text-foreground group-hover:text-brand-600 truncate font-semibold transition-colors"
                        >
                          {schedule.title}
                        </Link>
                        {schedule.description && (
                          <p className="text-muted-foreground mt-0.5 truncate text-sm">
                            {schedule.description}
                          </p>
                        )}
                      </div>
                      <Badge className={cn('shrink-0 text-xs', statusConfig.color)}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="text-brand-400 h-3.5 w-3.5" />
                        {schedule.location?.name ?? 'Não informado'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="text-brand-400 h-3.5 w-3.5" />
                        {formatDate(schedule.startDate)} – {formatDate(schedule.endDate)}
                      </span>
                      {schedule.publishedAt && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          Publicada em {formatDate(schedule.publishedAt)}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                        <Link href={`/schedules/${schedule.id}`}>
                          <PencilLine className="h-3.5 w-3.5" />
                          Editar escala
                        </Link>
                      </Button>
                    </div>
                  </motion.article>
                </StaggerItem>
              )
            })}
          </StaggerList>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <Calendar className="text-muted-foreground/40 mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground font-medium">Nenhuma escala encontrada</p>
              <p className="text-muted-foreground/70 mt-1 text-sm">
                Inicie um novo mês clicando em "Nova Escala Mensal"
              </p>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  )
}
