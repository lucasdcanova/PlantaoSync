'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock3, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { cn } from '@/lib/utils'

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay()
}

export default function DoctorCalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1)) // Feb 2026
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const myShifts = useDoctorDemoStore((state) => state.myShifts)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    // Map shifts to days
    const shiftsByDay = useMemo(() => {
        const map = new Map<number, typeof myShifts>()
        myShifts.forEach((shift) => {
            const d = new Date(shift.date)
            if (d.getFullYear() === year && d.getMonth() === month) {
                const day = d.getDate()
                const existing = map.get(day) || []
                map.set(day, [...existing, shift])
            }
        })
        return map
    }, [myShifts, year, month])

    const today = new Date()
    const isToday = (day: number) =>
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

    const prevMonth = () => setCurrentDate(new Date(year, month - 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1))

    const selectedShifts = selectedDay ? shiftsByDay.get(selectedDay) || [] : []

    // Generate calendar grid
    const calendarDays: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) calendarDays.push(null)
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    Meu Calendário
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Visualize seus plantões confirmados e disponíveis
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Calendar */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-base overflow-hidden"
                >
                    {/* Month navigation */}
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h2 className="font-display text-base font-semibold text-foreground">
                            {MONTHS[month]} <span className="text-muted-foreground font-normal">{year}</span>
                        </h2>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 border-b border-border/50">
                        {WEEKDAYS.map((day) => (
                            <div key={day} className="py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, i) => {
                            if (day === null) {
                                return <div key={`empty-${i}`} className="aspect-square border-b border-r border-border/30" />
                            }

                            const hasShifts = shiftsByDay.has(day)
                            const shiftCount = shiftsByDay.get(day)?.length || 0
                            const isSelected = selectedDay === day

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                                    className={cn(
                                        'relative aspect-square border-b border-r border-border/30 p-1 transition-colors hover:bg-accent/50',
                                        isSelected && 'bg-brand-50 dark:bg-brand-900/20',
                                        isToday(day) && !isSelected && 'bg-accent/30',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                                            isToday(day) && 'bg-brand-700 text-white font-semibold',
                                            isSelected && !isToday(day) && 'bg-brand-100 text-brand-800 font-medium dark:bg-brand-900/40 dark:text-brand-300',
                                            !isToday(day) && !isSelected && 'text-foreground',
                                        )}
                                    >
                                        {day}
                                    </span>

                                    {/* Shift indicators */}
                                    {hasShifts && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                            {Array.from({ length: Math.min(shiftCount, 3) }).map((_, j) => (
                                                <span
                                                    key={j}
                                                    className={cn(
                                                        'h-1 w-1 rounded-full',
                                                        j === 0 && 'bg-brand-500',
                                                        j === 1 && 'bg-status-success',
                                                        j === 2 && 'bg-status-warning',
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-4 border-t border-border px-5 py-3">
                        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-brand-500" />
                            Confirmado
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-status-success" />
                            Concluído
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-status-warning" />
                            Pendente
                        </span>
                    </div>
                </motion.div>

                {/* Day detail panel */}
                <div className="space-y-4">
                    <AnimatePresence mode="wait">
                        {selectedDay ? (
                            <motion.div
                                key={selectedDay}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3"
                            >
                                <div className="flex items-baseline gap-2">
                                    <h3 className="font-display text-3xl font-bold text-foreground">{selectedDay}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {MONTHS[month].slice(0, 3)} {year}
                                    </p>
                                </div>

                                {selectedShifts.length > 0 ? (
                                    selectedShifts.map((shift) => (
                                        <motion.article
                                            key={shift.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="card-base p-4"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{shift.sectorName}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{shift.specialty}</p>
                                                </div>
                                                <Badge className={cn(
                                                    'text-[10px]',
                                                    shift.status === 'CONFIRMADO'
                                                        ? 'border-brand-200 bg-brand-50 text-brand-700'
                                                        : 'border-green-200 bg-green-50 text-green-700',
                                                )}>
                                                    {shift.status}
                                                </Badge>
                                            </div>
                                            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock3 className="h-3.5 w-3.5 text-brand-600" />
                                                    {shift.startTime} – {shift.endTime}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5 text-brand-600" />
                                                    {shift.sectorName}
                                                </span>
                                            </div>
                                        </motion.article>
                                    ))
                                ) : (
                                    <div className="card-base p-6 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Nenhum plantão neste dia
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="card-base p-6 text-center"
                            >
                                <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center">
                                    <CalendarIcon className="h-5 w-5 text-brand-600" />
                                </div>
                                <p className="text-sm font-medium text-foreground">Selecione um dia</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Toque em um dia para ver detalhes
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Monthly summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card-base p-5"
                    >
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
                            Resumo do mês
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-background p-3 text-center">
                                <p className="font-display text-xl font-bold text-foreground">
                                    {Array.from(shiftsByDay.values()).flat().length}
                                </p>
                                <p className="text-[11px] text-muted-foreground">plantões</p>
                            </div>
                            <div className="rounded-lg bg-background p-3 text-center">
                                <p className="font-display text-xl font-bold text-foreground">
                                    {shiftsByDay.size}
                                </p>
                                <p className="text-[11px] text-muted-foreground">dias ativos</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

function CalendarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
    )
}
