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
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">{title}</h1>
          {subtitle ? <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          <Badge className="hidden border-brand-200 bg-brand-50 text-brand-800 sm:inline-flex">Tempo real</Badge>

          <Button variant="outline" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full bg-status-warning"
            />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
