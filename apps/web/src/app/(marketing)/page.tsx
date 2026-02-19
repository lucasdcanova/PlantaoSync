'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Calendar, Bell, BarChart3, Shield, Users, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const features = [
  { icon: Zap,       title: 'Publicação Rápida',   desc: 'Crie e publique escalas completas em menos de 5 minutos' },
  { icon: Bell,      title: 'Notificações Instant', desc: 'Profissionais recebem alertas push no momento da publicação' },
  { icon: CheckCircle, title: '1 Clique para Confirmar', desc: 'Profissional aceita o plantão diretamente pelo app mobile' },
  { icon: BarChart3, title: 'Analytics Completos', desc: 'Dashboards de ocupação, custos e performance em tempo real' },
  { icon: Users,     title: 'Gestão de Equipes',   desc: 'Centralize todo o cadastro e histórico da sua equipe' },
  { icon: Shield,    title: 'LGPD Compliant',       desc: 'Conformidade total com a lei de proteção de dados' },
]

const stats = [
  { value: '500+',  label: 'Hospitais Ativos' },
  { value: '10K+',  label: 'Profissionais' },
  { value: '98%',   label: 'Satisfação' },
  { value: '80%',   label: 'Menos Tempo' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-semibold">AgendaPlantão</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="#features" className="hover:text-foreground transition-colors">Funcionalidades</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Preços</Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button className="bg-brand-600 hover:bg-brand-700 text-white shadow-brand" size="sm" asChild>
              <Link href="/register">Teste Grátis <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-32">
        {/* Background gradient */}
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
              🏥 Plataforma líder em gestão de escalas médicas
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
            className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Gestão de escalas{' '}
            <span className="text-gradient">sem planilhas</span>
            <br />
            nem WhatsApp
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 300, damping: 30 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Publique escalas em segundos, profissionais confirmam com 1 clique e você tem
            visibilidade total em tempo real. Reduza 80% do tempo de gestão.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 30 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button
              size="lg"
              className="bg-brand-600 hover:bg-brand-700 text-white shadow-brand glow-brand px-8 gap-2"
              asChild
            >
              <Link href="/register">
                Começar Gratuitamente por 7 Dias
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Sem cartão de crédito · Cancele quando quiser
            </p>
          </motion.div>

          {/* Stats */}
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
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Tudo que você precisa para gerir escalas
            </h2>
            <p className="mt-4 text-muted-foreground">
              Uma plataforma completa do cadastro à confirmação
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 380, damping: 28 }}
                className="group rounded-xl border border-border bg-card p-6 shadow-card card-hover"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/20 transition-transform group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-12 text-center text-white shadow-brand"
        >
          <h2 className="font-display text-3xl font-bold">
            Comece hoje. Grátis por 7 dias.
          </h2>
          <p className="mt-4 text-brand-100/80">
            50+ hospitais iniciaram o teste este mês. Garantia de 30 dias ou devolução total.
          </p>
          <Button
            size="lg"
            className="mt-8 bg-white text-brand-700 hover:bg-brand-50 gap-2 shadow-lg"
            asChild
          >
            <Link href="/register">
              Criar Conta Gratuita
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-600" />
            <span className="font-display font-semibold text-foreground">AgendaPlantão</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos</Link>
            <Link href="/lgpd" className="hover:text-foreground transition-colors">LGPD</Link>
          </div>
          <p>© 2026 AgendaPlantão. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
