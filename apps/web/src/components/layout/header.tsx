'use client'

import { motion } from 'framer-motion'
import { Bell, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <>
      {/* Desktop-only page header (mobile header is in layout) */}
      <header className="hidden lg:sticky lg:top-0 lg:z-50 lg:block lg:border-b lg:border-border lg:bg-card lg:px-6 lg:py-3">
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-foreground text-lg font-semibold sm:text-xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-muted-foreground text-xs sm:text-sm">{subtitle}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Badge className="border-brand-200 bg-brand-50 text-brand-800 hidden sm:inline-flex">
              Tempo real
            </Badge>

            <Button variant="outline" size="icon" className="relative h-9 w-9">
              <Bell className="h-4 w-4" />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-status-warning absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full"
              />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-9 w-9"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile: page title (smaller, below the main header) */}
      <div className="px-4 pt-3 lg:hidden">
        <h1 className="font-display text-foreground text-base font-semibold">{title}</h1>
        {subtitle ? (
          <p className="text-muted-foreground text-[11px]">{subtitle}</p>
        ) : null}
      </div>
    </>
  )
}
