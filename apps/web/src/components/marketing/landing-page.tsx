'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { ProductLogo } from '@/components/brand/product-logo'
import { Button } from '@/components/ui/button'
import { BRAND_NAME } from '@/lib/brand'

export function LandingPage() {
  const router = useRouter()
  const [isPWA, setIsPWA] = useState(false)

  // PWA redirect: if installed as PWA, skip landing page
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setIsPWA(true)
      router.replace('/login')
    }
  }, [router])

  if (isPWA) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="logo-container-light !rounded-lg !p-1.5 !shadow-subtle">
              <ProductLogo variant="mark" className="h-6 w-6" imageClassName="h-full w-full" priority />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">{BRAND_NAME}</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button size="sm" className="bg-brand-700 text-white hover:bg-brand-800 shadow-brand" asChild>
              <Link href="/register">Começar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — Minimalist */}
        <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 pt-14 text-center">
          {/* Subtle gradient orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-200/30 blur-[100px]" />
            <div className="absolute right-1/4 bottom-1/4 h-[280px] w-[280px] rounded-full bg-brand-100/40 blur-[80px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-2xl"
          >
            {/* Logo */}
            <div className="mx-auto mb-8 logo-container-light !inline-flex !p-3 !rounded-2xl">
              <ProductLogo variant="mark" className="h-12 w-12" imageClassName="h-full w-full" priority />
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Escala médica{' '}
              <span className="text-gradient">sob controle</span>
            </h1>

            <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground sm:text-lg leading-relaxed">
              Confirme plantões, gerencie trocas e acompanhe cobertura crítica em tempo real.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-brand-700 text-white shadow-brand hover:bg-brand-800 gap-2 w-full sm:w-auto" asChild>
                <Link href="/register">
                  Começar gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative z-10 mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            {['Sem cartão de crédito', 'Implementação em 24h', 'Conforme LGPD'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" />
                {item}
              </span>
            ))}
          </motion.div>
        </section>

        {/* Value props — clean cards */}
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: 'Para a Direção',
                  description: 'Visão consolidada de cobertura, custos projetados e decisões auditáveis por turno.',
                },
                {
                  title: 'Para a Coordenação',
                  description: 'Publique escalas, receba confirmações e gerencie substituições em poucos cliques.',
                },
                {
                  title: 'Para o Médico',
                  description: 'Confirme plantões, solicite trocas e acompanhe ganhos direto do celular.',
                },
              ].map((card, i) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="card-base p-6"
                >
                  <h2 className="font-display text-base font-semibold text-foreground">{card.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Comece com um ciclo real
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Configure sua primeira escala em minutos. Sem complexidade.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="bg-brand-700 text-white shadow-brand hover:bg-brand-800" asChild>
                <Link href="/register">Solicitar demonstração</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/faq">Perguntas frequentes</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="logo-container-light !rounded-lg !p-1 !shadow-subtle">
              <ProductLogo variant="mark" className="h-5 w-5" imageClassName="h-full w-full" />
            </div>
            <span className="font-medium text-foreground">{BRAND_NAME}</span>
          </div>
          <div className="flex items-center gap-5">
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
          <p>© 2026 {BRAND_NAME}</p>
        </div>
      </footer>
    </div>
  )
}
