'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Activity, Building2, CalendarDays, CalendarPlus2, Clock3, LogOut, Menu, Repeat2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ProductLogo } from '@/components/brand/product-logo'
import { BRAND_SHORT_NAME } from '@/lib/brand'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

const navItems = [
  { href: '/doctor', label: 'Resumo', icon: Activity },
  { href: '/doctor/available', label: 'Disponíveis', icon: CalendarPlus2 },
  { href: '/doctor/calendar', label: 'Calendário', icon: CalendarDays },
  { href: '/doctor/history', label: 'Histórico', icon: Clock3 },
  { href: '/doctor/swaps', label: 'Trocas', icon: Repeat2 },
  { href: '/doctor/sectors', label: 'Setores', icon: Building2 },
]

// Bottom nav shows max 5 items on mobile
const mobileNavItems = navItems.slice(0, 5)

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }
    if (user.role !== 'PROFESSIONAL') {
      router.replace('/overview')
    }
  }, [isAuthenticated, router, user])

  if (!isAuthenticated || !user || user.role !== 'PROFESSIONAL') return null

  const isActive = (href: string) =>
    pathname === href || (href !== '/doctor' && pathname.startsWith(`${href}/`))

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="flex min-h-[100dvh]">
        {/* Desktop sidebar */}
        <aside className="hidden w-[240px] shrink-0 flex-col border-r border-border bg-card lg:flex">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2.5 px-5">
            <div className="logo-container-light !rounded-lg !p-1.5 !shadow-subtle">
              <ProductLogo variant="mark" className="h-6 w-6" imageClassName="h-full w-full" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">{BRAND_SHORT_NAME}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Médico</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 px-3 py-3">
            {navItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/20 dark:text-brand-300'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-4 w-4', active && 'text-brand-700 dark:text-brand-400')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-brand-50 text-brand-700 text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.organization?.name ?? 'Hospital'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-start gap-2 text-muted-foreground"
              onClick={() => {
                logout()
                router.push('/login')
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {/* Mobile header */}
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="logo-container-light !rounded-lg !p-1 !shadow-subtle">
                <ProductLogo variant="mark" className="h-6 w-6" imageClassName="h-full w-full" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Portal Médico</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="bg-brand-50 text-brand-700 text-[10px] font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav lg:hidden">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('bottom-nav-item', active && 'active')}
            >
              <Icon className={cn('h-5 w-5 bottom-nav-icon', active ? 'text-brand-700' : 'text-muted-foreground')} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Mobile slide-over menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-72 border-l border-border bg-card p-5 lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <p className="font-display text-base font-semibold text-foreground">Menu</p>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-6 rounded-xl bg-background p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="bg-brand-50 text-brand-700 text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-0.5">
                {navItems.map((item) => {
                  const active = isActive(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors',
                        active
                          ? 'bg-brand-50 text-brand-800'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      )}
                    >
                      <Icon className={cn('h-4 w-4', active && 'text-brand-700')} />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="absolute bottom-6 left-5 right-5">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    logout()
                    router.push('/login')
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sair da conta
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
