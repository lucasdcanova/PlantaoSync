import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { StatusBarSync } from '@/components/layout/status-bar-sync'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-[100dvh] overflow-hidden">
      <StatusBarSync color="#ffffff" />
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
        <div className="mx-auto w-full max-w-[1680px]">{children}</div>
      </main>
      <MobileNav />
    </div>
  )
}
