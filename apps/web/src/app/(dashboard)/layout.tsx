'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, LayoutDashboard, MapPin, Users, BarChart3, LogOut } from 'lucide-react'
import {
  DASHBOARD_SIDEBAR_COLLAPSED_WIDTH,
  DASHBOARD_SIDEBAR_EXPANDED_WIDTH,
  Sidebar,
} from '@/components/layout/sidebar'
import { BottomNav, type BottomNavItem } from '@/components/layout/bottom-nav'
import { StatusBarSync } from '@/components/layout/status-bar-sync'
import { ProductLogo } from '@/components/brand/product-logo'
import { OrgAvatar } from '@/components/ui/org-avatar'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { useInstitutionStore } from '@/store/institution.store'
import { useUIStore } from '@/store/ui.store'
import { cn } from '@/lib/utils'

const mobileNavItems: BottomNavItem[] = [
  { href: '/overview', label: 'Início', icon: LayoutDashboard },
  { href: '/schedules', label: 'Escalas', icon: Calendar },
  { href: '/professionals', label: 'Equipe', icon: Users },
  { href: '/locations', label: 'Setores', icon: MapPin },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const institution = useInstitutionStore()
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const [logoAnimating, setLogoAnimating] = useState(false)
  const orgName = institution.name || user?.organization?.name || 'Hospital'

  const handleLogoTap = useCallback(() => {
    if (logoAnimating) return
    setLogoAnimating(true)
    setTimeout(() => setLogoAnimating(false), 600)
  }, [logoAnimating])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="bg-background relative flex h-[100dvh] min-h-[100dvh] overflow-hidden">
      <StatusBarSync color="#ffffff" />
      <Sidebar />
      <motion.div
        aria-hidden
        className="hidden shrink-0 lg:block"
        animate={{
          width: sidebarCollapsed ? DASHBOARD_SIDEBAR_COLLAPSED_WIDTH : DASHBOARD_SIDEBAR_EXPANDED_WIDTH,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
      />

      <main className="min-w-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
        {/* Mobile header — SOLID background, centered logo */}
        <header className="mobile-header-solid">
          <div className="mobile-header-inner">
            {/* Left: Institution logo + name */}
            <div className="flex items-center gap-2 min-w-0">
              <OrgAvatar name={orgName} logoUrl={institution.logoUrl} size="sm" />
              <div className="min-w-0">
                <p className="text-foreground text-xs font-semibold leading-tight truncate max-w-[110px]">
                  {orgName}
                </p>
                <p className="text-muted-foreground text-[10px] leading-tight">Gestão</p>
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

            {/* Right: logout */}
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

        <div className="mx-auto w-full max-w-[1680px]">{children}</div>
      </main>

      {/* Mobile bottom navigation — animated active orb */}
      <BottomNav items={mobileNavItems} />
    </div>
  )
}
