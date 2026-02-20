'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export function HeroMotionBackground() {
  const ref = useRef<HTMLDivElement>(null)
  
  // Mouse position values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth springs for cursor movement - even more fluid and dramatic
  const springConfig = { damping: 30, stiffness: 100, mass: 1.2 }
  const xSpring = useSpring(mouseX, springConfig)
  const ySpring = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return
      
      const rect = ref.current.getBoundingClientRect()
      
      // Calculate cursor position relative to the center of the viewport
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
  const x1 = useTransform(xSpring, [-1, 1], [150, -150])
  const y1 = useTransform(ySpring, [-1, 1], [150, -150])
  
  // Layer 2 moves with cursor creating strong depth
  const x2 = useTransform(xSpring, [-1, 1], [-120, 120])
  const y2 = useTransform(ySpring, [-1, 1], [-120, 120])
  
  // Layer 3 moves faster and further opposite
  const x3 = useTransform(xSpring, [-1, 1], [220, -220])
  const y3 = useTransform(ySpring, [-1, 1], [220, -220])

  // Layer 4 (Particles) fastest movement
  const x4 = useTransform(xSpring, [-1, 1], [-280, 280])
  const y4 = useTransform(ySpring, [-1, 1], [-280, 280])

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden bg-background">
      {/* Background base layer - elegant cool gray gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200/50 via-background to-zinc-200/40 dark:from-slate-900/40 dark:via-background dark:to-zinc-900/20" />

      {/* Animated abstract organic shape 1 - Top Left */}
      <motion.div 
        style={{ x: x1, y: y1 }}
        className="absolute left-[0%] top-[-10%] h-[800px] w-[800px] -translate-x-1/2"
      >
        <motion.div
          animate={{
            scale: [1, 1.3, 0.9, 1],
            rotate: [0, 120, 240, 360],
            borderRadius: [
              "40% 60% 70% 30% / 40% 50% 60% 50%",
              "60% 40% 30% 70% / 50% 60% 40% 50%",
              "50% 50% 60% 40% / 40% 50% 70% 30%",
              "40% 60% 70% 30% / 40% 50% 60% 50%"
            ],
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-full w-full bg-slate-300/60 mix-blend-multiply blur-[100px] dark:mix-blend-screen dark:bg-slate-700/40"
        />
      </motion.div>

      {/* Animated abstract organic shape 2 - Center Right */}
      <motion.div 
        style={{ x: x2, y: y2 }}
        className="absolute right-[-15%] top-[10%] h-[900px] w-[900px]"
      >
        <motion.div
          animate={{
            scale: [0.9, 1.2, 1.1, 0.9],
            rotate: [360, 240, 120, 0],
            borderRadius: [
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "30% 70% 60% 40% / 40% 60% 50% 60%",
              "50% 50% 40% 60% / 60% 40% 50% 50%",
              "60% 40% 30% 70% / 60% 30% 70% 40%"
            ],
            x: [0, -120, 80, 0],
            y: [0, 100, -70, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-full w-full bg-zinc-300/50 mix-blend-multiply blur-[120px] dark:mix-blend-screen dark:bg-zinc-700/30"
        />
      </motion.div>

      {/* Animated abstract organic shape 3 - Bottom Left */}
      <motion.div 
        style={{ x: x3, y: y3 }}
        className="absolute bottom-[-20%] left-[10%] h-[1000px] w-[1000px]"
      >
        <motion.div
          animate={{
            scale: [1.1, 0.9, 1.2, 1.1],
            rotate: [0, -120, -240, -360],
            borderRadius: [
              "30% 70% 70% 30% / 30% 30% 70% 70%",
              "50% 50% 30% 70% / 50% 40% 60% 50%",
              "70% 30% 50% 50% / 30% 60% 40% 70%",
              "30% 70% 70% 30% / 30% 30% 70% 70%"
            ],
            x: [0, 80, -100, 0],
            y: [0, -120, 80, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-full w-full bg-gray-200/70 mix-blend-multiply blur-[130px] dark:mix-blend-screen dark:bg-gray-800/30"
        />
      </motion.div>

      {/* Accent glow - Center/Bottom for extra pop */}
      <motion.div 
        style={{ x: x1, y: y2 }}
        className="absolute bottom-[10%] right-[30%] h-[600px] w-[600px]"
      >
        <motion.div
          animate={{
            scale: [1, 1.4, 0.8, 1],
            opacity: [0.4, 0.7, 0.4],
            rotate: [0, 90, 0],
            x: [0, 60, -60, 0],
            y: [0, -60, 60, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="h-full w-full bg-slate-400/40 mix-blend-overlay blur-[110px] rounded-full dark:mix-blend-screen dark:bg-slate-600/40"
        />
      </motion.div>

      {/* Dynamic Floating Particles */}
      <motion.div style={{ x: x4, y: y4 }} className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0, 40, 0],
              x: [0, 30, 0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
            className="absolute rounded-full bg-slate-400/60 blur-[2px] dark:bg-slate-500/60"
            style={{
              top: `${15 + (i * 12)}%`,
              left: `${10 + (i * 10) + (i % 2 === 0 ? 30 : -20)}%`,
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
            }}
          />
        ))}
      </motion.div>
      
      {/* Grid overlay to give it a tech/SaaS feel and structure - made more visible */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808020_1px,transparent_1px),linear-gradient(to_bottom,#80808020_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_50%,transparent_100%)]" />
      
      {/* Stronger Vignette effect for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_10%,rgba(255,255,255,0.85)_100%)] dark:bg-[radial-gradient(circle_at_50%_50%,transparent_10%,rgba(0,0,0,0.85)_100%)]" />
    </div>
  )
}
