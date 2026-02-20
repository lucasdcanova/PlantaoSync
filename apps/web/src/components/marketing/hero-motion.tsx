'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export function HeroMotionBackground() {
  const ref = useRef<HTMLDivElement>(null)
  
  // Mouse position values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth springs for cursor movement - made more responsive and fluid
  const springConfig = { damping: 40, stiffness: 150, mass: 0.8 }
  const xSpring = useSpring(mouseX, springConfig)
  const ySpring = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return
      
      const rect = ref.current.getBoundingClientRect()
      
      // Calculate cursor position relative to the center of the viewport
      // Values will range from -1 to 1 roughly
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const xPos = (e.clientX - centerX) / (rect.width / 2)
      const yPos = (e.clientY - centerY) / (rect.height / 2)
      
      mouseX.set(xPos)
      mouseY.set(yPos)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mouseX, mouseY])

  // Enhanced parallax shifts for different layers
  // Layer 1 moves noticeably opposite to cursor
  const x1 = useTransform(xSpring, [-1, 1], [100, -100])
  const y1 = useTransform(ySpring, [-1, 1], [100, -100])
  
  // Layer 2 moves with cursor creating strong depth
  const x2 = useTransform(xSpring, [-1, 1], [-80, 80])
  const y2 = useTransform(ySpring, [-1, 1], [-80, 80])
  
  // Layer 3 moves faster and further opposite
  const x3 = useTransform(xSpring, [-1, 1], [140, -140])
  const y3 = useTransform(ySpring, [-1, 1], [140, -140])

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden bg-background">
      {/* Background base layer - subtle wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-50/40 via-transparent to-brand-100/10 dark:from-brand-900/20" />

      {/* Animated abstract organic shape 1 - Top Left */}
      <motion.div 
        style={{ x: x1, y: y1 }}
        className="absolute left-[10%] top-[5%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 0.9, 1],
            rotate: [0, 90, 180, 360],
            borderRadius: [
              "40% 60% 70% 30% / 40% 50% 60% 50%",
              "60% 40% 30% 70% / 50% 60% 40% 50%",
              "50% 50% 60% 40% / 40% 50% 70% 30%",
              "40% 60% 70% 30% / 40% 50% 60% 50%"
            ],
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-full w-full bg-brand-200/50 mix-blend-multiply blur-[80px] dark:mix-blend-screen dark:bg-brand-500/20"
        />
      </motion.div>

      {/* Animated abstract organic shape 2 - Center Right */}
      <motion.div 
        style={{ x: x2, y: y2 }}
        className="absolute right-[-10%] top-[30%] h-[500px] w-[500px] -translate-y-1/2 translate-x-1/4"
      >
        <motion.div
          animate={{
            scale: [0.9, 1.1, 1.2, 0.9],
            rotate: [360, 180, 90, 0],
            borderRadius: [
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "30% 70% 60% 40% / 40% 60% 50% 60%",
              "50% 50% 40% 60% / 60% 40% 50% 50%",
              "60% 40% 30% 70% / 60% 30% 70% 40%"
            ],
            x: [0, -40, 30, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-full w-full bg-brand-300/40 mix-blend-multiply blur-[90px] dark:mix-blend-screen dark:bg-brand-600/20"
        />
      </motion.div>

      {/* Animated abstract organic shape 3 - Bottom Left */}
      <motion.div 
        style={{ x: x3, y: y3 }}
        className="absolute bottom-[-20%] left-[20%] h-[700px] w-[700px] translate-y-1/4"
      >
        <motion.div
          animate={{
            scale: [1.1, 0.9, 1.15, 1.1],
            rotate: [0, -90, -180, -360],
            borderRadius: [
              "30% 70% 70% 30% / 30% 30% 70% 70%",
              "50% 50% 30% 70% / 50% 40% 60% 50%",
              "70% 30% 50% 50% / 30% 60% 40% 70%",
              "30% 70% 70% 30% / 30% 30% 70% 70%"
            ],
            x: [0, 50, -50, 0],
            y: [0, -30, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-full w-full bg-brand-400/30 mix-blend-multiply blur-[100px] dark:mix-blend-screen dark:bg-brand-700/20"
        />
      </motion.div>
      
      {/* Grid overlay to give it a tech/SaaS feel and structure */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_100%_80%_at_50%_0%,#000_60%,transparent_100%)]" />
      
      {/* Vignette effect for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(255,255,255,0.4)_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,transparent_20%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  )
}
