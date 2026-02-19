import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MarketingShell } from '@/components/marketing/marketing-shell'
import { Button } from '@/components/ui/button'

const faqItems = [
  {
    question: 'Em quanto tempo consigo colocar a operacao no ar?',
    answer:
      'A maioria das equipes configura usuarios, locais e primeira escala no mesmo dia. O fluxo foi desenhado para onboarding rapido.',
  },
  {
    question: 'A plataforma funciona para hospitais e clinicas?',
    answer:
      'Sim. A estrutura de organizacoes, locais e equipes permite operar diferentes modelos de escala, com governanca centralizada.',
  },
  {
    question: 'Existe aplicativo para confirmar plantoes?',
    answer:
      'Sim. O profissional recebe notificacao e confirma o plantao com um clique, reduzindo troca de mensagens paralelas.',
  },
  {
    question: 'Como funciona seguranca e LGPD?',
    answer:
      'Aplicamos segregacao por organizacao, trilha de alteracoes e controles de acesso por perfil. O produto foi construindo considerando compliance desde o inicio.',
  },
  {
    question: 'Posso começar sem cartao de credito?',
    answer:
      'Sim. O periodo de teste nao exige cartao e voce pode cancelar antes da migracao para um plano pago.',
  },
]

export default function FaqPage() {
  return (
    <MarketingShell
      title="Perguntas Frequentes"
      description="Respostas diretas para as duvidas mais comuns antes de iniciar sua operacao no AgendaPlantao."
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
        <h3 className="font-display text-2xl font-bold">Ainda ficou alguma duvida?</h3>
        <p className="mt-2 text-brand-100/90">
          Comece o teste gratuito e acompanhe a implementacao com apoio do nosso time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-white text-brand-700 hover:bg-brand-50">
            <Link href="/register">
              Criar conta
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
