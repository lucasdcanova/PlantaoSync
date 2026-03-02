'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Lock,
  MessageSquareOff,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import { ProductLogo } from '@/components/brand/product-logo'
import { Button } from '@/components/ui/button'
import { BRAND_NAME } from '@/lib/brand'
import { cn } from '@/lib/utils'

const landingEase = [0.22, 1, 0.36, 1] as const

const landingViewport = {
  once: true,
  amount: 0.24,
} as const

const revealUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: landingViewport,
}

const heroStats = [
  { value: '30 min', label: 'tempo médio semanal da coordenação para fechar escala', icon: Clock },
  { value: '< 2 min', label: 'confirmação de plantão pelo profissional', icon: Zap },
  { value: '100%', label: 'das decisões registradas com rastreabilidade', icon: ShieldCheck },
  { value: '24h', label: 'para colocar a primeira unidade no ar', icon: Calendar },
]

const pillarFeatures = [
  {
    icon: BellRing,
    title: 'Convocação instantânea',
    description:
      'Publicou a escala, notificou o profissional, recebeu confirmação em tempo real. Sem cobrança manual.',
    items: ['Push, e-mail e in-app', 'Confirmação com timestamp', 'Lembretes automáticos'],
  },
  {
    icon: ArrowLeftRight,
    title: 'Trocas sob controle',
    description:
      'Toda troca passa por solicitação, aprovação e histórico. Nada fica informal ou fora do sistema.',
    items: ['Fluxo aprovado por gestor', 'Histórico auditável', 'Alertas para turnos críticos'],
  },
  {
    icon: BarChart3,
    title: 'Cobertura em tempo real',
    description:
      'Acompanhe risco de lacuna por setor e especialidade com visual claro para ação rápida da coordenação.',
    items: ['Status por cor', 'Visão por unidade', 'Indicadores semanais'],
  },
  {
    icon: Wallet,
    title: 'Financeiro integrado',
    description:
      'Fechamento por profissional e por unidade sem planilha paralela. Exportação pronta para pagamento.',
    items: ['Custo por plantão', 'Fechamento mensal', 'Exportação Excel/PDF'],
  },
]

const testimonials = [
  {
    quote:
      'Antes, passávamos a noite caçando confirmação no WhatsApp. Hoje, a cobertura aparece em tempo real no painel.',
    name: 'Dra. Mariana Castro',
    role: 'Coordenadora médica · Hospital regional',
  },
  {
    quote:
      'O tempo que a equipe perdeu por anos em planilha virou hora de gestão clínica de verdade. Foi uma virada operacional.',
    name: 'Carlos Henrique M.',
    role: 'Gerente de operações · Rede de clínicas',
  },
  {
    quote:
      'A rastreabilidade das trocas e confirmações trouxe segurança para auditoria e eliminou discussão no fechamento.',
    name: 'Fernanda Ribeiro',
    role: 'Diretora administrativa · UPA metropolitana',
  },
]

const pricingPlans = [
  {
    name: 'Básico',
    price: 'R$ 297',
    subtitle: 'Para clínicas e equipes em início de digitalização.',
    highlights: ['15 profissionais', '1 unidade', '2 gestores'],
    features: [
      'Publicação e confirmação de escalas',
      'Gestão de trocas com histórico',
      'Dashboard de cobertura em tempo real',
      'Relatório financeiro mensal',
      'Suporte por e-mail',
    ],
    featured: false,
  },
  {
    name: 'Premium',
    price: 'R$ 597',
    subtitle: 'Para hospitais e operações com múltiplos setores críticos.',
    highlights: ['30 profissionais', '2 unidades', '3 gestores'],
    features: [
      'Tudo do plano Básico',
      'Visão consolidada multi-unidade',
      'Alertas inteligentes de cobertura',
      'Exportação avançada PDF/Excel',
      'Suporte prioritário',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'R$ 1.197',
    subtitle: 'Para redes hospitalares com alta complexidade operacional.',
    highlights: ['100 profissionais', '8 unidades', '10 gestores'],
    features: [
      'Tudo do plano Premium',
      'Onboarding dedicado',
      'Integração via API',
      'Gestor de conta exclusivo',
      'Relatórios para auditoria regulatória',
    ],
    featured: false,
  },
]

const faqItems = [
  {
    question: 'Quanto tempo leva para colocar a primeira escala no ar?',
    answer:
      'A maioria das equipes publica a primeira escala em menos de 24 horas. O setup inicial costuma levar cerca de 30 minutos por unidade.',
  },
  {
    question: 'Os profissionais precisam instalar aplicativo?',
    answer:
      'Não necessariamente. O fluxo funciona por PWA e web mobile, com confirmação por notificação e link direto.',
  },
  {
    question: 'Como funciona a migração das planilhas atuais?',
    answer:
      'Você pode importar profissionais, setores e histórico via planilha. Nos planos Premium e Enterprise o time acompanha a migração.',
  },
  {
    question: 'Tem integração com sistemas hospitalares?',
    answer:
      'Sim, no plano Enterprise via API, para sincronizar dados com sistemas legados e fluxos administrativos.',
  },
  {
    question: 'Como vocês tratam LGPD e segurança?',
    answer:
      'Com isolamento de dados por organização, trilha de auditoria, controle de acesso por perfil e criptografia de dados.',
  },
]

function SectionIntro({
  title,
  subtitle,
  light = true,
}: {
  title: React.ReactNode
  subtitle: string
  light?: boolean
}) {
  return (
    <motion.div {...revealUp} transition={{ duration: 0.5, ease: landingEase }} className="mx-auto mb-12 max-w-3xl text-center">
      <h2
        className={cn(
          'text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl',
          light ? 'text-[#111318]' : 'text-white',
        )}
      >
        {title}
      </h2>
      <p className={cn('mx-auto mt-4 max-w-2xl text-base leading-relaxed md:text-lg', light ? 'text-[#556070]' : 'text-[#c4d0d8]')}>
        {subtitle}
      </p>
    </motion.div>
  )
}

function MetricChip({
  value,
  label,
  icon: Icon,
}: {
  value: string
  label: string
  icon: React.ElementType
}) {
  return (
    <motion.div
      {...revealUp}
      transition={{ duration: 0.45, ease: landingEase }}
      className="rounded-2xl border border-[#dbe3ea] bg-white/85 p-4 text-center shadow-[0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur"
    >
      <Icon className="mx-auto mb-2 h-5 w-5 text-[#2bb5ab]" />
      <p className="text-2xl font-bold text-[#111318]">{value}</p>
      <p className="mt-1 text-xs leading-relaxed text-[#66758a]">{label}</p>
    </motion.div>
  )
}

export function LandingPage() {
  const router = useRouter()
  const [isPWA, setIsPWA] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    if (isStandalone) {
      setIsPWA(true)
      router.replace('/login')
    }
  }, [router])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setShowScrollTop(y > 520)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (isPWA) return null

  return (
    <MotionConfig transition={{ duration: 0.42, ease: landingEase }} reducedMotion="user">
      <div className="min-h-screen overflow-x-hidden bg-[#f8fafb] text-[#111318]">
        <main>
          <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-white px-4 text-center">
            <div className="pointer-events-none absolute inset-0">
              <video
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-[13px]"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
              >
                <source src="/videos/hero-bg-crop10.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-white/58" />
              <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#f7fafb]/85 to-transparent" />
              <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#deebea]/55 blur-3xl" />
              <div className="absolute -right-24 bottom-14 h-80 w-80 rounded-full bg-[#edf1f2]/70 blur-3xl" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.56, ease: landingEase }}
              className="relative z-10 mx-auto max-w-4xl"
            >
              <div className="mx-auto mb-8 inline-flex">
                <ProductLogo variant="full" className="w-[min(86vw,430px)]" imageClassName="h-auto w-full" priority />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#111318] sm:text-3xl md:text-3xl lg:text-4xl">
                Gestão de plantões com previsibilidade.
                <span className="mt-1 block text-[#5f7f7c]">
                  Controle operacional para hospitais e redes assistenciais.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#5e6a7b] sm:text-lg">
                O Confirma Plantão centraliza publicação, confirmação, trocas e fechamento financeiro
                em um único fluxo, com rastreabilidade em tempo real.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Button
                  size="lg"
                  className="w-full bg-[#111318] text-white hover:bg-[#1f2937] sm:w-auto"
                  onClick={() => scrollToSection('como-funciona')}
                >
                  Conhecer <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-[#bcc9d5] bg-white/80 text-[#111318] hover:bg-white sm:w-auto"
                >
                  <Link href="/login">Entrar</Link>
                </Button>
              </div>

            </motion.div>

            <motion.button
              type="button"
              onClick={() => scrollToSection('painel-operacional')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.4, ease: landingEase }}
              className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[#6a7586] transition-colors hover:text-[#2bb5ab]"
              aria-label="Descer para a próxima seção"
            >
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em]">Descubra</span>
              <motion.span
                className="mt-1 block"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="mx-auto h-4 w-4" />
              </motion.span>
            </motion.button>
          </section>

          <section id="como-funciona" className="border-y border-[#dde6ed] bg-[#eef4f7] px-4 py-14 sm:px-6">
            <div className="mx-auto max-w-6xl">
              <motion.p
                {...revealUp}
                transition={{ duration: 0.45, ease: landingEase }}
                className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#68788e]"
              >
                Estrutura completa para gestão de plantões em hospitais, UPAs e clínicas
              </motion.p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {heroStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={landingViewport}
                    transition={{ delay: index * 0.06, duration: 0.42, ease: landingEase }}
                  >
                    <MetricChip {...stat} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="painel-operacional" className="bg-[#13181c] px-4 py-20 text-white sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <SectionIntro
                title={
                  <>
                    Cobertura em tempo real
                    <span className="block text-[#8de0da]">com leitura clara para agir rápido</span>
                  </>
                }
                subtitle="Visualize turnos confirmados, pendências e risco assistencial em um único painel. Sem depender de planilha paralela."
                light={false}
              />

              <div className="grid items-stretch gap-6 lg:grid-cols-2">
                <motion.div
                  {...revealUp}
                  transition={{ duration: 0.5, ease: landingEase }}
                  className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#e5f6f4]">Cobertura da semana</p>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                      87% confirmada
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { unit: 'UTI Adulto · Seg 07h', status: 'Confirmado', value: 100, color: 'bg-emerald-400' },
                      { unit: 'Pronto-Socorro · Ter 19h', status: 'Em atenção', value: 66, color: 'bg-amber-400' },
                      { unit: 'Cardiologia · Qua 07h', status: 'Sem cobertura', value: 0, color: 'bg-red-400' },
                      { unit: 'UTI Pediátrica · Qui 19h', status: 'Confirmado', value: 100, color: 'bg-emerald-400' },
                      { unit: 'Clínica médica · Sex 07h', status: 'Em atenção', value: 50, color: 'bg-amber-400' },
                    ].map((row, index) => (
                      <motion.div
                        key={row.unit}
                        initial={{ opacity: 0, x: -14 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={landingViewport}
                        transition={{ delay: 0.08 + index * 0.05, duration: 0.35, ease: landingEase }}
                        className="rounded-xl border border-white/10 bg-black/20 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-[#d6e8e9]">{row.unit}</span>
                          <span className="text-[#95a9b6]">{row.status}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div className={cn('h-full rounded-full', row.color)} style={{ width: `${row.value}%` }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  {...revealUp}
                  transition={{ duration: 0.5, delay: 0.1, ease: landingEase }}
                  className="rounded-2xl border border-white/15 bg-[#172127] p-6"
                >
                  <p className="text-sm font-semibold text-[#def4f2]">Alertas de decisão</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: 'Turnos em risco', value: '3', tone: 'bg-red-500/20 text-red-300 border-red-400/30' },
                      { label: 'Pendências > 6h', value: '5', tone: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
                      { label: 'Trocas aguardando', value: '2', tone: 'bg-sky-500/20 text-sky-300 border-sky-400/30' },
                      { label: 'Cobertura crítica', value: '1', tone: 'bg-violet-500/20 text-violet-300 border-violet-400/30' },
                    ].map((item) => (
                      <div key={item.label} className={cn('rounded-xl border px-4 py-3', item.tone)}>
                        <p className="text-xs uppercase tracking-[0.14em]">{item.label}</p>
                        <p className="mt-1 text-2xl font-bold">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-[#2d4a54] bg-black/20 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 text-[#ff8c8c]" />
                      <div>
                        <p className="text-sm font-semibold text-[#f7f9fb]">Cardiologia sem confirmação para quarta às 07h</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#9eb2be]">
                          Envie convocação automática para pool de sobreaviso ou aprove troca pendente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button className="mt-5 w-full bg-[#4ecdc4] font-semibold text-[#0f1a1f] hover:bg-[#5fd8cf]">
                    Abrir painel completo
                  </Button>
                </motion.div>
              </div>
            </div>
          </section>

          <section id="funcionalidades" className="px-4 py-20 sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <motion.div {...revealUp} transition={{ duration: 0.5, ease: landingEase }}>
                  <h3 className="text-3xl font-bold tracking-tight text-[#111318] sm:text-4xl">
                    Publicou a escala,
                    <span className="block text-[#2bb5ab]">a confirmação já começa a acontecer.</span>
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-[#5a6778]">
                    O profissional recebe o plantão com setor, horário e valor. A resposta volta para o painel
                    com timestamp e status atualizado para toda a coordenação.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      'Notificação push com ação direta',
                      'Escalada automática para backup quando não há resposta',
                      'Registro de quem confirmou, recusou ou ignorou',
                      'Histórico para auditoria e governança operacional',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-[#516073]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#2bb5ab]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  {...revealUp}
                  transition={{ duration: 0.5, delay: 0.1, ease: landingEase }}
                  className="rounded-2xl border border-[#dbe5ee] bg-white p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.3)]"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-[#2bb5ab]" />
                    <p className="text-sm font-semibold text-[#111318]">Convocação enviada</p>
                  </div>

                  <div className="rounded-xl border border-[#e2eaf1] bg-[#f6fafc] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6a7688]">Plantão</p>
                    <p className="mt-1 text-lg font-bold text-[#111318]">UTI Adulto · Sábado 07h às 19h</p>

                    <div className="mt-4 space-y-2 text-sm">
                      {[
                        ['Especialidade', 'Intensivista'],
                        ['Unidade', 'Hospital Norte'],
                        ['Valor', 'R$ 1.800,00'],
                        ['Prazo de resposta', 'até 18h de hoje'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-[#6a788a]">{label}</span>
                          <span className="font-medium text-[#111318]">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-emerald-500 px-3 py-2 text-center font-semibold text-white">
                      Confirmado · 14h23
                    </div>
                    <div className="rounded-lg border border-[#d8e2ea] bg-white px-3 py-2 text-center font-medium text-[#536377]">
                      2 em aguardando
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="bg-[#141a1f] px-4 py-20 text-white sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <SectionIntro
                title={
                  <>
                    Recomendações para preencher
                    <span className="block text-[#8de0da]">lacunas sem perder o ritmo da operação</span>
                  </>
                }
                subtitle="Quando há risco de descoberta, o sistema sugere profissionais elegíveis com base em histórico, disponibilidade e especialidade."
                light={false}
              />

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    icon: Sparkles,
                    title: 'Prioridade por aderência',
                    text: 'Ordena profissionais pelo histórico de confirmação para aquele tipo de turno.',
                  },
                  {
                    icon: RefreshCw,
                    title: 'Reconvocação automática',
                    text: 'Se não houver resposta no prazo, reabre lista de backup sem ação manual da coordenação.',
                  },
                  {
                    icon: MessageSquareOff,
                    title: 'Menos ruído operacional',
                    text: 'Centraliza resposta no sistema e evita decisões espalhadas em grupos de mensagem.',
                  },
                ].map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={landingViewport}
                    transition={{ delay: index * 0.08, duration: 0.42, ease: landingEase }}
                    className="rounded-2xl border border-white/12 bg-white/5 p-6"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#9de8e2]">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#b8c7d2]">{card.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <motion.div
                  {...revealUp}
                  transition={{ duration: 0.5, delay: 0.08, ease: landingEase }}
                  className="rounded-2xl border border-[#dbe5ee] bg-white p-6 shadow-[0_18px_46px_-26px_rgba(15,23,42,0.28)]"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-[#2bb5ab]" />
                    <p className="text-sm font-semibold text-[#111318]">Fechamento financeiro automático</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      ['Dra. Ana Costa', '7 plantões', 'R$ 12.600'],
                      ['Dr. Rafael Mendes', '8 plantões', 'R$ 14.400'],
                      ['Dr. Bruno Lima', '5 plantões', 'R$ 9.000'],
                      ['Dra. Carla Freitas', '6 plantões', 'R$ 10.800'],
                    ].map(([name, shifts, value]) => (
                      <div key={name} className="flex items-center justify-between rounded-lg border border-[#e3ebf2] bg-[#f8fbfd] px-3 py-2.5 text-sm">
                        <div>
                          <p className="font-medium text-[#152230]">{name}</p>
                          <p className="text-xs text-[#647488]">{shifts}</p>
                        </div>
                        <p className="font-semibold text-[#0f1b27]">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#e1e9f0] pt-3">
                    <span className="text-sm text-[#657386]">Total projetado do mês</span>
                    <span className="text-xl font-bold text-[#111318]">R$ 46.800</span>
                  </div>
                </motion.div>

                <motion.div {...revealUp} transition={{ duration: 0.5, ease: landingEase }}>
                  <h3 className="text-3xl font-bold tracking-tight text-[#111318] sm:text-4xl">
                    Escala e custo no mesmo fluxo.
                    <span className="block text-[#2bb5ab]">Sem retrabalho no fechamento.</span>
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-[#5a6778]">
                    O sistema acumula valor por plantão confirmado, por profissional e por unidade.
                    Você fecha o mês com previsibilidade e exporta em poucos cliques.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      'Parametrização por especialidade e turno',
                      'Conciliação automática com confirmações reais',
                      'Relatório por unidade, setor e profissional',
                      'Exportação para financeiro e contabilidade',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-[#516073]">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#2bb5ab]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="bg-[#0c141a] px-4 py-20 text-white sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <SectionIntro
                title={
                  <>
                    Processo contínuo de publicação,
                    <span className="block text-[#8de0da]">confirmação e substituição</span>
                  </>
                }
                subtitle="Mesmo em escala dinâmica, sua operação mantém previsibilidade e rastreabilidade ponta a ponta."
                light={false}
              />

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: '1. Publicar escala',
                    text: 'Defina turnos, especialidade e valores por unidade em poucos cliques.',
                    icon: Calendar,
                  },
                  {
                    title: '2. Confirmar plantões',
                    text: 'Profissionais respondem em 1 toque com atualização automática no painel.',
                    icon: BellRing,
                  },
                  {
                    title: '3. Resolver trocas',
                    text: 'Trocas passam por aprovação formal com histórico de cada decisão.',
                    icon: ArrowLeftRight,
                  },
                  {
                    title: '4. Fechar operação',
                    text: 'Consolide cobertura e financeiro com relatório pronto para gestão.',
                    icon: BarChart3,
                  },
                ].map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={landingViewport}
                    transition={{ delay: index * 0.08, duration: 0.4, ease: landingEase }}
                    className="rounded-2xl border border-white/12 bg-white/5 p-5"
                  >
                    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#9de8e2]">
                      <step.icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-base font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#b7c6d0]">{step.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-4 py-20 sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <SectionIntro
                title={
                  <>
                    Design operacional direto,
                    <span className="block text-[#2bb5ab]">para reduzir esforço de coordenação</span>
                  </>
                }
                subtitle="A mesma lógica visual em toda a jornada: identificar risco, agir rápido e registrar tudo."
              />

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {pillarFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={landingViewport}
                    transition={{ delay: index * 0.08, duration: 0.42, ease: landingEase }}
                    className="group rounded-2xl border border-[#dce5ed] bg-white p-5 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.28)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f7f5] text-[#2bb5ab] transition-colors group-hover:bg-[#2bb5ab] group-hover:text-white">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-[#111318]">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#5f6d80]">{feature.description}</p>
                    <ul className="mt-4 space-y-2">
                      {feature.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs text-[#5f6d80]">
                          <Check className="mt-0.5 h-3.5 w-3.5 text-[#2bb5ab]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="para-quem" className="bg-[#eef4f7] px-4 py-20 sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <SectionIntro
                title={
                  <>
                    Três perspectivas,
                    <span className="block text-[#2bb5ab]">uma operação sincronizada</span>
                  </>
                }
                subtitle="Direção, coordenação e profissionais trabalham na mesma fonte de verdade."
              />

              <div className="grid gap-5 md:grid-cols-3">
                {[
                  {
                    icon: Building2,
                    title: 'Direção clínica',
                    points: [
                      'Visão consolidada de cobertura por unidade',
                      'Indicadores de risco assistencial em tempo real',
                      'Base auditável para tomada de decisão',
                    ],
                  },
                  {
                    icon: Users,
                    title: 'Coordenação operacional',
                    points: [
                      'Publicação e ajuste de escala em minutos',
                      'Fluxo de trocas com aprovação estruturada',
                      'Alertas antes da descoberta do turno',
                    ],
                  },
                  {
                    icon: Smartphone,
                    title: 'Profissionais',
                    points: [
                      'Confirmação e recusa em 1 toque',
                      'Calendário de plantões pessoais',
                      'Histórico financeiro individual',
                    ],
                  },
                ].map((persona, index) => (
                  <motion.div
                    key={persona.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={landingViewport}
                    transition={{ delay: index * 0.08, duration: 0.42, ease: landingEase }}
                    className="rounded-2xl border border-[#dbe5ed] bg-white p-6"
                  >
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7f7f5] text-[#2bb5ab]">
                      <persona.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#111318]">{persona.title}</h3>
                    <ul className="mt-4 space-y-2.5">
                      {persona.points.map((point) => (
                        <li key={point} className="flex items-start gap-2 text-sm text-[#5b6a7d]">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#2bb5ab]" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="seguranca" className="bg-[#141a1f] px-4 py-20 text-white sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <div className="grid items-start gap-10 lg:grid-cols-2">
                <motion.div {...revealUp} transition={{ duration: 0.5, ease: landingEase }}>
                  <h3 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Governança de dados para
                    <span className="block text-[#8de0da]">operações sensíveis de saúde</span>
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-[#b9c8d2]">
                    Cada decisão sobre escala, confirmação e troca permanece registrada. A estrutura
                    foi pensada para operações com exigência de compliance e rastreabilidade.
                  </p>

                  <ul className="mt-6 space-y-3">
                    {[
                      { icon: Lock, text: 'Criptografia de dados em repouso e em trânsito' },
                      { icon: ShieldCheck, text: 'Controles compatíveis com boas práticas de LGPD' },
                      { icon: Eye, text: 'Trilha completa de eventos por usuário e horário' },
                      { icon: FileText, text: 'Relatórios para auditoria interna e externa' },
                    ].map((item) => (
                      <li key={item.text} className="flex items-start gap-2.5 text-sm text-[#c4d2db]">
                        <item.icon className="mt-0.5 h-4 w-4 text-[#8de0da]" />
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  {...revealUp}
                  transition={{ duration: 0.5, delay: 0.12, ease: landingEase }}
                  className="grid grid-cols-2 gap-4"
                >
                  {[
                    ['LGPD', 'Fluxo de privacidade e governança'],
                    ['RLS', 'Isolamento de dados por organização'],
                    ['Audit trail', 'Histórico de ações com timestamp'],
                    ['Permissões', 'Controle por perfil de acesso'],
                    ['Disponibilidade', 'Arquitetura para alta continuidade'],
                    ['Logs', 'Rastreabilidade operacional completa'],
                  ].map(([title, desc], index) => (
                    <motion.div
                      key={title}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={landingViewport}
                      transition={{ delay: 0.18 + index * 0.05, duration: 0.36, ease: landingEase }}
                      className="rounded-xl border border-white/12 bg-white/5 p-4"
                    >
                      <p className="text-sm font-semibold text-[#eaf6f5]">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#aebfcb]">{desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          <section id="planos" className="px-4 py-20 sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <SectionIntro
                title={
                  <>
                    Estrutura clara para crescer
                    <span className="block text-[#2bb5ab]">da clínica à rede hospitalar</span>
                  </>
                }
                subtitle="Todos os planos incluem onboarding e período de teste para validar o fluxo com sua equipe real."
              />

              <div className="grid gap-6 lg:grid-cols-3">
                {pricingPlans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={landingViewport}
                    transition={{ delay: index * 0.08, duration: 0.42, ease: landingEase }}
                    className={cn(
                      'relative rounded-2xl border p-6',
                      plan.featured
                        ? 'border-[#2bb5ab] bg-[#0f1f23] text-white shadow-[0_20px_60px_-28px_rgba(43,181,171,0.55)]'
                        : 'border-[#dce5ed] bg-white text-[#111318]',
                    )}
                  >
                    {plan.featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#4ecdc4] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0f1c20]">
                        Mais escolhido
                      </span>
                    )}

                    <p className={cn('text-xs font-semibold uppercase tracking-[0.16em]', plan.featured ? 'text-[#9fe9e4]' : 'text-[#5f6f82]')}>
                      {plan.name}
                    </p>
                    <div className="mt-2 flex items-end gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className={cn('mb-1 text-sm', plan.featured ? 'text-[#b8d4d7]' : 'text-[#6a788a]')}>/mês</span>
                    </div>
                    <p className={cn('mt-2 text-sm leading-relaxed', plan.featured ? 'text-[#c7dce0]' : 'text-[#5f6f82]')}>
                      {plan.subtitle}
                    </p>

                    <div className={cn('mt-5 grid grid-cols-3 gap-2 rounded-xl p-3 text-center', plan.featured ? 'bg-white/8' : 'bg-[#f4f8fb]')}>
                      {plan.highlights.map((value) => (
                        <div key={value} className="rounded-lg bg-black/5 px-2 py-2 text-[11px] font-semibold">
                          {value}
                        </div>
                      ))}
                    </div>

                    <ul className="mt-5 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className={cn('flex items-start gap-2 text-sm', plan.featured ? 'text-[#d9eceb]' : 'text-[#5e6d80]')}>
                          <Check className={cn('mt-0.5 h-4 w-4', plan.featured ? 'text-[#8de0da]' : 'text-[#2bb5ab]')} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className={cn(
                        'mt-6 w-full',
                        plan.featured
                          ? 'bg-[#4ecdc4] text-[#0f1c20] hover:bg-[#5fd8cf]'
                          : 'bg-[#111318] text-white hover:bg-[#1f2937]',
                      )}
                    >
                      <Link href="/register">Começar com este plano</Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="depoimentos" className="bg-[#0e171d] px-4 py-20 text-white sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <SectionIntro
                title={
                  <>
                    Quem saiu da planilha
                    <span className="block text-[#8de0da]">não volta para o antigo fluxo</span>
                  </>
                }
                subtitle="Relatos de gestores e coordenações que reduziram esforço operacional e ganharam previsibilidade de cobertura."
                light={false}
              />

              <div className="grid gap-4 md:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <motion.blockquote
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={landingViewport}
                    transition={{ delay: index * 0.08, duration: 0.42, ease: landingEase }}
                    className="rounded-2xl border border-white/12 bg-white/5 p-6"
                  >
                    <p className="text-sm leading-relaxed text-[#d2dee6]">“{testimonial.quote}”</p>
                    <footer className="mt-5 border-t border-white/10 pt-4">
                      <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                      <p className="text-xs text-[#9eb3bf]">{testimonial.role}</p>
                    </footer>
                  </motion.blockquote>
                ))}
              </div>
            </div>
          </section>

          <section id="faq" className="bg-[#141a1f] px-4 py-20 text-white sm:px-6 md:py-24">
            <div className="mx-auto max-w-6xl">
              <SectionIntro
                title={
                  <>
                    Perguntas frequentes
                    <span className="block text-[#8de0da]">sobre implementação e operação</span>
                  </>
                }
                subtitle="Tudo o que normalmente é discutido antes da virada da gestão de escalas para um fluxo estruturado."
                light={false}
              />

              <div className="grid items-start gap-8 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-7">
                  {faqItems.map((item, index) => {
                    const isOpen = activeFaq === index
                    return (
                      <motion.div
                        key={item.question}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={landingViewport}
                        transition={{ delay: index * 0.05, duration: 0.36, ease: landingEase }}
                        className={cn(
                          'rounded-xl border transition-colors',
                          isOpen ? 'border-white/30 bg-white/12' : 'border-white/12 bg-white/6 hover:bg-white/10',
                        )}
                      >
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                          onClick={() => setActiveFaq(isOpen ? null : index)}
                          aria-expanded={isOpen}
                        >
                          <span className="text-sm font-semibold text-white sm:text-base">{item.question}</span>
                          <motion.span
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </motion.span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.26, ease: landingEase }}
                              className="overflow-hidden"
                            >
                              <p className="border-t border-white/12 px-5 pb-5 pt-4 text-sm leading-relaxed text-[#c4d3de]">
                                {item.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>

                <motion.aside
                  {...revealUp}
                  transition={{ duration: 0.45, delay: 0.12, ease: landingEase }}
                  className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm lg:col-span-5 lg:sticky lg:top-24"
                >
                  <h3 className="text-xl font-bold">Suporte para implementação</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#c2d3df]">
                    Se você quiser validar no seu cenário real, nosso time ajuda no desenho inicial de unidades,
                    setores, profissionais e fluxo de confirmação.
                  </p>

                  <div className="mt-6 space-y-3">
                    <a
                      href="mailto:contato@plantaosync.onrender.com"
                      className="block rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-[#dcedf0] transition-colors hover:bg-white/10"
                    >
                      contato@plantaosync.onrender.com
                    </a>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl border border-white/12 bg-white/5 p-3 text-center">
                        <p className="font-semibold text-white">Resposta rápida</p>
                        <p className="mt-1 text-[#a9becc]">dias úteis</p>
                      </div>
                      <div className="rounded-xl border border-white/12 bg-white/5 p-3 text-center">
                        <p className="font-semibold text-white">Acompanhamento</p>
                        <p className="mt-1 text-[#a9becc]">durante onboarding</p>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="mt-6 w-full bg-[#4ecdc4] text-[#0f1c20] hover:bg-[#5fd8cf]">
                    <Link href="/register">Solicitar demonstração guiada</Link>
                  </Button>
                </motion.aside>
              </div>
            </div>
          </section>

          <section className="px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <motion.div
                {...revealUp}
                transition={{ duration: 0.46, ease: landingEase }}
                className="rounded-3xl border border-[#d6e1e8] bg-white px-6 py-10 text-center text-[#111318] shadow-[0_16px_44px_-30px_rgba(15,23,42,0.45)] sm:px-12"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#516073]">
                  Próximo passo
                </p>
                <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Leve sua operação de escala
                  <span className="block">do improviso para o controle.</span>
                </h3>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#5b6a7d] sm:text-base">
                  Você pode começar agora, validar o fluxo em uma unidade piloto e expandir para toda a
                  instituição com o mesmo padrão de execução.
                </p>

                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild className="w-full bg-[#0f1c20] text-white hover:bg-[#1b2d34] sm:w-auto">
                    <Link href="/register">Conhecer a plataforma <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-[#c8d4de] bg-white text-[#111318] hover:bg-[#f4f8fb] sm:w-auto">
                    <Link href="/faq">Ver perguntas frequentes</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#dbe5ed] bg-[#11181f] px-4 py-12 text-[#b6c6d0] sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <ProductLogo variant="mark" className="h-6 w-6" imageClassName="h-full w-full" />
                  </div>
                  <p className="text-base font-bold text-white">{BRAND_NAME}</p>
                </div>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#a8bac6]">
                  Gestão de escalas médicas com confirmação em tempo real para hospitais, UPAs e clínicas.
                </p>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-white">Produto</p>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'Painel operacional', id: 'painel-operacional' },
                    { label: 'Funcionalidades', id: 'funcionalidades' },
                    { label: 'Planos', id: 'planos' },
                    { label: 'FAQ', id: 'faq' },
                  ].map((item) => (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        className="transition-colors hover:text-white"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-white">Legal</p>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'Política de privacidade', href: '/privacy' },
                    { label: 'Termos de uso', href: '/terms' },
                    { label: 'LGPD', href: '/lgpd' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="transition-colors hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-white">Acesso</p>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'Criar conta', href: '/register' },
                    { label: 'Entrar', href: '/login' },
                    { label: 'Recuperar senha', href: '/forgot-password' },
                  ].map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="transition-colors hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row">
              <p>© 2026 {BRAND_NAME}. Todos os direitos reservados.</p>
              <p>Feito para quem cuida de quem cuida.</p>
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.22, ease: landingEase }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 z-[70] inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#111318] text-white shadow-xl hover:bg-[#1f2937]"
              aria-label="Voltar ao topo"
            >
              <ChevronRight className="h-5 w-5 -rotate-90" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
