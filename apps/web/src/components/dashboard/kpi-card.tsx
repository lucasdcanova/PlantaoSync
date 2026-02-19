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
    icon:    'text-brand-600 dark:text-brand-400',
    bg:      'bg-brand-50 dark:bg-brand-900/20',
    trend:   'text-brand-600',
  },
  green: {
    icon:    'text-green-600 dark:text-green-400',
    bg:      'bg-green-50 dark:bg-green-900/20',
    trend:   'text-green-600',
  },
  amber: {
    icon:    'text-amber-600 dark:text-amber-400',
    bg:      'bg-amber-50 dark:bg-amber-900/20',
    trend:   'text-amber-600',
  },
  red: {
    icon:    'text-red-600 dark:text-red-400',
    bg:      'bg-red-50 dark:bg-red-900/20',
    trend:   'text-red-600',
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
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-36" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28, delay: index * 0.06 }}
      className="group rounded-xl border border-border bg-card p-5 shadow-card card-hover"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-110', colors.bg)}>
          <Icon className={cn('h-4 w-4', colors.icon)} />
        </div>
      </div>

      <div className="mt-3">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.06 + 0.1 }}
          className="font-display text-2xl font-bold text-foreground"
        >
          {value}
        </motion.span>
      </div>

      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span className={cn('text-xs font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      )}
    </motion.div>
  )
}
