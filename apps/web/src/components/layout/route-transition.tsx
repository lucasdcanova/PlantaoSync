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
        initial={{ opacity: 0, y: 14, scale: 0.996, filter: 'blur(6px)' }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transition: {
            y: { type: 'spring', stiffness: 290, damping: 30, mass: 0.65 },
            scale: { type: 'spring', stiffness: 290, damping: 30, mass: 0.65 },
            opacity: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
            filter: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
          },
        }}
        exit={{
          opacity: 0,
          y: -10,
          scale: 0.994,
          filter: 'blur(4px)',
          transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
        }}
        className={cn('route-transition-frame', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
