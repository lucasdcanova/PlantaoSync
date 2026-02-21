'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle2,
  BellRing,
  BarChart3,
  ArrowLeftRight,
  Wallet,
  ShieldCheck,
  Users,
  Zap,
  Clock,
  Smartphone,
  Lock,
  FileText,
  ChevronDown,
  Building2,
  Check,
  Calendar,
  AlertCircle,
  TrendingDown,
  MessageSquareOff,
  ClipboardX,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { ProductLogo } from '@/components/brand/product-logo'
import { HeroMotionBackground } from '@/components/marketing/hero-motion'
import { Button } from '@/components/ui/button'
import { BRAND_NAME } from '@/lib/brand'
import { cn } from '@/lib/utils'

// ─── Fade/Slide animation preset ───────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
}

function TopNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground group relative inline-flex items-center py-1 transition-colors duration-300"
    >
      <span>{children}</span>
      <span className="bg-brand-500 absolute -bottom-0.5 left-0 h-[2px] w-0 rounded-full transition-all duration-300 group-hover:w-full" />
    </Link>
  )
}

// ─── Section label ──────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-brand-600 border-brand-200/60 bg-brand-50/80 dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-brand-400 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest">
      {children}
    </span>
  )
}

// ─── Section heading helper ─────────────────────────────────────
function SectionHeading({
  label,
  title,
  subtitle,
  centered = true,
}: {
  label?: string
  title: React.ReactNode
  subtitle?: string
  centered?: boolean
}) {
  return (
    <div className={cn('max-w-2xl', centered && 'mx-auto text-center')}>
      {label && (
        <div className={cn('mb-4', centered && 'flex justify-center')}>
          <SectionLabel>{label}</SectionLabel>
        </div>
      )}
      <h2 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─── Feature card ───────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card-base group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.14)]"
    >
      <div className="from-brand-300/0 via-brand-300/40 to-brand-300/0 pointer-events-none absolute inset-x-6 -top-10 h-20 bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
      <div className="bg-brand-100 text-brand-600 group-hover:bg-brand-600 dark:bg-brand-950/60 dark:text-brand-400 dark:group-hover:bg-brand-600 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:text-white dark:group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-foreground text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}

// ─── Pricing plan ───────────────────────────────────────────────
function PricingPlan({
  name,
  price,
  description,
  professionals,
  locations,
  managers,
  features,
  highlighted = false,
  delay = 0,
}: {
  name: string
  price: string
  description: string
  professionals: number
  locations: number
  managers: number
  features: string[]
  highlighted?: boolean
  delay?: number
}) {
  return (
    <motion.div
      {...fadeUp}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative flex flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5',
        highlighted
          ? 'bg-brand-700 shadow-brand ring-brand-600 text-white ring-2 hover:shadow-[0_24px_52px_rgba(43,181,171,0.35)]'
          : 'card-base hover:shadow-[0_20px_44px_rgba(15,23,42,0.14)]',
      )}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
            Mais escolhido
          </span>
        </div>
      )}
      <div>
        <p
          className={cn(
            'text-sm font-semibold uppercase tracking-widest',
            highlighted ? 'text-brand-200' : 'text-brand-600 dark:text-brand-400',
          )}
        >
          {name}
        </p>
        <div className="mt-3 flex items-end gap-1">
          <span
            className={cn(
              'font-display text-4xl font-bold',
              highlighted ? 'text-white' : 'text-foreground',
            )}
          >
            {price}
          </span>
          <span
            className={cn('mb-1 text-sm', highlighted ? 'text-brand-200' : 'text-muted-foreground')}
          >
            /mês
          </span>
        </div>
        <p
          className={cn(
            'mt-2 text-sm',
            highlighted ? 'text-brand-100/80' : 'text-muted-foreground',
          )}
        >
          {description}
        </p>
      </div>

      <div className={cn('my-6 border-t', highlighted ? 'border-brand-600' : 'border-border')} />

      <div
        className={cn(
          'mb-5 grid grid-cols-3 gap-3 rounded-xl p-4 text-center',
          highlighted ? 'bg-brand-800/60' : 'bg-muted/50',
        )}
      >
        {[
          { label: 'Profissionais', value: professionals },
          { label: 'Unidades', value: locations },
          { label: 'Gestores', value: managers },
        ].map((item) => (
          <div key={item.label}>
            <p
              className={cn(
                'font-display text-xl font-bold',
                highlighted ? 'text-white' : 'text-foreground',
              )}
            >
              {item.value}
            </p>
            <p className={cn('text-xs', highlighted ? 'text-brand-200' : 'text-muted-foreground')}>
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <ul className="flex flex-1 flex-col gap-2.5">
        {features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5">
            <Check
              className={cn(
                'mt-0.5 h-4 w-4 shrink-0',
                highlighted ? 'text-green-400' : 'text-brand-600 dark:text-brand-400',
              )}
            />
            <span
              className={cn('text-sm', highlighted ? 'text-brand-100/90' : 'text-muted-foreground')}
            >
              {feat}
            </span>
          </li>
        ))}
      </ul>

      <Button
        className={cn(
          'mt-7 w-full',
          highlighted
            ? 'text-brand-700 hover:bg-brand-50 bg-white'
            : 'bg-brand-700 hover:bg-brand-800 shadow-brand text-white',
        )}
        asChild
      >
        <Link href="/register">Começar com este plano</Link>
      </Button>
    </motion.div>
  )
}

// ─── FAQ item ───────────────────────────────────────────────────
function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      {...fadeUp}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card-base overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="hover:bg-muted/40 flex w-full items-center justify-between gap-4 p-5 text-left transition-colors"
        aria-expanded={open}
      >
        <span className="font-display text-foreground text-sm font-semibold sm:text-base">
          {question}
        </span>
        <ChevronDown
          className={cn(
            'text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="border-border/60 text-muted-foreground border-t px-5 pb-5 pt-4 text-sm leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main component ─────────────────────────────────────────────
export function LandingPage() {
  const router = useRouter()
  const [isPWA, setIsPWA] = useState(false)

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
      {/* ── Header ─────────────────────────────────────────────── */}
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

          <nav className="hidden items-center gap-6 text-sm sm:flex">
            <TopNavLink href="#funcionalidades">Funcionalidades</TopNavLink>
            <TopNavLink href="#como-funciona">Como funciona</TopNavLink>
            <TopNavLink href="#planos">Planos</TopNavLink>
            <TopNavLink href="#faq">FAQ</TopNavLink>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button
              size="sm"
              className="bg-brand-700 hover:bg-brand-800 shadow-brand text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(43,181,171,0.32)]"
              asChild
            >
              <Link href="/register">Começar grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO — Minimalist ───────────────────────────────── */}
        <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pt-14 text-center">
          <HeroMotionBackground />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 max-w-3xl"
          >
            <div className="mx-auto mb-8 !inline-flex !p-3">
              <ProductLogo
                variant="full"
                className="w-[372px] max-w-[calc(100vw-2rem)]"
                imageClassName="h-auto w-full"
                priority
              />
            </div>

            <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Chega de cobrar confirmação
              <span className="text-gradient block"> de plantão pelo WhatsApp</span>
            </h1>

            <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
              Reduza de 4 horas para 30 minutos por semana o tempo gasto com sua escala médica.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="bg-brand-700 shadow-brand hover:bg-brand-800 w-full gap-2 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(43,181,171,0.34)] sm:w-auto"
                asChild
              >
                <Link href="/register">
                  Testar 7 dias grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hover:bg-brand-50 hover:border-brand-200 w-full transition-all duration-300 sm:w-auto"
                asChild
              >
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-muted-foreground relative z-10 mt-14 flex flex-wrap items-center justify-center gap-3 text-sm"
          >
            {['Sem cartão de crédito', 'Configurado em 24h', 'Conforme LGPD'].map((item) => (
              <span
                key={item}
                className="border-border/60 bg-card/80 flex items-center gap-1.5 rounded-full border px-3 py-1.5 shadow-sm backdrop-blur"
              >
                <CheckCircle2 className="text-brand-600 h-3.5 w-3.5" />
                {item}
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="pointer-events-none absolute left-1/2 top-[68%] z-10 hidden w-full max-w-5xl -translate-x-1/2 px-6 lg:block"
          >
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
              className="border-border/70 bg-white/88 absolute right-6 top-10 max-w-[290px] rounded-2xl border p-4 text-left shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur"
            >
              <p className="text-brand-700 text-[11px] font-semibold uppercase tracking-widest">
                Confirmação
              </p>
              <p className="text-foreground mt-1 text-xl font-bold">&lt; 2 min</p>
              <div className="mt-3 grid grid-cols-8 gap-1">
                {[38, 55, 47, 68, 58, 76, 72, 84].map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="bg-brand-100 overflow-hidden rounded-sm"
                    style={{ height: 26 }}
                  >
                    <div
                      className="bg-brand-500/80 w-full rounded-sm"
                      style={{ height: `${item}%`, marginTop: `${100 - item}%` }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── MÉTRICAS / SOCIAL PROOF ─────────────────────────── */}
        <section className="border-border/60 bg-muted/30 border-y px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.4 }}
              className="text-muted-foreground mb-10 text-center text-sm font-medium uppercase tracking-widest"
            >
              Hospitais, UPAs e clínicas especializadas que substituíram planilhas e WhatsApp
            </motion.p>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: '30 min', label: 'de gestão por semana em média', icon: Clock },
                { value: '100%', label: 'das confirmações rastreadas', icon: ShieldCheck },
                { value: '< 2 min', label: 'para um médico confirmar plantão', icon: Zap },
                { value: '24h', label: 'para sua primeira escala no ar', icon: Calendar },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  {...fadeUp}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <stat.icon className="text-brand-600 dark:text-brand-400 mx-auto mb-2 h-5 w-5" />
                  <p className="font-display text-foreground text-3xl font-bold">{stat.value}</p>
                  <p className="text-muted-foreground mt-1 text-xs leading-tight">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROBLEMA ────────────────────────────────────────── */}
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mb-16 text-center">
              <SectionLabel>O problema real</SectionLabel>
              <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                WhatsApp e planilha têm um custo
                <br className="hidden sm:block" /> que não aparece no relatório
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-relaxed">
                73% dos hospitais brasileiros ainda gerenciam escalas de plantão por grupos de
                mensagem e planilhas compartilhadas. O resultado: horas perdidas, cobertura
                imprevisível e decisões sem rastreabilidade.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: AlertCircle,
                  title: 'Plantão descoberto às 22h',
                  description:
                    'Sem visibilidade de cobertura em tempo real, a lacuna aparece tarde demais. Quando o turno já começou.',
                },
                {
                  icon: MessageSquareOff,
                  title: '"Pode contar comigo" não é confirmação',
                  description:
                    'Confirmações verbais ou por mensagem somem da memória. E do histórico. Não há prova, não há responsabilização.',
                },
                {
                  icon: ClipboardX,
                  title: 'Troca informal que ninguém registrou',
                  description:
                    'O médico trocou, o colega assumiu, o gestor não aprovou e o financeiro não sabe. Isso vira passivo operacional.',
                },
                {
                  icon: TrendingDown,
                  title: 'Custo por plantão invisível até o fechamento',
                  description:
                    'Sem integração entre escala e financeiro, calcular custo por especialidade e setor leva dias — e costuma ter erro.',
                },
                {
                  icon: Eye,
                  title: 'Escala publicada sem confirmação de leitura',
                  description:
                    'Enviar a escala para o grupo não garante que foi vista. E quando ninguém aparece, a culpa fica sem endereço.',
                },
                {
                  icon: RefreshCw,
                  title: '4 a 6 horas por semana só para organizar',
                  description:
                    'Ligar para confirmar, checar planilha, atualizar manualmente. Tempo de coordenação desperdiçado toda semana.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  {...fadeUp}
                  transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="card-base flex gap-4 p-5"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-foreground text-sm font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PARA QUEM ────────────────────────────────────────── */}
        <section className="bg-muted/30 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mb-16 text-center">
              <SectionLabel>Para quem é</SectionLabel>
              <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Uma plataforma, três perspectivas
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base">
                Cada perfil enxerga o que precisa. Todos trabalham na mesma informação, em tempo
                real.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Building2,
                  role: 'Direção Clínica',
                  headline: 'Visão estratégica de cobertura e custo',
                  items: [
                    'Dashboard consolidado por unidade e especialidade',
                    'Custo projetado por turno antes do fechamento',
                    'Histórico auditável de todas as decisões',
                    'Relatórios prontos para ANVISA e CFM',
                    'Indicadores de ocupação e absenteísmo',
                  ],
                },
                {
                  icon: Users,
                  role: 'Coordenação',
                  headline: 'Controle total sem trabalho manual',
                  items: [
                    'Publicação de escala em poucos cliques',
                    'Convocação por especialidade e setor',
                    'Confirmações recebidas em tempo real',
                    'Alertas automáticos para vagas abertas',
                    'Aprovação de trocas com histórico',
                  ],
                },
                {
                  icon: Smartphone,
                  role: 'Médico e Profissional',
                  headline: 'Tudo resolvido direto do celular',
                  items: [
                    'Notificação push com detalhes do plantão',
                    'Confirmação em 1 toque, sem login extra',
                    'Solicitação e aprovação de trocas',
                    'Calendário pessoal de plantões',
                    'Histórico financeiro por plantão confirmado',
                  ],
                },
              ].map((persona, i) => (
                <motion.div
                  key={persona.role}
                  {...fadeUp}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="card-base flex flex-col p-7"
                >
                  <div className="bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl">
                    <persona.icon className="h-5 w-5" />
                  </div>
                  <p className="text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-widest">
                    {persona.role}
                  </p>
                  <h3 className="font-display text-foreground mt-1.5 text-lg font-bold">
                    {persona.headline}
                  </h3>
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {persona.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="text-brand-600 dark:text-brand-400 mt-0.5 h-4 w-4 shrink-0" />
                        <span className="text-muted-foreground text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FUNCIONALIDADES ──────────────────────────────────── */}
        <section id="funcionalidades" className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            {/* Feature grande 1 — Confirmação */}
            <div className="mb-24 grid items-center gap-12 lg:grid-cols-2">
              <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
                <SectionLabel>Confirmação instantânea</SectionLabel>
                <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  O médico confirma em 1 toque.
                  <br /> Você sabe na hora.
                </h2>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                  Chega de ligar, mandar áudio no WhatsApp e torcer para a mensagem ser vista. O
                  CONFIRMA PLANTÃO notifica o profissional, recebe a confirmação e atualiza o
                  dashboard — tudo em menos de dois minutos.
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {[
                    'Notificação push direto no celular do profissional',
                    'Confirmação com timestamp e registro imutável',
                    'Lembrete automático se não houver resposta em X horas',
                    'Sem necessidade de abrir o app: responde pela notificação',
                    'Confirmação disponível também via e-mail e link direto',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="text-brand-600 dark:text-brand-400 mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="card-base overflow-hidden p-6"
              >
                <div className="bg-muted/60 dark:bg-muted/30 rounded-xl p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <BellRing className="text-brand-600 h-5 w-5" />
                    <span className="font-display text-foreground text-sm font-semibold">
                      Notificação de Plantão
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Setor', value: 'UTI Adulto — Leitos 1 a 10' },
                      { label: 'Data', value: 'Sábado, 22 fev — 07h às 19h' },
                      { label: 'Especialidade', value: 'Médico Intensivista' },
                      { label: 'Valor', value: 'R$ 1.800,00' },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="text-foreground font-medium">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-center gap-1.5 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white">
                      <Check className="h-4 w-4" />
                      Confirmar
                    </div>
                    <div className="border-border bg-background text-muted-foreground flex items-center justify-center rounded-xl border py-2.5 text-sm font-medium">
                      Recusar
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-3 text-center text-xs">
                    Confirmado por Dr. Rafael Mendes • 14h23 • há 2 min
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Feature grande 2 — Dashboard */}
            <div className="mb-24 grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                {...fadeUp}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="card-base overflow-hidden p-6 lg:order-1"
              >
                <div className="bg-muted/60 dark:bg-muted/30 rounded-xl p-4">
                  <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
                    Cobertura — Semana atual
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { turno: 'UTI Adulto — Seg', confirmados: 3, total: 3, cor: 'bg-green-500' },
                      {
                        turno: 'Pronto-Socorro — Ter',
                        confirmados: 2,
                        total: 3,
                        cor: 'bg-yellow-400',
                      },
                      {
                        turno: 'UTI Pediátrica — Qua',
                        confirmados: 1,
                        total: 2,
                        cor: 'bg-yellow-400',
                      },
                      { turno: 'Cardiologia — Qui', confirmados: 0, total: 2, cor: 'bg-red-500' },
                      { turno: 'UTI Adulto — Sex', confirmados: 3, total: 3, cor: 'bg-green-500' },
                    ].map((item) => (
                      <div key={item.turno} className="flex items-center gap-3 text-xs">
                        <div className={cn('h-2 w-2 shrink-0 rounded-full', item.cor)} />
                        <span className="text-foreground flex-1">{item.turno}</span>
                        <span className="text-muted-foreground">
                          {item.confirmados}/{item.total} conf.
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Alerta: Cardiologia — Qui sem cobertura
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="lg:order-2">
                <SectionLabel>Cobertura em tempo real</SectionLabel>
                <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Veja lacunas antes que
                  <br /> virem crises assistenciais.
                </h2>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                  O dashboard mostra o status de cobertura de cada turno por setor, especialidade e
                  unidade. Quando um plantão está em risco, você recebe o alerta — não descobre
                  quando o médico não aparece.
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {[
                    'Mapa de cobertura com status por cor (verde / amarelo / vermelho)',
                    'Alertas automáticos para turnos sem confirmação próximos ao prazo',
                    'Visão por especialidade, setor e unidade',
                    'Histórico de cobertura para benchmarks internos',
                    'Exportação em PDF para reuniões de direção',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="text-brand-600 dark:text-brand-400 mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Feature grande 3 — Financeiro */}
            <div className="mb-24 grid items-center gap-12 lg:grid-cols-2">
              <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
                <SectionLabel>Financeiro integrado</SectionLabel>
                <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Custo de plantão calculado.
                  <br /> Sem planilha extra.
                </h2>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                  Configure o valor por turno, especialidade e setor. O sistema acumula
                  automaticamente por profissional e mês. No fechamento, os relatórios já estão
                  prontos para pagamento — sem cruzamento manual de dados.
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {[
                    'Valor por plantão configurável por especialidade',
                    'Acúmulo automático por profissional e mês',
                    'Relatório de custo por setor e unidade',
                    'Exportação em Excel para financeiro e contabilidade',
                    'Auditoria de pagamentos com rastreio completo',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="text-brand-600 dark:text-brand-400 mt-0.5 h-4 w-4 shrink-0" />
                      <span className="text-muted-foreground text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="card-base overflow-hidden p-6"
              >
                <div className="bg-muted/60 dark:bg-muted/30 rounded-xl p-4">
                  <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
                    Financeiro — Fevereiro 2026
                  </p>
                  <div className="space-y-2">
                    {[
                      { medico: 'Dr. Rafael Mendes', plantoes: 8, valor: 'R$ 14.400' },
                      { medico: 'Dra. Ana Costa', plantoes: 6, valor: 'R$ 10.800' },
                      { medico: 'Dr. Bruno Lima', plantoes: 5, valor: 'R$ 9.000' },
                      { medico: 'Dra. Carla Freitas', plantoes: 7, valor: 'R$ 12.600' },
                    ].map((row) => (
                      <div key={row.medico} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-foreground font-medium">{row.medico}</p>
                          <p className="text-muted-foreground text-xs">
                            {row.plantoes} plantões confirmados
                          </p>
                        </div>
                        <span className="text-foreground font-semibold">{row.valor}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-border mt-4 flex items-center justify-between border-t pt-3 text-sm">
                    <span className="text-muted-foreground font-medium">Total do mês</span>
                    <span className="font-display text-foreground text-lg font-bold">
                      R$ 46.800
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Grid de funcionalidades menores */}
            <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mb-12 text-center">
              <SectionLabel>Tudo que você precisa</SectionLabel>
              <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Cada detalhe pensado para a saúde
              </h2>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={ArrowLeftRight}
                title="Trocas com rastreabilidade"
                description="Profissional solicita troca no app. Gestor aprova em 1 clique. Histórico completo de toda substituição, com responsável identificado."
                delay={0}
              />
              <FeatureCard
                icon={BellRing}
                title="Notificações inteligentes"
                description="Lembrete automático para o médico antes do plantão. Alerta para o gestor quando o prazo de confirmação vence. Notificação via push, e-mail e in-app."
                delay={0.06}
              />
              <FeatureCard
                icon={BarChart3}
                title="Relatórios e analytics"
                description="Taxa de ocupação por turno, absenteísmo por profissional, custo histórico por setor. Dados prontos para reuniões de direção e auditorias."
                delay={0.12}
              />
              <FeatureCard
                icon={FileText}
                title="Auditoria completa"
                description="Cada publicação, confirmação, recusa e cancelamento fica registrado com timestamp. Conformidade com requisitos de ANVISA, CFM e auditoria interna."
                delay={0.18}
              />
              <FeatureCard
                icon={Wallet}
                title="Controle de pagamentos"
                description="Status de pagamento por profissional e plantão. Marque como pago, exporte para contabilidade e elimine discrepâncias no fechamento mensal."
                delay={0.24}
              />
              <FeatureCard
                icon={Users}
                title="Multi-perfil e multi-unidade"
                description="Gestores por unidade, coordenadores por setor, visão consolidada para a direção. Cada perfil enxerga o que é relevante para sua responsabilidade."
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ────────────────────────────────────── */}
        <section id="como-funciona" className="bg-muted/30 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mb-16 text-center">
              <SectionLabel>Como funciona</SectionLabel>
              <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Da planilha para o controle total.
                <br /> Em 5 passos.
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base">
                Sem migração complexa, sem treinamento demorado. Sua equipe opera no mesmo dia.
              </p>
            </motion.div>

            <div className="relative">
              <div className="bg-border absolute left-5 top-6 hidden h-[calc(100%-3rem)] w-px sm:block lg:left-1/2" />

              <div className="space-y-10">
                {[
                  {
                    step: '01',
                    title: 'Configure sua estrutura em 30 minutos',
                    description:
                      'Cadastre unidades, setores, especialidades e o time de profissionais. Importação em lote disponível — sem trabalho duplicado.',
                    detail: 'Locais · Setores · Especialidades · Equipe',
                  },
                  {
                    step: '02',
                    title: 'Monte e publique a escala do mês',
                    description:
                      'Crie turnos por data, horário e especialidade. Defina o valor por plantão. Publique com um clique — os profissionais são notificados instantaneamente.',
                    detail: 'Turnos · Horários · Valor · Publicação',
                  },
                  {
                    step: '03',
                    title: 'Profissionais confirmam direto do celular',
                    description:
                      'Cada médico recebe a notificação com todos os detalhes do plantão. Confirma em 1 toque. Nenhuma ligação necessária.',
                    detail: 'Push notification · 1 toque · Rastreado',
                  },
                  {
                    step: '04',
                    title: 'Acompanhe cobertura em tempo real',
                    description:
                      'O dashboard mostra quem confirmou, quem está pendente e onde há lacuna. Alertas automáticos aparecem antes que o problema ocorra.',
                    detail: 'Dashboard · Alertas · Ação preventiva',
                  },
                  {
                    step: '05',
                    title: 'Feche o mês com relatórios prontos',
                    description:
                      'Relatório financeiro por profissional e setor gerado automaticamente. Histórico completo para auditoria. Exportação em PDF e Excel.',
                    detail: 'Financeiro · Auditoria · Exportação',
                  },
                ].map((step, i) => (
                  <motion.div
                    key={step.step}
                    {...fadeUp}
                    transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative grid gap-4 sm:grid-cols-[2rem_1fr] lg:grid-cols-[1fr_2rem_1fr]"
                  >
                    {/* Número do passo */}
                    <div
                      className={cn(
                        'flex items-start gap-4 sm:flex-col sm:items-center',
                        i % 2 === 0 ? 'lg:col-start-1 lg:text-right' : 'lg:col-start-3',
                      )}
                    >
                      <div className="border-brand-600 bg-background text-brand-600 relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold sm:mx-auto lg:mx-0">
                        {step.step}
                      </div>
                      <div className={cn(i % 2 === 0 ? 'lg:text-right' : '')}>
                        <h3 className="font-display text-foreground text-base font-bold sm:text-lg">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                          {step.description}
                        </p>
                        <p className="text-brand-600 dark:text-brand-400 mt-2 text-xs font-medium">
                          {step.detail}
                        </p>
                      </div>
                    </div>

                    {/* Conector central (apenas desktop) */}
                    <div className="hidden lg:col-start-2 lg:flex lg:justify-center lg:pt-1">
                      <div className="border-brand-600 bg-background text-brand-600 relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold">
                        {step.step}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-12 text-center"
            >
              <Button
                size="lg"
                className="bg-brand-700 shadow-brand hover:bg-brand-800 gap-2 text-white"
                asChild
              >
                <Link href="/register">
                  Começar agora, gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* ── SEGURANÇA E LGPD ────────────────────────────────── */}
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
                <SectionLabel>Segurança e conformidade</SectionLabel>
                <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Dados de saúde merecem
                  <br /> proteção de saúde.
                </h2>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                  A gestão de escalas envolve dados sensíveis de profissionais e pacientes. Cada
                  camada do CONFIRMA PLANTÃO foi construída com segurança, privacidade e
                  conformidade regulatória como prioridade — não como afterthought.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    {
                      icon: Lock,
                      title: 'Criptografia AES-256 em repouso',
                      desc: 'Todos os dados armazenados com criptografia de nível bancário.',
                    },
                    {
                      icon: ShieldCheck,
                      title: 'Conformidade LGPD completa',
                      desc: 'Gestão de consentimento, exportação e exclusão de dados por usuário.',
                    },
                    {
                      icon: Eye,
                      title: 'Isolamento por organização (RLS)',
                      desc: 'Nenhum dado de um hospital é acessível por outro. Row-level security no banco.',
                    },
                    {
                      icon: FileText,
                      title: 'Logs de auditoria por 6 meses',
                      desc: 'Trilha completa de acessos e alterações, disponível para auditoria regulatória.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-semibold">{item.title}</p>
                        <p className="text-muted-foreground mt-0.5 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { icon: ShieldCheck, label: 'LGPD', desc: 'Conforme Lei 13.709/2018' },
                  { icon: Lock, label: 'JWT + 2FA', desc: 'Autenticação reforçada' },
                  { icon: Eye, label: 'RLS no banco', desc: 'Isolamento por organização' },
                  { icon: FileText, label: 'Audit trail', desc: 'Rastreabilidade completa' },
                  { icon: Zap, label: '99.9% uptime', desc: 'SLA de disponibilidade' },
                  { icon: Users, label: 'Perfis granulares', desc: 'Permissões por função' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    {...fadeUp}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="card-base flex flex-col items-center p-5 text-center"
                  >
                    <div className="bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 mb-3 flex h-10 w-10 items-center justify-center rounded-xl">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <p className="font-display text-foreground text-sm font-bold">{item.label}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── PLANOS ───────────────────────────────────────────── */}
        <section id="planos" className="bg-muted/30 px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mb-4 text-center">
              <SectionLabel>Planos</SectionLabel>
              <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Simples de entender. Fácil de escalar.
              </h2>
              <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base">
                Todos os planos incluem o período de teste gratuito. Sem cartão de crédito para
                começar.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <PricingPlan
                name="Básico"
                price="R$ 297"
                description="Ideal para clínicas e equipes menores que querem sair das planilhas."
                professionals={15}
                locations={1}
                managers={2}
                features={[
                  'Publicação e gestão de escalas',
                  'Confirmação de plantão por push e e-mail',
                  'Dashboard de cobertura em tempo real',
                  'Gestão de trocas rastreada',
                  'Relatório financeiro mensal',
                  'Suporte por e-mail',
                ]}
                delay={0}
              />
              <PricingPlan
                name="Premium"
                price="R$ 597"
                description="Para hospitais com múltiplas unidades e equipes maiores."
                professionals={30}
                locations={2}
                managers={3}
                features={[
                  'Tudo do plano Básico',
                  'Multi-unidade com visão consolidada',
                  'Alertas automáticos de cobertura crítica',
                  'Relatórios exportáveis em PDF e Excel',
                  'Controle de pagamentos por profissional',
                  'Suporte prioritário com SLA',
                ]}
                highlighted
                delay={0.1}
              />
              <PricingPlan
                name="Enterprise"
                price="R$ 1.197"
                description="Para redes hospitalares e operações complexas de grande escala."
                professionals={100}
                locations={8}
                managers={10}
                features={[
                  'Tudo do plano Premium',
                  'Até 8 unidades e 100 profissionais',
                  'Onboarding dedicado e treinamento',
                  'Relatórios de auditoria para ANVISA/CFM',
                  'Integração via API (HIS e sistemas legados)',
                  'Gerente de conta exclusivo',
                ]}
                delay={0.2}
              />
            </div>

            <motion.p
              {...fadeUp}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-muted-foreground mt-8 text-center text-sm"
            >
              Precisa de capacidade acima de 100 profissionais ou integração personalizada?{' '}
              <Link href="/register" className="text-brand-600 dark:text-brand-400 hover:underline">
                Fale com nosso time
              </Link>
            </motion.p>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────── */}
        <section id="faq" className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <motion.div {...fadeUp} transition={{ duration: 0.4 }} className="mb-12 text-center">
              <SectionLabel>Dúvidas frequentes</SectionLabel>
              <h2 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Perguntas que todo gestor faz antes de decidir
              </h2>
            </motion.div>

            <div className="space-y-3">
              {[
                {
                  question: 'Quanto tempo leva para colocar a primeira escala no ar?',
                  answer:
                    'A maioria das equipes coloca a primeira escala no ar em menos de 24 horas. O cadastro inicial leva cerca de 30 minutos para configurar unidades, setores e profissionais. O suporte está disponível para ajudar em cada etapa.',
                },
                {
                  question: 'Os médicos precisam baixar algum aplicativo?',
                  answer:
                    'O CONFIRMA PLANTÃO funciona como PWA (Progressive Web App), o que significa que o médico pode confirmar plantões diretamente pelo navegador do celular, sem precisar instalar nada. O link chega pela notificação push ou e-mail.',
                },
                {
                  question: 'Como funciona a migração das planilhas atuais?',
                  answer:
                    'Oferecemos importação em lote via Excel para profissionais, setores e escalas históricas. Você não precisa redigitar dado por dado. O time de suporte acompanha o processo nos planos Premium e Enterprise.',
                },
                {
                  question: 'O sistema funciona offline?',
                  answer:
                    'O dashboard e o painel de gestão requerem conexão. As confirmações dos médicos chegam via push notification, que funciona mesmo com sinal fraco. O app armazena dados localmente para reconectar e sincronizar quando a conexão for restabelecida.',
                },
                {
                  question: 'Tem integração com sistemas HIS (prontuário eletrônico)?',
                  answer:
                    'A API de integração está disponível para os planos Enterprise. Ela permite sincronizar profissionais, escalas e confirmações com sistemas como MV, Tasy, Soul MV e outros HIS. Fale com o time para avaliar sua operação.',
                },
                {
                  question: 'E se o médico não tiver smartphone ou acesso fácil à internet?',
                  answer:
                    'Além do push e do app mobile, o sistema envia notificações por e-mail com link de confirmação que funciona em qualquer dispositivo. Para casos específicos, o gestor pode confirmar plantões manualmente pelo painel de administração.',
                },
                {
                  question: 'Como a plataforma garante conformidade com LGPD?',
                  answer:
                    'O CONFIRMA PLANTÃO opera com isolamento de dados por organização (row-level security), coleta de consentimento no cadastro, logs de acesso e auditoria, além de APIs para exportação e exclusão de dados. Toda a infraestrutura é hospedada com criptografia AES-256.',
                },
                {
                  question: 'Posso cancelar a qualquer momento?',
                  answer:
                    'Sim. Não há fidelidade ou multa de cancelamento. Você cancela pelo painel a qualquer momento e continua com acesso até o final do período já pago. Todos os seus dados podem ser exportados antes do encerramento.',
                },
              ].map((item, i) => (
                <FaqItem key={item.question} {...item} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────── */}
        <section className="px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.4 }}
              className="from-brand-700 via-brand-600 to-brand-800 shadow-brand relative overflow-hidden rounded-3xl bg-gradient-to-br p-10 text-center text-white sm:p-16"
            >
              {/* Decorative glow */}
              <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10">
                <SectionLabel>
                  <span className="text-brand-200">Teste gratuito</span>
                </SectionLabel>
                <h2 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Comece com um mês real.
                  <br /> Sem compromisso.
                </h2>
                <p className="text-brand-100/90 mx-auto mt-4 max-w-lg text-base">
                  Configure sua primeira escala em menos de 24 horas. Veja o time confirmar plantões
                  antes de terminar a semana. Cancele quando quiser — sem perguntas.
                </p>

                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    size="lg"
                    className="text-brand-700 hover:bg-brand-50 w-full gap-2 bg-white sm:w-auto"
                    asChild
                  >
                    <Link href="/register">
                      Começar gratuitamente
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="w-full border border-white/30 text-white hover:bg-white/10 sm:w-auto"
                    asChild
                  >
                    <Link href="/faq">Ver todas as dúvidas</Link>
                  </Button>
                </div>

                <div className="text-brand-200 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
                  {[
                    'Sem cartão de crédito',
                    'Implementação em 24h',
                    'Cancele quando quiser',
                    'Conforme LGPD',
                  ].map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-border/60 border-t px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="logo-container-light !shadow-subtle !rounded-lg !p-1">
                  <ProductLogo variant="mark" className="h-5 w-5" imageClassName="h-full w-full" />
                </div>
                <span className="font-display text-foreground font-bold">{BRAND_NAME}</span>
              </div>
              <p className="text-muted-foreground mt-3 max-w-xs text-sm leading-relaxed">
                Plataforma de gestão de escalas e confirmação de plantões para hospitais, UPAs e
                clínicas.
              </p>
            </div>

            {/* Produto */}
            <div>
              <p className="text-foreground mb-3 text-sm font-semibold">Produto</p>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'Funcionalidades', href: '#funcionalidades' },
                  { label: 'Como funciona', href: '#como-funciona' },
                  { label: 'Planos e preços', href: '#planos' },
                  { label: 'FAQ', href: '#faq' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-foreground mb-3 text-sm font-semibold">Legal e privacidade</p>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'Política de privacidade', href: '/privacy' },
                  { label: 'Termos de uso', href: '/terms' },
                  { label: 'LGPD', href: '/lgpd' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conta */}
            <div>
              <p className="text-foreground mb-3 text-sm font-semibold">Acesso</p>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'Criar conta', href: '/register' },
                  { label: 'Entrar na plataforma', href: '/login' },
                  { label: 'Esqueci a senha', href: '/forgot-password' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-border/60 text-muted-foreground mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm sm:flex-row">
            <p>© 2026 {BRAND_NAME}. Todos os direitos reservados.</p>
            <p className="text-xs">Feito para quem cuida de quem cuida.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
