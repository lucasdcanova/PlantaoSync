'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: 'brand' | 'green' | 'amber' | 'red'
  loading?: boolean
  index?: number
}

const colorMap = {
  brand: {
    icon: 'text-brand-700 dark:text-brand-300',
    bg: 'bg-brand-50 dark:bg-brand-900/20',
    trend: 'text-brand-700',
  },
  green: {
    icon: 'text-status-success',
    bg: 'bg-green-50 dark:bg-green-900/20',
    trend: 'text-status-success',
  },
  amber: {
    icon: 'text-status-warning',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    trend: 'text-status-warning',
  },
  red: {
    icon: 'text-status-urgent',
    bg: 'bg-red-50 dark:bg-red-900/20',
    trend: 'text-status-urgent',
  },
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'brand',
  loading = false,
  index = 0,
}: KpiCardProps) {
  const colors = colorMap[color]

  if (loading) {
    return (
      <div className="card-base rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-2 w-32" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.05 }}
      className="group card-base card-hover p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">{title}</p>
          <div className="mt-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.1 }}
              className="font-display text-2xl font-bold tracking-tight text-foreground"
            >
              {value}
            </motion.span>
          </div>
        </div>
        <div className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg border border-border/40 transition-shadow',
          colors.bg
        )}>
          <Icon className={cn('h-3.5 w-3.5', colors.icon)} />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-background border border-border/60', trend.value >= 0 ? 'text-status-success' : 'text-status-urgent')}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] text-muted-foreground italic font-medium">{subtitle}</span>
          )}
        </div>
      )}
    </motion.div>
  )
}
