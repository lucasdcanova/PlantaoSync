'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Activity, Building2, CalendarPlus2, Clock3, LogOut, Repeat2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductLogo } from '@/components/brand/product-logo'
import { BRAND_SHORT_NAME } from '@/lib/brand'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

const navItems = [
  { href: '/doctor', label: 'Resumo', icon: Activity },
  { href: '/doctor/available', label: 'Disponíveis', icon: CalendarPlus2 },
  { href: '/doctor/history', label: 'Histórico', icon: Clock3 },
  { href: '/doctor/swaps', label: 'Trocas', icon: Repeat2 },
  { href: '/doctor/sectors', label: 'Setores', icon: Building2 },
]

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuthStore()

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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
        <aside className="hidden w-[260px] border-r border-border bg-card p-4 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="h-9 w-9 rounded-md bg-background p-1 shadow-card">
              <ProductLogo variant="mark" className="h-full w-full" imageClassName="h-full w-full" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{BRAND_SHORT_NAME}</p>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ambiente médico</p>
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium',
                    isActive
                      ? 'bg-brand-50 text-brand-800 before:absolute before:left-0 before:top-1 before:h-8 before:w-[3px] before:rounded-r before:bg-brand-700'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive && 'text-brand-700')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto rounded-lg border border-border bg-background p-4">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Hospital vinculado</p>
            <p className="mt-1 text-sm font-medium text-foreground">{user.organization?.name ?? 'Hospital São Gabriel'}</p>
            <Badge className="mt-3 border-brand-200 bg-brand-50 text-brand-800">Credencial demo</Badge>
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-card/85 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">Portal Médico</h1>
                <p className="text-xs text-muted-foreground">Plantões, trocas e histórico em leitura rápida</p>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="bg-brand-50 text-brand-700 text-xs font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    logout()
                    router.push('/login')
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium',
                      isActive
                        ? 'border-brand-300 bg-brand-50 text-brand-800'
                        : 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </header>

          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
