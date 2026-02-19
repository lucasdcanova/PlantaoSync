'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Repeat2,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { ProductLogo } from '@/components/brand/product-logo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BRAND_NAME } from '@/lib/brand'

const pillars = [
  {
    title: 'Clareza clínica',
    description: 'Prioridades assistenciais visíveis sem ruído visual.',
    icon: Stethoscope,
  },
  {
    title: 'Confiança operacional',
    description: 'Cobertura, confirmação e rastreabilidade no mesmo fluxo.',
    icon: ShieldCheck,
  },
  {
    title: 'Decisão rápida',
    description: 'Risco, custo e histórico com leitura imediata.',
    icon: Activity,
  },
]

const steps = [
  {
    title: 'Publicar ciclo de plantão',
    description: 'Coordenação define unidade, janela crítica e regras de elegibilidade.',
    status: 'Planejado',
    color: 'bg-status-info',
  },
  {
    title: 'Confirmar profissionais',
    description: 'Médicos recebem oportunidades, aceitam escala e registram trocas.',
    status: 'Em andamento',
    color: 'bg-status-warning',
  },
  {
    title: 'Fechar cobertura com auditoria',
    description: 'Direção acompanha decisões por turno com trilha completa.',
    status: 'Concluído',
    color: 'bg-status-success',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-card p-1 shadow-card">
              <ProductLogo variant="mark" className="h-full w-full" imageClassName="h-full w-full" priority />
            </div>
            <span className="hidden text-sm font-semibold tracking-wide text-foreground sm:block">{BRAND_NAME}</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="#visao" className="hover:text-foreground">
              Visão
            </Link>
            <Link href="#fluxo" className="hover:text-foreground">
              Fluxo
            </Link>
            <Link href="#faq" className="hover:text-foreground">
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

      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-200/60 blur-3xl" />
            <div className="absolute right-[-120px] top-20 h-[320px] w-[320px] rounded-full bg-status-info/10 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <Badge className="border-brand-200 bg-brand-50 text-brand-800">SaaS para hospitais e clínicas</Badge>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="mt-5"
              >
                <ProductLogo variant="full" className="max-w-[280px] sm:max-w-[340px]" imageClassName="w-full h-auto" priority />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="mt-6 max-w-2xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
              >
                Escala médica com confirmação em tempo real e governança por turno.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg"
              >
                Unifique direção clínica, coordenação e equipe assistencial em um fluxo que reduz improviso,
                acelera confirmação e protege continuidade de cobertura.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <Button size="lg" className="bg-brand-700 text-white shadow-brand hover:bg-brand-800" asChild>
                  <Link href="/register" className="gap-2">
                    Iniciar diagnóstico de escala
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Ver ambiente interno</Link>
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="card-base rounded-xl p-6"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Janela crítica</p>
              <div className="mt-3 space-y-3">
                <article className="card-compact rounded-md p-4">
                  <p className="text-xs text-muted-foreground">22:00 · #PLT920024</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Plantão UTI Adulto</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 text-brand-700" />
                    Hospital São Gabriel · Ala B
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge className="border-red-200 bg-red-50 text-red-700">Cobertura urgente</Badge>
                    <span className="status-dot bg-status-urgent animate-pulse-soft" />
                  </div>
                </article>
                <article className="card-compact rounded-md p-4">
                  <p className="text-xs text-muted-foreground">07:00 · #TRC330012</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Solicitação de troca</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Repeat2 className="h-3.5 w-3.5 text-status-warning" />
                    Aguardando decisão da coordenação
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge className="border-amber-200 bg-amber-50 text-amber-700">Pendente</Badge>
                    <span className="status-dot bg-status-warning" />
                  </div>
                </article>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="visao" className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map((pillar, index) => (
                <motion.article
                  key={pillar.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="card-base card-hover p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                    <pillar.icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold text-foreground">{pillar.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{pillar.description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="fluxo" className="px-4 pb-20 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="card-base p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Visão executiva</p>
              <h3 className="mt-3 font-display text-2xl font-bold text-foreground">
                Da convocação ao fechamento com histórico auditável.
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                A operação ganha previsibilidade com status semânticos, timeline por horário e confirmação em
                poucos toques.
              </p>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-status-success" />
                  Confirmação de plantão com trilha de decisão.
                </p>
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-status-urgent" />
                  Alertas críticos com prioridade visual imediata.
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-status-info" />
                  Timeline diária para leitura rápida por setor.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                  className="card-base p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className={`timeline-bar ${step.color}`} />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{step.status}</p>
                      <h4 className="mt-1 text-base font-semibold text-foreground">{step.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="px-4 pb-20 sm:px-6">
          <div className="mx-auto max-w-4xl card-base rounded-xl p-8 text-center">
            <h3 className="font-display text-3xl font-bold text-foreground">Comece com um ciclo real da sua operação</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              Estruture confirmação, trocas e cobertura crítica com o padrão visual e operacional que o time
              clínico consegue usar no primeiro dia.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="bg-brand-700 text-white shadow-brand hover:bg-brand-800" asChild>
                <Link href="/register">Solicitar diagnóstico guiado</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/faq">Ler perguntas frequentes</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/80 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-md bg-card p-1 shadow-card">
              <ProductLogo variant="mark" className="h-full w-full" imageClassName="h-full w-full" />
            </div>
            <span className="font-semibold text-foreground">{BRAND_NAME}</span>
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
          <p>© 2026 {BRAND_NAME}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
