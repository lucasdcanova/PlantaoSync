'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, LayoutDashboard, MapPin, Users, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/overview', label: 'Início', icon: LayoutDashboard },
  { href: '/schedules', label: 'Escalas', icon: Calendar, featured: true },
  { href: '/professionals', label: 'Equipe', icon: Users },
  { href: '/locations', label: 'Setores', icon: MapPin },
  { href: '/reports', label: 'Relatórios', icon: BarChart3 },
]

export function MobileNav() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <nav className="bottom-nav lg:hidden">
      {navItems.map((item) => {
        const active = isActive(item.href)
        const Icon = item.icon
        const featured = item.featured === true
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'bottom-nav-item tap-feedback',
              featured && 'bottom-nav-item-calendar',
              active && 'active',
            )}
          >
            {featured ? (
              <span className="bottom-nav-calendar-shell" aria-hidden>
                <span className="bottom-nav-calendar-ring" />
                <Icon
                  className={cn(
                    'bottom-nav-icon h-7 w-7 text-white',
                  )}
                />
              </span>
            ) : (
              <Icon
                className={cn(
                  'bottom-nav-icon h-5 w-5',
                  active ? 'text-brand-700' : 'text-muted-foreground',
                )}
              />
            )}
            <span className={cn(featured && 'bottom-nav-calendar-label')}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
