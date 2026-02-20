'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type ProgressPhase = 'idle' | 'loading' | 'finishing'

export function NavigationProgress() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)
  const [phase, setPhase] = useState<ProgressPhase>('idle')

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setPhase('loading')

    const finishTimer = window.setTimeout(() => setPhase('finishing'), 240)
    const resetTimer = window.setTimeout(() => setPhase('idle'), 540)

    return () => {
      window.clearTimeout(finishTimer)
      window.clearTimeout(resetTimer)
    }
  }, [pathname])

  const width = phase === 'loading' ? '78%' : phase === 'finishing' ? '100%' : '0%'

  return (
    <AnimatePresence>
      {phase !== 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 top-0 z-[120]"
        >
          <motion.div
            className="h-[3px] bg-gradient-to-r from-brand-400 via-brand-600 to-brand-500 shadow-[0_0_18px_rgba(43,181,171,0.55)]"
            initial={{ width: 0 }}
            animate={{ width }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30, mass: 0.55 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
