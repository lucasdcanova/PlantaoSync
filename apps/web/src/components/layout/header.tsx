'use client'

import { motion } from 'framer-motion'
import { Bell, CreditCard, LogOut, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePathname, useRouter } from 'next/navigation'
import { ProductLogo } from '@/components/brand/product-logo'
import {
  DASHBOARD_SIDEBAR_COLLAPSED_WIDTH,
  DASHBOARD_SIDEBAR_EXPANDED_WIDTH,
} from '@/components/layout/sidebar'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const logout = useAuthStore((state) => state.logout)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const sidebarOffset = sidebarCollapsed
    ? DASHBOARD_SIDEBAR_COLLAPSED_WIDTH
    : DASHBOARD_SIDEBAR_EXPANDED_WIDTH

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <>
      <header className="desktop-shell-header hidden lg:block">
        <div className="desktop-shell-header__glow" />
        <div className="desktop-shell-header__notch" />

        <motion.div
          className="desktop-shell-header__logo"
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="desktop-shell-header__logo-orb">
            <ProductLogo
              variant="mark"
              className="desktop-shell-header__logo-mark"
              imageClassName="h-full w-full"
              priority
            />
          </div>
        </motion.div>

        <div
          className="desktop-shell-header__inner"
          style={{
            paddingLeft: `${sidebarOffset + 28}px`,
            paddingRight: '24px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 pr-6"
          >
            <div className="desktop-shell-header__eyebrow">
              <span className="desktop-shell-header__eyebrow-dot" />
              Painel operacional
            </div>

            <h1 className="font-display text-foreground truncate text-xl font-semibold tracking-tight xl:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-muted-foreground mt-1 truncate text-sm">{subtitle}</p>
            ) : null}
          </motion.div>

          <div className="desktop-shell-header__center-spacer" aria-hidden />

          <div className="flex shrink-0 items-center gap-2 xl:gap-3">
            <Badge className="border-brand-200 bg-brand-50 text-brand-800 hidden xl:inline-flex">
              Tempo real
            </Badge>

            <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-xl">
              <Bell className="h-4 w-4" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-status-warning absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full"
              />
            </Button>

            <Button
              variant={pathname === '/settings' ? 'default' : 'ghost'}
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configurações</span>
            </Button>

            <Button
              variant={pathname === '/subscription' ? 'default' : 'ghost'}
              size="icon"
              className="h-10 w-10 rounded-xl"
              onClick={() => router.push('/subscription')}
            >
              <CreditCard className="h-4 w-4" />
              <span className="sr-only">Plano e assinatura</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-10 w-10 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="hidden h-[118px] lg:block" />

      {/* Mobile: page title (smaller, below the main header) */}
      <div className="px-4 pt-3 lg:hidden">
        <h1 className="font-display text-foreground text-base font-semibold">{title}</h1>
        {subtitle ? <p className="text-muted-foreground text-[11px]">{subtitle}</p> : null}
      </div>
    </>
  )
}
