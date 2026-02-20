import type { Metadata } from 'next'
import { RouteTransition } from '@/components/layout/route-transition'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <RouteTransition className="min-h-screen">{children}</RouteTransition>
    </div>
  )
}
