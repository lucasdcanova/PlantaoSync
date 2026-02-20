'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { ProductLogo } from '@/components/brand/product-logo'
import { HeroMotionBackground } from '@/components/marketing/hero-motion'
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
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-border/60 bg-background/80 fixed top-0 z-50 w-full border-b backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label={BRAND_NAME} className="inline-flex items-center">
            <div className="border-border/70 flex h-9 w-9 items-center justify-center rounded-full border bg-white/70">
              <ProductLogo
                variant="mark"
                className="h-5 w-5"
                imageClassName="h-full w-full"
                priority
              />
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              size="sm"
              className="bg-brand-700 hover:bg-brand-800 shadow-brand text-white"
              asChild
            >
              <Link href="/register">Começar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero — Minimalist */}
        <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 pt-14 text-center">
          <HeroMotionBackground />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-2xl"
          >
            {/* Logo */}
            <div className="mx-auto mb-8 !inline-flex !p-3">
              <ProductLogo
                variant="full"
                className="w-[372px] max-w-[calc(100vw-2rem)]"
                imageClassName="h-auto w-full"
                priority
              />
            </div>

            <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Escala médica <span className="text-gradient">sob controle</span>
            </h1>

            <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-base leading-relaxed sm:text-lg">
              Confirme plantões, gerencie trocas e acompanhe cobertura crítica em tempo real.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-brand-700 shadow-brand hover:bg-brand-800 w-full gap-2 text-white sm:w-auto"
                asChild
              >
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
            className="text-muted-foreground relative z-10 mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
          >
            {['Sem cartão de crédito', 'Implementação em 24h', 'Conforme LGPD'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="text-brand-600 h-3.5 w-3.5" />
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
                  description:
                    'Visão consolidada de cobertura, custos projetados e decisões auditáveis por turno.',
                },
                {
                  title: 'Para a Coordenação',
                  description:
                    'Publique escalas, receba confirmações e gerencie substituições em poucos cliques.',
                },
                {
                  title: 'Para o Médico',
                  description:
                    'Confirme plantões, solicite trocas e acompanhe ganhos direto do celular.',
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
                  <h2 className="font-display text-foreground text-base font-semibold">
                    {card.title}
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="font-display text-foreground text-2xl font-bold sm:text-3xl">
              Comece com um mês real
            </h3>
            <p className="text-muted-foreground mt-3 text-sm">
              Configure sua primeira escala em minutos. Sem complexidade.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-brand-700 shadow-brand hover:bg-brand-800 text-white"
                asChild
              >
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
      <footer className="border-border/60 border-t px-4 py-8 sm:px-6">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="logo-container-light !shadow-subtle !rounded-lg !p-1">
              <ProductLogo variant="mark" className="h-5 w-5" imageClassName="h-full w-full" />
            </div>
            <span className="text-foreground font-medium">{BRAND_NAME}</span>
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
