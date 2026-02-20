'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, LayoutDashboard, MapPin, Users, BarChart3, LogOut } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav, type BottomNavItem } from '@/components/layout/bottom-nav'
import { StatusBarSync } from '@/components/layout/status-bar-sync'
import { ProductLogo } from '@/components/brand/product-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { cn, getInitials } from '@/lib/utils'

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
  const [logoAnimating, setLogoAnimating] = useState(false)

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
    <div className="bg-background flex min-h-[100dvh] overflow-hidden">
      <StatusBarSync color="#ffffff" />
      <Sidebar />

      <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
        {/* Mobile header — SOLID background, centered logo */}
        <header className="mobile-header-solid">
          <div className="mobile-header-inner">
            {/* Left: Avatar + greeting */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-brand-50 text-brand-700 text-[10px] font-semibold">
                  {getInitials(user?.name ?? 'US')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-foreground text-xs font-medium leading-tight">Gestão</p>
                <p className="text-muted-foreground text-[10px] leading-tight">
                  {user?.organization?.name ?? 'Hospital'}
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
                <ProductLogo variant="mark" className="h-7 w-7" imageClassName="h-full w-full" />
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
