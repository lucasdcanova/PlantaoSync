import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductLogo } from '@/components/brand/product-logo'
import { Button } from '@/components/ui/button'
import { BRAND_NAME } from '@/lib/brand'

interface MarketingShellProps {
  title: string
  description: string
  children: React.ReactNode
}

export function MarketingShell({ title, description, children }: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-card p-1 shadow-card">
              <ProductLogo variant="mark" className="h-full w-full" imageClassName="h-full w-full" />
            </div>
            <span className="hidden text-sm font-semibold tracking-wide text-foreground sm:block">{BRAND_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/#visao" className="hover:text-foreground">
              Visão
            </Link>
            <Link href="/#fluxo" className="hover:text-foreground">
              Fluxo
            </Link>
            <Link href="/faq" className="hover:text-foreground">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button size="sm" className="bg-brand-700 text-white hover:bg-brand-800" asChild>
              <Link href="/register">Solicitar demonstração</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para a página inicial
          </Link>

          <div className="mt-6 card-base rounded-xl p-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/80 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-card p-1 shadow-card">
              <ProductLogo variant="mark" className="h-full w-full" imageClassName="h-full w-full" />
            </div>
            <span className="font-semibold text-foreground">{BRAND_NAME}</span>
          </div>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              Privacidade
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Termos
            </Link>
            <Link href="/lgpd" className="hover:text-foreground">
              LGPD
            </Link>
          </div>
          <p>© 2026 {BRAND_NAME}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
