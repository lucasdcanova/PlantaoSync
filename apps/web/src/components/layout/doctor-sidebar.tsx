'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  CalendarDays,
  CalendarPlus2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LogOut,
  Repeat2,
} from 'lucide-react'
import { ProductLogo } from '@/components/brand/product-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BRAND_SHORT_NAME } from '@/lib/brand'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'

export const DOCTOR_SIDEBAR_COLLAPSED_WIDTH = 88
export const DOCTOR_SIDEBAR_EXPANDED_WIDTH = 256

const navItems = [
  { href: '/doctor', label: 'Resumo', icon: Activity },
  { href: '/doctor/available', label: 'Disponíveis', icon: CalendarPlus2 },
  { href: '/doctor/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/doctor/history', label: 'Histórico', icon: Clock3 },
  { href: '/doctor/swaps', label: 'Trocas', icon: Repeat2 },
]

export function DoctorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  const isActive = (href: string) =>
    pathname === href || (href !== '/doctor' && pathname.startsWith(`${href}/`))

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={{
          width: sidebarCollapsed ? DOCTOR_SIDEBAR_COLLAPSED_WIDTH : DOCTOR_SIDEBAR_EXPANDED_WIDTH,
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 34, mass: 0.9 }}
        className="border-border/80 bg-card/95 fixed inset-y-0 left-0 z-40 hidden h-[100dvh] flex-col border-r shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-sm lg:flex"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_65%)]" />

        <div className={cn('relative flex h-16 items-center px-4', sidebarCollapsed && 'justify-center')}>
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="doctor-logo-full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-2.5"
              >
                <div className="logo-container-light !rounded-xl !p-1.5 shadow-[0_10px_22px_rgba(15,23,42,0.08)]">
                  <ProductLogo variant="mark" className="h-6 w-6" imageClassName="h-full w-full" />
                </div>
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-semibold tracking-tight">
                    {BRAND_SHORT_NAME}
                  </p>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                    Médico
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="doctor-logo-mark"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.16 }}
                className="logo-container-light !rounded-xl !p-1.5 shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
              >
                <ProductLogo variant="mark" className="h-6 w-6" imageClassName="h-full w-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="relative flex-1 space-y-1 px-3 py-3">
          {navItems.map((item) => (
            <DoctorNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive(item.href)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        <div className="border-border/80 border-t p-4">
          <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-brand-50 text-brand-700 text-xs font-semibold">
                {getInitials(user?.name ?? 'DR')}
              </AvatarFallback>
            </Avatar>

            <AnimatePresence initial={false}>
              {!sidebarCollapsed && (
                <motion.div
                  key="doctor-user-meta"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16 }}
                  className="min-w-0 flex-1"
                >
                  <p className="text-foreground truncate text-sm font-medium">{user?.name}</p>
                  <p className="text-muted-foreground truncate text-[10px]">
                    {user?.organization?.name ?? 'Instituição'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {sidebarCollapsed ? (
              <motion.div
                key="doctor-logout-icon"
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
                key="doctor-logout-button"
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

        <motion.button
          type="button"
          onClick={toggleSidebar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="border-border/80 bg-card text-muted-foreground hover:text-foreground shadow-card absolute -right-3 top-20 flex h-7 w-7 items-center justify-center rounded-full border transition-colors"
          aria-label={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          title={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </motion.button>
      </motion.aside>
    </TooltipProvider>
  )
}

function DoctorNavItem({
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
