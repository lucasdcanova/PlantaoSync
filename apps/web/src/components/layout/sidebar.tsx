'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Users, MapPin,
  BarChart3, DollarSign, Settings, CreditCard,
  ChevronLeft, ChevronRight, Bell, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const navItems = [
  { href: '/overview',      label: 'Visão Geral',     icon: LayoutDashboard },
  { href: '/schedules',     label: 'Escalas',         icon: Calendar },
  { href: '/professionals', label: 'Profissionais',   icon: Users },
  { href: '/locations',     label: 'Locais',          icon: MapPin },
  { href: '/reports',       label: 'Relatórios',      icon: BarChart3 },
  { href: '/finances',      label: 'Financeiro',      icon: DollarSign },
]

const bottomItems = [
  { href: '/settings',      label: 'Configurações',   icon: Settings },
  { href: '/subscription',  label: 'Plano',           icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 256 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="relative flex h-screen flex-col border-r border-border bg-card"
        style={{ flexShrink: 0 }}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-brand">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="font-display text-base font-semibold text-foreground">
                  AgendaPlantão
                </span>
              </motion.div>
            )}
            {sidebarCollapsed && (
              <motion.div
                key="logo-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-brand"
              >
                <Calendar className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-2 py-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActive(item.href)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border px-2 py-2 space-y-0.5">
          {bottomItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={isActive(item.href)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>

        {/* User */}
        <div className="border-t border-border p-3">
          <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            <Avatar className="h-8 w-8 ring-2 ring-brand-100 dark:ring-brand-900">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-brand-100 text-brand-700 text-xs font-semibold">
                {getInitials(user?.name ?? 'U')}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'absolute -right-3 top-20 flex h-6 w-6 items-center justify-center',
            'rounded-full border border-border bg-card shadow-card',
            'text-muted-foreground transition-colors hover:text-foreground',
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </motion.aside>
    </TooltipProvider>
  )
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
}: {
  href: string
  label: string
  icon: React.ElementType
  isActive: boolean
  collapsed: boolean
}) {
  const content = (
    <Link
      href={href}
      className={cn(
        'relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium',
        'transition-all duration-150',
        isActive
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        collapsed && 'justify-center px-0',
      )}
    >
      {isActive && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 rounded-lg bg-brand-50 dark:bg-brand-900/30"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      <Icon className={cn('relative h-4 w-4 shrink-0', isActive && 'text-brand-600')} />
      {!collapsed && <span className="relative">{label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return content
}
