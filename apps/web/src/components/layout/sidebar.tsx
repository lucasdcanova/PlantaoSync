'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LogOut,
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
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()

  const isActive = (href: string) => pathname.startsWith(href)
  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 80 : 250 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="border-border bg-card relative hidden h-screen flex-col border-r lg:flex"
        style={{ flexShrink: 0 }}
      >
        <div className="flex h-16 items-center px-4">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5"
              >
                <div className="logo-container-light !shadow-subtle !rounded-lg !p-1.5">
                  <ProductLogo variant="mark" className="h-6 w-6" imageClassName="h-full w-full" />
                </div>
                <div>
                  <p className="text-foreground text-sm font-semibold tracking-tight">
                    {BRAND_SHORT_NAME}
                  </p>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                    Gestão
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="logo-mark"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="logo-container-light !shadow-subtle mx-auto !rounded-lg !p-1.5"
              >
                <ProductLogo variant="mark" className="h-6 w-6" imageClassName="h-full w-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-4">
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

        <div className="border-border space-y-0.5 border-t px-3 py-3">
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

        <div className="border-border border-t p-4">
          <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-brand-50 text-brand-700 text-[10px] font-semibold">
                {getInitials(user?.name ?? 'US')}
              </AvatarFallback>
            </Avatar>

            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">{user?.name}</p>
                <p className="text-muted-foreground truncate text-[10px]">{user?.email}</p>
              </div>
            )}
          </div>

          {sidebarCollapsed ? (
            <div className="mt-3 flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="tap-feedback text-muted-foreground hover:text-foreground hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-md"
                    aria-label="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sair</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="tap-feedback text-muted-foreground hover:text-foreground hover:bg-accent mt-3 inline-flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </button>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="border-border bg-card text-muted-foreground shadow-card hover:text-foreground absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border"
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
        'tap-feedback relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-all',
        collapsed && 'justify-center px-0',
        isActive
          ? 'bg-brand-50 text-brand-800 before:bg-brand-700 before:absolute before:left-0 before:top-1 before:h-8 before:w-[3px] before:rounded-r'
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
