'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

export function HeroMotionBackground() {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const xSpring = useSpring(mouseX, { damping: 40, stiffness: 130, mass: 1 })
  const ySpring = useSpring(mouseY, { damping: 40, stiffness: 130, mass: 1 })

  useEffect(() => {
    if (shouldReduceMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)

      mouseX.set(Math.max(-1, Math.min(1, nx)))
      mouseY.set(Math.max(-1, Math.min(1, ny)))
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY, shouldReduceMotion])

  const xSoft = useTransform(xSpring, [-1, 1], [60, -60])
  const ySoft = useTransform(ySpring, [-1, 1], [42, -42])
  const xMid = useTransform(xSpring, [-1, 1], [-86, 86])
  const yMid = useTransform(ySpring, [-1, 1], [-66, 66])

  if (shouldReduceMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_18%_12%,rgba(78,205,196,0.22),transparent_44%),radial-gradient(900px_circle_at_85%_18%,rgba(43,181,171,0.16),transparent_40%),linear-gradient(150deg,#f6fbfb_0%,#f8faff_44%,#eef6f5_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_82%_68%_at_50%_38%,#000_58%,transparent_100%)]" />
      </div>
    )
  }

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_18%_12%,rgba(78,205,196,0.22),transparent_44%),radial-gradient(900px_circle_at_85%_18%,rgba(43,181,171,0.16),transparent_40%),linear-gradient(150deg,#f6fbfb_0%,#f8faff_44%,#eef6f5_100%)]" />

      <motion.div
        style={{ x: xSoft, y: ySoft }}
        className="absolute left-[-16%] top-[-20%] h-[560px] w-[560px]"
      >
        <motion.div
          className="bg-brand-200/50 h-full w-full rounded-full blur-[90px]"
          animate={{ scale: [1, 1.08, 0.98, 1], opacity: [0.3, 0.52, 0.34, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div
        style={{ x: xMid, y: yMid }}
        className="absolute right-[-12%] top-[6%] h-[620px] w-[620px]"
      >
        <motion.div
          className="h-full w-full rounded-full bg-cyan-200/45 blur-[110px]"
          animate={{ scale: [1, 1.12, 0.96, 1], opacity: [0.24, 0.5, 0.27, 0.24] }}
          transition={{ duration: 11.4, repeat: Infinity, ease: 'easeInOut', delay: 0.25 }}
        />
      </motion.div>

      <motion.div
        style={{ x: xSoft, y: yMid }}
        className="absolute bottom-[-34%] left-[26%] h-[540px] w-[540px]"
      >
        <motion.div
          className="bg-teal-200/48 h-full w-full rounded-full blur-[100px]"
          animate={{ scale: [1, 1.15, 0.94, 1], opacity: [0.2, 0.46, 0.24, 0.2] }}
          transition={{ duration: 12.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-[54%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/55"
        animate={{ scale: [1, 1.07, 1], opacity: [0.28, 0.48, 0.28] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="border-brand-200/70 absolute left-1/2 top-[54%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        animate={{ scale: [1, 1.13, 1], opacity: [0.24, 0.5, 0.24] }}
        transition={{ duration: 4.9, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_82%_68%_at_50%_38%,#000_58%,transparent_100%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_56%_at_50%_48%,transparent_44%,rgba(248,250,252,0.7)_100%)]" />
    </div>
  )
}
