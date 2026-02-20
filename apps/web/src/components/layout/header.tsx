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
      <header className="border-border bg-card/92 fixed inset-x-0 top-0 z-50 min-h-[calc(68px+env(safe-area-inset-top))] border-b px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur-md sm:px-6 lg:sticky lg:top-0 lg:min-h-0 lg:pt-3">
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
      <div className="h-[calc(68px+env(safe-area-inset-top))] lg:hidden" />
    </>
  )
}
