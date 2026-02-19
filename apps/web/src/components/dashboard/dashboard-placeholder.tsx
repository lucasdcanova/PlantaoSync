import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DashboardPlaceholderProps {
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  highlights: string[]
  primaryAction?: {
    label: string
    href: string
  }
}

export function DashboardPlaceholderPage({
  title,
  subtitle,
  description,
  icon,
  highlights,
  primaryAction,
}: DashboardPlaceholderProps) {
  return (
    <>
      <Header title={title} subtitle={subtitle} />

      <div className="p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
          <Badge className="border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Módulo estratégico em estruturação
          </Badge>

          <div className="mt-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              {icon}
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              >
                {item}
              </div>
            ))}
          </div>

          {primaryAction && (
            <div className="mt-8">
              <Button asChild className="gap-2 bg-brand-600 text-white shadow-brand hover:bg-brand-700">
                <Link href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
