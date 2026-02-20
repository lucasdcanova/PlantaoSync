import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
        <div className="mx-auto w-full max-w-[1680px]">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
