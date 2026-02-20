'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface RouteTransitionProps {
  children: React.ReactNode
  className?: string
}

export function RouteTransition({ children, className }: RouteTransitionProps) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12, scale: 0.997 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.996 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className={cn('route-transition-frame', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
