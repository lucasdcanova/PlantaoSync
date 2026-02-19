import { MarketingShell } from '@/components/marketing/marketing-shell'

const sections = [
  {
    title: 'Controlador e operador',
    content:
      'No contexto de uso da plataforma, a organizacao contratante atua como controladora dos dados. O AgendaPlantao atua como operador para execucao das atividades contratadas.',
  },
  {
    title: 'Bases legais aplicaveis',
    content:
      'O tratamento ocorre com base em execucao contratual, cumprimento de obrigacao legal e legitimo interesse para seguranca da informacao e continuidade operacional.',
  },
  {
    title: 'Medidas tecnicas e administrativas',
    content:
      'Aplicamos segregacao por tenant, controles de permissao por perfil, registros de auditoria, mecanismos de autenticacao e monitoramento de eventos de risco.',
  },
  {
    title: 'Atendimento aos titulares',
    content:
      'Solicitacoes de titulares devem ser encaminhadas pelo controlador. Nosso time apoia a operacao com meios tecnicos para levantamento, correcao e eliminacao quando cabivel.',
  },
  {
    title: 'Retencao e governanca',
    content:
      'A retencao respeita necessidade operacional, obrigacoes legais e politica de governanca acordada com a organizacao contratante.',
  },
]

export default function LgpdPage() {
  return (
    <MarketingShell
      title="Conformidade LGPD"
      description="Como o AgendaPlantao apoia sua operacao no cumprimento da Lei Geral de Protecao de Dados."
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
        <p className="text-sm text-muted-foreground">
          Documento orientativo de compliance e tratamento de dados no ambiente da plataforma.
        </p>

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
