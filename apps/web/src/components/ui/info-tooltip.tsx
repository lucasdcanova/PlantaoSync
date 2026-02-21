'use client'

import { useState, useRef, useCallback } from 'react'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface InfoTooltipProps {
  title: string
  description: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function InfoTooltip({ title, description, side = 'top', className }: InfoTooltipProps) {
  // Only track touch-forced state.
  // When false → open=undefined → Radix handles hover natively (no conflict).
  // When true  → open=true    → forced open from mobile long-press.
  const [touchOpen, setTouchOpen] = useState(false)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelTimers = useCallback(() => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null }
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    cancelTimers()
    pressTimer.current = setTimeout(() => {
      setTouchOpen(true)
      closeTimer.current = setTimeout(() => setTouchOpen(false), 4000)
    }, 500)
  }, [cancelTimers])

  const handleTouchEnd = useCallback(() => {
    if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null }
  }, [])

  const handleTouchMove = useCallback(() => {
    cancelTimers()
    setTouchOpen(false)
  }, [cancelTimers])

  // Stable callback — only used to close when Radix wants to (e.g. Escape key)
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) setTouchOpen(false)
  }, [])

  return (
    <TooltipProvider delayDuration={250}>
      {/* open={undefined} when touchOpen=false → uncontrolled, Radix manages hover */}
      <Tooltip open={touchOpen || undefined} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Saiba mais: ${title}`}
            className={cn(
              'inline-flex shrink-0 items-center justify-center rounded-full p-0.5',
              'text-muted-foreground/35 transition-colors hover:text-muted-foreground/70',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              'touch-manipulation select-none',
              className,
            )}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
          >
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          sideOffset={6}
          className="max-w-[240px] border-border/80 bg-card p-0 shadow-elevated text-card-foreground"
        >
          <div className="space-y-1 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground">
              {title}
            </p>
            <p className="text-[12px] leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
