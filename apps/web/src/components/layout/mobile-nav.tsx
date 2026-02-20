'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, LayoutDashboard, MapPin, Users, Settings, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/overview', label: 'Início', icon: LayoutDashboard },
    { href: '/schedules', label: 'Escalas', icon: Calendar },
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
    )
}
