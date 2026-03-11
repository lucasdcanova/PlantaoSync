'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Building2,
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
import { OrgAvatar } from '@/components/ui/org-avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useInstitutionStore } from '@/store/institution.store'

export const DASHBOARD_SIDEBAR_COLLAPSED_WIDTH = 88
export const DASHBOARD_SIDEBAR_EXPANDED_WIDTH = 272

const navItems = [
  { href: '/overview', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedules', label: 'Escalas', icon: Calendar },
  { href: '/professionals', label: 'Equipe', icon: Users },
  { href: '/locations', label: 'Setores', icon: MapPin },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
  { href: '/finances', label: 'Financeiro', icon: DollarSign },
]

const bottomItems = [
  { href: '/institution', label: 'Instituição', icon: Building2 },
  { href: '/settings', label: 'Configurações', icon: Settings },
  { href: '/subscription', label: 'Plano', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const institution = useInstitutionStore()

  const isActive = (href: string) => pathname.startsWith(href)
  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const orgName = institution.name || user?.organization?.name || 'Hospital'

  return (
    <TooltipProvider delayDuration={0}>
      <>
        <motion.aside
          animate={{
            width: sidebarCollapsed
              ? DASHBOARD_SIDEBAR_COLLAPSED_WIDTH
              : DASHBOARD_SIDEBAR_EXPANDED_WIDTH,
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.92 }}
          className="border-border/80 bg-card/92 fixed inset-y-0 left-0 z-40 hidden h-[100dvh] flex-col border-r shadow-[0_22px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:flex lg:pt-[calc(env(safe-area-inset-top)+6.5rem)]"
        >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.10),transparent_65%)]" />

        <div
          className={cn(
            'relative flex min-h-[76px] items-center px-4',
            sidebarCollapsed && 'justify-center',
          )}
        >
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="logo-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex min-w-0 items-center gap-2.5"
              >
                <OrgAvatar name={orgName} logoUrl={institution.logoUrl} size="sm" />
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-semibold tracking-tight truncate">
                    {orgName}
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
                className="mx-auto"
              >
                <OrgAvatar name={orgName} logoUrl={institution.logoUrl} size="sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="relative flex-1 space-y-1 px-3 py-4">
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

        <div className="border-border/80 space-y-1 border-t px-3 py-3">
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

        <div className="border-border/80 border-t p-4">
          <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-brand-50 text-brand-700 text-[10px] font-semibold">
                {getInitials(user?.name ?? 'US')}
              </AvatarFallback>
            </Avatar>

            <AnimatePresence initial={false}>
              {!sidebarCollapsed && (
                <motion.div
                  key="user-meta"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16 }}
                  className="min-w-0 flex-1"
                >
                  <p className="text-foreground truncate text-sm font-medium">{user?.name}</p>
                  <p className="text-muted-foreground truncate text-[10px]">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {sidebarCollapsed ? (
              <motion.div
                key="logout-icon"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="mt-3 flex justify-center"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="tap-feedback text-muted-foreground hover:text-foreground hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                      aria-label="Sair"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sair</TooltipContent>
                </Tooltip>
              </motion.div>
            ) : (
              <motion.button
                key="logout-button"
                type="button"
                onClick={handleLogout}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="tap-feedback text-muted-foreground hover:text-foreground hover:bg-accent mt-3 inline-flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        </motion.aside>

        <motion.button
          type="button"
          onClick={toggleSidebar}
          animate={{
            left:
              (sidebarCollapsed
                ? DASHBOARD_SIDEBAR_COLLAPSED_WIDTH
                : DASHBOARD_SIDEBAR_EXPANDED_WIDTH) - 26,
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.95 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="border-white/80 text-foreground fixed z-[90] hidden h-[52px] w-[52px] items-center justify-center rounded-[18px] border bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(241,245,249,0.92))] shadow-[0_18px_45px_rgba(15,23,42,0.22),0_2px_10px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] transition-[color,box-shadow,transform] lg:flex dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.86))]"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1.55rem)' }}
          aria-label={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          title={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          <span className="pointer-events-none absolute inset-[5px] rounded-[14px] bg-[radial-gradient(circle_at_30%_20%,rgba(45,212,191,0.22),transparent_58%)]" />
          {sidebarCollapsed ? (
            <ChevronRight className="relative h-5 w-5" />
          ) : (
            <ChevronLeft className="relative h-5 w-5" />
          )}
        </motion.button>
      </>
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
        'tap-feedback relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200',
        collapsed && 'justify-center px-0',
        isActive
          ? cn(
              'bg-brand-50 text-brand-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]',
              !collapsed &&
                'before:bg-brand-700 before:absolute before:left-0 before:top-1 before:h-8 before:w-[3px] before:rounded-r',
            )
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0', isActive && 'text-brand-700')} />
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key={`${href}-label`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
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
