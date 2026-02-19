import { MarketingShell } from '@/components/marketing/marketing-shell'

const sections = [
  {
    title: '1. Escopo do servico',
    content:
      'O AgendaPlantao fornece software para planejamento de escalas, confirmacao de plantoes e acompanhamento de indicadores operacionais.',
  },
  {
    title: '2. Conta e responsabilidade',
    content:
      'A organizacao contratante responde pela gestao de acessos internos, veracidade dos dados inseridos e conformidade dos fluxos operacionais no uso da plataforma.',
  },
  {
    title: '3. Disponibilidade e suporte',
    content:
      'Buscamos alta disponibilidade e evolucao continua do produto. Janelas de manutencao e incidentes criticos sao comunicados pelos canais oficiais.',
  },
  {
    title: '4. Propriedade intelectual',
    content:
      'Codigo, marca, elementos visuais e documentacao do AgendaPlantao sao protegidos por direitos autorais e nao podem ser reproduzidos sem autorizacao.',
  },
  {
    title: '5. Encerramento e exportacao',
    content:
      'Em caso de encerramento, a organizacao pode solicitar exportacao dos dados dentro dos limites tecnicos e prazos previstos na politica de encerramento.',
  },
]

export default function TermsPage() {
  return (
    <MarketingShell
      title="Termos de Uso"
      description="Regras de uso da plataforma para organizacoes e usuarios autorizados."
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
        <p className="text-sm text-muted-foreground">Ultima atualizacao: 19 de fevereiro de 2026.</p>

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
