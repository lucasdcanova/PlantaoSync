'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle,
  Calendar,
  Bell,
  BarChart3,
  Shield,
  Building2,
  Activity,
  Handshake,
  Users,
  Stethoscope,
  BadgeDollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const outcomes = [
  { value: 'Risco visível', label: 'antecipe falta de cobertura' },
  { value: 'Fluxo único', label: 'publicação, convite e confirmação' },
  { value: 'Histórico auditável', label: 'decisões por unidade e turno' },
  { value: 'Visão executiva', label: 'assistencial + financeira no mesmo painel' },
]

const features = [
  {
    icon: Activity,
    title: 'Painel de continuidade assistencial',
    desc: 'Veja gargalos de cobertura antes que virem urgência operacional.',
  },
  {
    icon: Bell,
    title: 'Convocação com prioridade real',
    desc: 'Acione profissionais certos por especialidade, unidade e criticidade.',
  },
  {
    icon: CheckCircle,
    title: 'Confirmação com rastreabilidade',
    desc: 'Cada aceite, recusa ou cancelamento fica registrado para auditoria.',
  },
  {
    icon: Building2,
    title: 'Operação multiunidade',
    desc: 'Padronize escala em hospitais, clínicas e unidades satélite.',
  },
  {
    icon: BarChart3,
    title: 'Cobertura e custo no mesmo lugar',
    desc: 'Decida com dados combinando risco assistencial e impacto financeiro.',
  },
  {
    icon: Shield,
    title: 'Governança e compliance nativos',
    desc: 'Permissões por perfil, trilha de eventos e controles orientados a LGPD.',
  },
]

const roleBlocks = [
  {
    icon: Stethoscope,
    title: 'Direção clínica',
    copy: 'Acompanhe cobertura crítica por unidade e reduza improviso em plantões sensíveis.',
  },
  {
    icon: Users,
    title: 'Coordenação de escala',
    copy: 'Troque planilhas e grupos dispersos por um fluxo único, claro e rastreável.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Financeiro e controladoria',
    copy: 'Conecte custo de plantão com status de cobertura para decidir com previsibilidade.',
  },
]

const deploymentModels = [
  {
    name: 'Núcleo Assistencial',
    description: 'Para operações que precisam sair do improviso sem travar a rotina.',
    highlights: ['Escalas e convites centralizados', 'Confirmação com trilha de decisões', 'Onboarding guiado'],
    cta: 'Iniciar diagnóstico',
  },
  {
    name: 'Operação Multiunidade',
    description: 'Para grupos com hospitais e clínicas em diferentes níveis de maturidade.',
    highlights: ['Governança por unidade e perfil', 'Visão consolidada de cobertura', 'Relatórios para comitês'],
    cta: 'Falar com especialista',
    featured: true,
  },
  {
    name: 'Rede Hospitalar',
    description: 'Para ambientes de alta complexidade com demanda de compliance ampliado.',
    highlights: ['Padrão operacional em rede', 'Parâmetros de risco assistencial', 'Plano de implantação dedicado'],
    cta: 'Solicitar proposta',
  },
]

const faqItems = [
  {
    question: 'Quanto tempo para substituir o fluxo atual de planilhas e mensagens?',
    answer:
      'O primeiro ciclo costuma entrar em operação em poucos dias, com apoio do time de implantação e migração gradual por unidade.',
  },
  {
    question: 'A plataforma atende hospitais e clínicas com perfis diferentes?',
    answer:
      'Sim. Você pode configurar regras e visões por unidade, especialidade e tipo de cobertura, mantendo governança central.',
  },
  {
    question: 'Como a direção acompanha risco de cobertura em tempo real?',
    answer:
      'O painel destaca pendências críticas, confirmações e lacunas por período, facilitando ação antes da ruptura.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold">AgendaPlantão</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="#diferenciais" className="transition-colors hover:text-foreground">
              Diferenciais
            </Link>
            <Link href="#implantacao" className="transition-colors hover:text-foreground">
              Implantação
            </Link>
            <Link href="#faq" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button className="bg-brand-600 text-white shadow-brand hover:bg-brand-700" size="sm" asChild>
              <Link href="/register">
                Ver demonstração
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Badge className="mb-6 border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
              Para hospitais e clínicas que tratam escala como operação crítica
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
            className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Escala médica sob controle
            <br />
            <span className="text-gradient">antes da crise do plantão</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 300, damping: 30 }}
            className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground"
          >
            O AgendaPlantão conecta direção clínica, coordenação e operação em um fluxo único para
            prever lacunas, fechar cobertura com agilidade e manter continuidade assistencial com
            rastreabilidade real.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 30 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              className="gap-2 bg-brand-600 px-8 text-white shadow-brand glow-brand hover:bg-brand-700"
              asChild
            >
              <Link href="/register">
                Quero mapear minha operação
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">Diagnóstico inicial guiado | sem cartão de crédito</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 30 }}
            className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {outcomes.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06, type: 'spring', stiffness: 380, damping: 28 }}
                className="rounded-xl border border-border bg-card p-5 text-left shadow-card"
              >
                <p className="font-display text-xl font-bold text-brand-600">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="diferenciais" className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Da escala reativa para uma operação previsível
            </h2>
            <p className="mt-4 text-muted-foreground">
              Um sistema pensado para continuidade assistencial, governança e decisão rápida.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 380, damping: 28 }}
                className="group rounded-xl border border-border bg-card p-6 shadow-card card-hover"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform group-hover:scale-110 dark:bg-brand-900/20">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Uma narrativa para cada decisor</h2>
            <p className="mt-3 text-muted-foreground">
              A mesma base operacional, com visões que fazem sentido para quem decide.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {roleBlocks.map((block) => (
              <div key={block.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                  <block.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">{block.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{block.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="implantacao" className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Modelos de implantação</h2>
            <p className="mt-3 text-muted-foreground">
              Escolha o formato mais aderente ao seu momento operacional.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {deploymentModels.map((model) => (
              <div
                key={model.name}
                className={`rounded-2xl border p-6 shadow-card ${
                  model.featured
                    ? 'border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-900/20'
                    : 'border-border bg-card'
                }`}
              >
                {model.featured && (
                  <Badge className="mb-4 border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    Recomendado para operação em crescimento
                  </Badge>
                )}

                <h3 className="font-display text-xl font-semibold text-foreground">{model.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{model.description}</p>

                <ul className="mt-5 space-y-2">
                  {model.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`mt-6 w-full ${
                    model.featured
                      ? 'bg-brand-600 text-white shadow-brand hover:bg-brand-700'
                      : 'bg-foreground text-background hover:bg-foreground/90'
                  }`}
                >
                  <Link href="/register">{model.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Perguntas que surgem na decisão</h2>
            <p className="mt-3 text-muted-foreground">Respostas objetivas para time assistencial e gestão.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {faqItems.map((item) => (
              <article key={item.question} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <h3 className="font-display text-base font-semibold text-foreground">{item.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/faq">Acessar FAQ completo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-center text-white shadow-brand"
        >
          <h2 className="font-display text-3xl font-bold">Escala previsível com menos improviso</h2>
          <p className="mt-4 text-brand-100/85">
            Se a sua operação depende de plantão, você precisa de controle antes da ruptura.
          </p>
          <Button size="lg" className="mt-8 gap-2 bg-white text-brand-700 shadow-lg hover:bg-brand-50" asChild>
            <Link href="/register">
              Agendar diagnóstico de escala
              <Handshake className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

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
