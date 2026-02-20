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
  const [open, setOpen] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }, [])

  const handleMouseEnter = useCallback(() => { clearTimers(); setOpen(true) }, [clearTimers])
  const handleMouseLeave = useCallback(() => { clearTimers(); setOpen(false) }, [clearTimers])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    clearTimers()
    longPressTimer.current = setTimeout(() => {
      setOpen(true)
      closeTimer.current = setTimeout(() => setOpen(false), 4000)
    }, 500)
  }, [clearTimers])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
  }, [])

  const handleTouchMove = useCallback(() => { clearTimers(); setOpen(false) }, [clearTimers])

  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={setOpen}>
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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
          onPointerDownOutside={() => setOpen(false)}
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
