'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface BottomNavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface BottomNavProps {
  items: BottomNavItem[]
  isActive?: (href: string) => boolean
}

export function BottomNav({ items, isActive: customIsActive }: BottomNavProps) {
  const pathname = usePathname()

  const isActive =
    customIsActive ??
    ((href: string) => {
      // For root paths like /overview, /doctor, match exactly or with subpath
      if (href === '/doctor') return pathname === href
      return pathname === href || pathname.startsWith(`${href}/`)
    })

  return (
    <LayoutGroup>
      <nav className="bottom-nav lg:hidden">
        {items.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('bottom-nav-item-v2 tap-feedback', active && 'active')}
            >
              {/* Active indicator orb — animated between items */}
              <div className="bottom-nav-content-wrap">
                <AnimatePresence mode="wait">
                  {active && (
                    <motion.div
                      className="bottom-nav-active-orb"
                      layoutId="activeNavOrb"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 28,
                        mass: 0.8,
                      }}
                    />
                  )}
                </AnimatePresence>
                <motion.div
                  className="bottom-nav-inner pointer-events-none"
                  animate={{ scale: active ? 1.02 : 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.8 }}
                >
                  <Icon
                    className={cn(
                      'bottom-nav-icon-v2',
                      active ? 'text-white' : 'text-muted-foreground',
                    )}
                  />
                  <motion.span
                    className="bottom-nav-label-v2 whitespace-nowrap"
                    animate={{
                      color: active ? '#ffffff' : 'var(--color-text-muted)',
                      fontWeight: active ? 600 : 500,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              </div>
            </Link>
          )
        })}
      </nav>
    </LayoutGroup>
  )
}
