import { RouteTransition } from '@/components/layout/route-transition'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background">
      <RouteTransition>{children}</RouteTransition>
    </div>
  )
}
