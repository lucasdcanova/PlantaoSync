import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MarketingShellProps {
  title: string
  description: string
  children: React.ReactNode
}

export function MarketingShell({ title, description, children }: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-brand">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold text-foreground">AgendaPlantão</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/#diferenciais" className="transition-colors hover:text-foreground">
              Diferenciais
            </Link>
            <Link href="/#implantacao" className="transition-colors hover:text-foreground">
              Implantação
            </Link>
            <Link href="/faq" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button size="sm" className="bg-brand-600 text-white shadow-brand hover:bg-brand-700" asChild>
              <Link href="/register">Ver demonstração</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden px-6 py-14 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para a home
          </Link>

          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>

          <div className="mt-10">{children}</div>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-600" />
            <span className="font-display font-semibold text-foreground">AgendaPlantão</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacidade
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Termos
            </Link>
            <Link href="/lgpd" className="transition-colors hover:text-foreground">
              LGPD
            </Link>
          </div>
          <p>© 2026 AgendaPlantão. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
