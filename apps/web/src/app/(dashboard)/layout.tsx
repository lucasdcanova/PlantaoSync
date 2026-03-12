'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  LayoutDashboard,
  MapPin,
  Users,
  BarChart3,
  CreditCard,
  LogOut,
  Settings,
} from 'lucide-react'
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
import { DashboardPreloader } from '@/components/dashboard/dashboard-preloader'
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
  const { user, accessToken, isAuthenticated, hasHydrated, logout } = useAuthStore()
  const institution = useInstitutionStore()
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const [logoAnimating, setLogoAnimating] = useState(false)
  const orgName = institution.name || user?.organization?.name || 'Hospital'
  const canAccessDashboard =
    isAuthenticated && Boolean(accessToken) && Boolean(user) && (user?.role === 'ADMIN' || user?.role === 'MANAGER')

  useEffect(() => {
    if (!hasHydrated) return
    if (!canAccessDashboard) {
      router.replace('/login')
    }
  }, [canAccessDashboard, hasHydrated, router])

  const handleLogoTap = useCallback(() => {
    if (logoAnimating) return
    setLogoAnimating(true)
    setTimeout(() => setLogoAnimating(false), 600)
  }, [logoAnimating])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleOpenInstitution = () => {
    router.push('/institution')
  }

  if (!hasHydrated || !canAccessDashboard) {
    return null
  }

  return (
    <div className="bg-background relative flex h-[100dvh] min-h-[100dvh] overflow-hidden lg:pt-[env(safe-area-inset-top)]">
      <DashboardPreloader />
      <StatusBarSync color="#ffffff" />
      <Sidebar />
      <motion.div
        aria-hidden
        className="hidden shrink-0 lg:block"
        animate={{
          width: sidebarCollapsed
            ? DASHBOARD_SIDEBAR_COLLAPSED_WIDTH
            : DASHBOARD_SIDEBAR_EXPANDED_WIDTH,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
      />

      <main className="min-w-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
        {/* Mobile header — SOLID background, centered logo */}
        <header className="mobile-header-solid">
          <div className="mobile-header-inner">
            {/* Left: Institution logo + name */}
            <button
              type="button"
              onClick={handleOpenInstitution}
              className="hover:bg-accent/60 tap-feedback flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 text-left"
              aria-label="Abrir instituição"
            >
              <OrgAvatar name={orgName} logoUrl={institution.logoUrl} size="sm" />
              <div className="min-w-0">
                <p className="text-foreground max-w-[110px] truncate text-xs font-semibold leading-tight">
                  {orgName}
                </p>
                <p className="text-muted-foreground text-[10px] leading-tight">Gestão</p>
              </div>
            </button>

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

            {/* Right: shortcuts + logout */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => router.push('/settings')}
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Configurações</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => router.push('/subscription')}
              >
                <CreditCard className="h-4 w-4" />
                <span className="sr-only">Plano e assinatura</span>
              </Button>
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
