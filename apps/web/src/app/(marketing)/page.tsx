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
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: Zap,
    title: 'Publicacao Rapida',
    desc: 'Crie e publique escalas completas em menos de 5 minutos',
  },
  {
    icon: Bell,
    title: 'Notificacoes Instantaneas',
    desc: 'Profissionais recebem alertas push no momento da publicacao',
  },
  {
    icon: CheckCircle,
    title: '1 Clique para Confirmar',
    desc: 'Profissional aceita o plantao diretamente pelo app mobile',
  },
  {
    icon: BarChart3,
    title: 'Analytics Completos',
    desc: 'Dashboards de ocupacao, custos e performance em tempo real',
  },
  {
    icon: Users,
    title: 'Gestao de Equipes',
    desc: 'Centralize todo o cadastro e historico da sua equipe',
  },
  {
    icon: Shield,
    title: 'LGPD Compliant',
    desc: 'Conformidade total com a lei de protecao de dados',
  },
]

const stats = [
  { value: '500+', label: 'Hospitais Ativos' },
  { value: '10K+', label: 'Profissionais' },
  { value: '98%', label: 'Satisfacao' },
  { value: '80%', label: 'Menos Tempo' },
]

const plans = [
  {
    name: 'Essencial',
    price: 'R$ 499',
    period: '/mes',
    description: 'Ideal para operacoes em fase de organizacao.',
    highlights: ['Ate 30 profissionais', 'Escalas ilimitadas', 'Notificacoes push'],
    cta: 'Comecar teste',
  },
  {
    name: 'Profissional',
    price: 'R$ 1.290',
    period: '/mes',
    description: 'Para equipes com multiplas unidades e alta demanda.',
    highlights: ['Ate 150 profissionais', 'Relatorios avancados', 'Suporte prioritario'],
    cta: 'Escolher plano',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Governanca, integracoes e suporte dedicado.',
    highlights: ['SSO e auditoria ampliada', 'Implantacao assistida', 'SLA customizado'],
    cta: 'Falar com time',
  },
]

const faqItems = [
  {
    question: 'Quanto tempo leva para implantar?',
    answer: 'A maioria das operacoes comeca no mesmo dia com a primeira escala publicada.',
  },
  {
    question: 'Preciso de cartao para testar?',
    answer: 'Nao. O periodo de teste e liberado sem cartao de credito.',
  },
  {
    question: 'Tem suporte na implantacao?',
    answer: 'Sim. O time acompanha a configuracao inicial e boas praticas de uso.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold">AgendaPlantao</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="#features" className="transition-colors hover:text-foreground">
              Funcionalidades
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-foreground">
              Precos
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
                Teste Gratis <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Badge className="mb-6 border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
              Plataforma lider em gestao de escalas medicas
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
            className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Gestao de escalas <span className="text-gradient">sem planilhas</span>
            <br />
            nem WhatsApp
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 300, damping: 30 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Publique escalas em segundos, profissionais confirmam com 1 clique e voce tem
            visibilidade total em tempo real.
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
                Comecar Gratuitamente por 7 Dias
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">Sem cartao de credito · Cancele quando quiser</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 30 }}
            className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06, type: 'spring', stiffness: 380, damping: 28 }}
                className="rounded-xl border border-border bg-card p-4 shadow-card"
              >
                <p className="font-display text-2xl font-bold text-brand-600">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="features" className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Tudo que voce precisa para gerir escalas
            </h2>
            <p className="mt-4 text-muted-foreground">Uma plataforma completa do cadastro a confirmacao.</p>
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

      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Planos para cada fase da operacao</h2>
            <p className="mt-3 text-muted-foreground">Comece rapido e evolua sem trocar de plataforma.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 shadow-card ${
                  plan.featured
                    ? 'border-brand-300 bg-brand-50/40 dark:border-brand-800 dark:bg-brand-900/20'
                    : 'border-border bg-card'
                }`}
              >
                {plan.featured && (
                  <Badge className="mb-4 border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    Mais escolhido
                  </Badge>
                )}

                <h3 className="font-display text-xl font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-3 text-3xl font-bold text-foreground">
                  {plan.price}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">{plan.period}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

                <ul className="mt-5 space-y-2">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`mt-6 w-full ${
                    plan.featured
                      ? 'bg-brand-600 text-white shadow-brand hover:bg-brand-700'
                      : 'bg-foreground text-background hover:bg-foreground/90'
                  }`}
                >
                  <Link href="/register">{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground">Perguntas frequentes</h2>
            <p className="mt-3 text-muted-foreground">Tudo que voce precisa para decidir com seguranca.</p>
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
              <Link href="/faq">Ver FAQ completo</Link>
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
          <h2 className="font-display text-3xl font-bold">Comece hoje. Gratis por 7 dias.</h2>
          <p className="mt-4 text-brand-100/80">
            Hospitais e clinicas ja simplificaram a gestao de plantao com o AgendaPlantao.
          </p>
          <Button size="lg" className="mt-8 gap-2 bg-white text-brand-700 shadow-lg hover:bg-brand-50" asChild>
            <Link href="/register">
              Criar Conta Gratuita
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-600" />
            <span className="font-display font-semibold text-foreground">AgendaPlantao</span>
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
          <p>© 2026 AgendaPlantao. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
