import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'FAQ sobre Gestão de Escalas Médicas',
  description:
    'Perguntas frequentes sobre implantação, segurança, cobertura e operação do AgendaPlantão para hospitais e clínicas.',
  alternates: {
    canonical: '/faq',
  },
}

const faqItems = [
  {
    question: 'Quanto tempo para implantar um software de escalas médicas no hospital?',
    answer:
      'A implantação pode iniciar por uma unidade piloto. Em geral, o primeiro ciclo entra em operação em poucos dias, com migração gradual para as demais áreas.',
  },
  {
    question: 'A plataforma atende hospital e clínica na mesma operação?',
    answer:
      'Sim. O AgendaPlantão permite separar regras por unidade, especialidade e nível de criticidade, mantendo gestão centralizada para a direção.',
  },
  {
    question: 'Como reduzir faltas de cobertura sem aumentar improviso?',
    answer:
      'Com alertas de risco, priorização de convocação e visão de pendências em tempo real. O objetivo é agir antes da ruptura do plantão.',
  },
  {
    question: 'Existe rastreabilidade das decisões de escala?',
    answer:
      'Sim. Publicação, convites, aceite, recusa e cancelamento ficam registrados para auditoria e alinhamento entre operação e governança.',
  },
  {
    question: 'Como funciona segurança e LGPD?',
    answer:
      'A solução opera com segregação por organização, permissão por perfil e trilha de eventos, apoiando práticas de conformidade e segurança da informação.',
  },
]

export default function FaqPage() {
  return (
    <MarketingShell
      title="Perguntas frequentes"
      description="Respostas objetivas para quem precisa decidir sobre gestão de plantão com foco assistencial, operacional e financeiro."
    >
      <div className="grid gap-4">
        {faqItems.map((item) => (
          <article key={item.question} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-foreground">{item.question}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-brand">
        <h3 className="font-display text-2xl font-bold">Quer avaliar sua operação atual?</h3>
        <p className="mt-2 text-brand-100/90">
          Mapeie gargalos de cobertura, processo de convocação e governança com nosso diagnóstico inicial.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-white text-brand-700 hover:bg-brand-50">
            <Link href="/register">
              Iniciar diagnóstico
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="border border-white/30 text-white hover:bg-white/10">
            <Link href="/login">Entrar na plataforma</Link>
          </Button>
        </div>
      </div>
    </MarketingShell>
  )
}
