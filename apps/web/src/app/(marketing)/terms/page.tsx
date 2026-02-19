import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/marketing-shell'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Regras de uso da plataforma CONFIRMA PLANTÃO para organizações de saúde, equipes assistenciais e gestores.',
  alternates: {
    canonical: '/terms',
  },
}

const sections = [
  {
    title: '1. Escopo do serviço',
    content:
      'O CONFIRMA PLANTÃO fornece software para planejamento de escalas, confirmação de plantões e acompanhamento de indicadores operacionais.',
  },
  {
    title: '2. Conta e responsabilidade',
    content:
      'A organização contratante responde pela gestão de acessos internos, veracidade dos dados inseridos e conformidade dos fluxos operacionais no uso da plataforma.',
  },
  {
    title: '3. Disponibilidade e suporte',
    content:
      'Buscamos alta disponibilidade e evolução contínua do produto. Janelas de manutenção e incidentes críticos são comunicados pelos canais oficiais.',
  },
  {
    title: '4. Propriedade intelectual',
    content:
      'Código, marca, elementos visuais e documentação do CONFIRMA PLANTÃO são protegidos por direitos autorais e não podem ser reproduzidos sem autorização.',
  },
  {
    title: '5. Encerramento e exportação',
    content:
      'Em caso de encerramento, a organização pode solicitar exportação dos dados dentro dos limites técnicos e prazos previstos na política de encerramento.',
  },
]

export default function TermsPage() {
  return (
    <MarketingShell
      title="Termos de Uso"
      description="Regras de uso da plataforma para organizações e usuários autorizados."
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
        <p className="text-sm text-muted-foreground">Última atualização: 19 de fevereiro de 2026.</p>

        <div className="mt-6 space-y-6">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-semibold text-foreground">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </MarketingShell>
  )
}
