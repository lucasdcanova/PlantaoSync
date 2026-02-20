'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Calendar, MapPin, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { PageTransition, StaggerList, StaggerItem } from '@/components/shared/page-transition'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatDate, SHIFT_STATUS_CONFIG } from '@/lib/utils'
import { DEMO_SCHEDULES } from '@/lib/demo-data'
import Link from 'next/link'
import type { Schedule } from '@agendaplantao/shared'

function useSchedules() {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: async (): Promise<Schedule[]> => {
      return DEMO_SCHEDULES
    },
  })
}

export default function SchedulesPage() {
  const [search, setSearch] = useState('')
  const { data: schedules, isLoading } = useSchedules()

  const filtered = schedules?.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <Header title="Escalas" subtitle="Planeje cobertura por unidade e turno" />

      <PageTransition>
        <div className="p-6 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por mês, unidade ou setor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button className="bg-brand-600 hover:bg-brand-700 text-white shadow-brand gap-2">
              <Plus className="h-4 w-4" />
              Nova Escala Mensal
            </Button>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between mb-3">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <StaggerList className="space-y-3">
              <AnimatePresence>
                {filtered?.map((schedule) => {
                  const statusConfig = SHIFT_STATUS_CONFIG[schedule.status]
                  return (
                    <StaggerItem key={schedule.id}>
                      <Link href={`/schedules/${schedule.id}`}>
                        <motion.div
                          layout
                          whileHover={{ y: -2, transition: { duration: 0.15 } }}
                          className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-elevated"
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="min-w-0">
                              <h3 className="font-display truncate font-semibold text-foreground transition-colors group-hover:text-brand-600">
                                {schedule.title}
                              </h3>
                              {schedule.description && (
                                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                  {schedule.description}
                                </p>
                              )}
                            </div>
                            <Badge className={cn('shrink-0 text-xs', statusConfig.color)}>
                              {statusConfig.label}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            {schedule.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-brand-400" />
                                {schedule.location.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-brand-400" />
                              {formatDate(schedule.startDate)} – {formatDate(schedule.endDate)}
                            </span>
                            {schedule.publishedAt && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                Publicada em {formatDate(schedule.publishedAt)}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </Link>
                    </StaggerItem>
                  )
                })}
              </AnimatePresence>
            </StaggerList>
          )}

          {!isLoading && filtered?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center"
            >
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground font-medium">Nenhuma escala encontrada</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Inicie um novo mês clicando em \"Nova Escala Mensal\"
              </p>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  )
}
