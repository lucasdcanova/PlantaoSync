'use client'

import { useEffect, useCallback, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Activity, CalendarDays, CalendarPlus2, Clock3, LogOut, Repeat2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ProductLogo } from '@/components/brand/product-logo'
import { BottomNav, type BottomNavItem } from '@/components/layout/bottom-nav'
import {
  DOCTOR_SIDEBAR_COLLAPSED_WIDTH,
  DOCTOR_SIDEBAR_EXPANDED_WIDTH,
  DoctorSidebar,
} from '@/components/layout/doctor-sidebar'
import { RouteTransition } from '@/components/layout/route-transition'
import { StatusBarSync } from '@/components/layout/status-bar-sync'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'

// Bottom nav shows max 5 items on mobile
const mobileNavItems: BottomNavItem[] = [
  { href: '/doctor', label: 'Resumo', icon: Activity },
  { href: '/doctor/available', label: 'Disponíveis', icon: CalendarPlus2 },
  { href: '/doctor/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/doctor/history', label: 'Histórico', icon: Clock3 },
  { href: '/doctor/swaps', label: 'Trocas', icon: Repeat2 },
]

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const [logoAnimating, setLogoAnimating] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }
    if (user.role !== 'PROFESSIONAL') {
      router.replace('/overview')
    }
  }, [isAuthenticated, router, user])

  const handleLogoTap = useCallback(() => {
    if (logoAnimating) return
    setLogoAnimating(true)
    setTimeout(() => setLogoAnimating(false), 600)
  }, [logoAnimating])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isAuthenticated || !user || user.role !== 'PROFESSIONAL') return null

  const isActive = (href: string) =>
    pathname === href || (href !== '/doctor' && pathname.startsWith(`${href}/`))

  return (
    <div className="bg-background min-h-[100dvh]">
      <StatusBarSync color="#ffffff" />
      <div className="flex h-[100dvh] min-h-[100dvh] overflow-hidden">
        <DoctorSidebar />
        <motion.div
          aria-hidden
          className="hidden shrink-0 lg:block"
          animate={{
            width: sidebarCollapsed ? DOCTOR_SIDEBAR_COLLAPSED_WIDTH : DOCTOR_SIDEBAR_EXPANDED_WIDTH,
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
        />

        {/* Main content */}
        <main className="min-w-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
          {/* Mobile header — SOLID background, centered logo */}
          <header className="mobile-header-solid">
            <div className="mobile-header-inner">
              {/* Left: Avatar + greeting */}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="bg-brand-50 text-brand-700 text-[10px] font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="lg:hidden">
                  <p className="text-foreground text-xs font-medium leading-tight">Olá,</p>
                  <p className="text-muted-foreground text-[10px] leading-tight">
                    {user.name?.split(' ')[0]}
                  </p>
                </div>
              </div>

              {/* Center: Logo with notch */}
              <div className="header-logo-center">
                <motion.div
                  className={cn('header-logo-orb', logoAnimating && 'logo-animating')}
                  onClick={handleLogoTap}
                  whileTap={{ scale: 0.92 }}
                >
                  <ProductLogo
                    variant="mark"
                    className="header-logo-mark"
                    imageClassName="h-full w-full"
                  />
                </motion.div>
              </div>

              {/* Right: Logout */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Sair</span>
                </Button>
              </div>
            </div>
            {/* Notch visual cove */}
            <div className="mobile-header-notch" />
          </header>

          <div className="mobile-header-spacer" />
          <RouteTransition className="p-4 sm:p-6">{children}</RouteTransition>
        </main>
      </div>

      {/* Mobile bottom navigation — animated active orb */}
      <BottomNav items={mobileNavItems} isActive={isActive} />
    </div>
  )
}
