'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ProductLogo } from '@/components/brand/product-logo'
import { BRAND_SHORT_NAME } from '@/lib/brand'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'

const navItems = [
  { href: '/overview', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedules', label: 'Escalas', icon: Calendar },
  { href: '/professionals', label: 'Equipe', icon: Users },
  { href: '/locations', label: 'Setores', icon: MapPin },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
  { href: '/finances', label: 'Financeiro', icon: DollarSign },
]

const bottomItems = [
  { href: '/settings', label: 'Configurações', icon: Settings },
  { href: '/subscription', label: 'Plano', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 84 : 260 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="relative hidden h-screen flex-col border-r border-border bg-card lg:flex"
        style={{ flexShrink: 0 }}
      >
        <div className="flex h-20 items-center justify-between px-4">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded-md bg-background p-1 shadow-card">
                  <ProductLogo variant="mark" className="h-full w-full" imageClassName="h-full w-full" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide text-foreground">{BRAND_SHORT_NAME}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Operação clínica</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="logo-mark"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="mx-auto h-9 w-9 rounded-md bg-background p-1 shadow-card"
              >
                <ProductLogo variant="mark" className="h-full w-full" imageClassName="h-full w-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive(item.href)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        <div className="space-y-1 border-t border-border px-3 py-3">
          {bottomItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive(item.href)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </div>

        <div className="border-t border-border p-3">
          <div className={cn('flex items-start gap-3', sidebarCollapsed && 'justify-center')}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-brand-50 text-brand-700 text-xs font-semibold">
                {getInitials(user?.name ?? 'US')}
              </AvatarFallback>
            </Avatar>

            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                <div className="mt-2">
                  <Badge className="border-brand-200 bg-brand-50 text-brand-800">Meu hospital</Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-24 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-card hover:text-foreground"
        >
          {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
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
        'relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium',
        collapsed && 'justify-center px-0',
        isActive
          ? 'bg-brand-50 text-brand-800 before:absolute before:left-0 before:top-1 before:h-8 before:w-[3px] before:rounded-r before:bg-brand-700'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-brand-700')} />
      {!collapsed && <span>{label}</span>}
    </Link>
  )

  if (!collapsed) return content

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}
