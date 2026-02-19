import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/marketing-shell'

export const metadata: Metadata = {
  title: 'Conformidade LGPD',
  description:
    'Diretrizes de tratamento de dados pessoais no CONFIRMA PLANTÃO em conformidade com a Lei Geral de Proteção de Dados.',
  alternates: {
    canonical: '/lgpd',
  },
}

const sections = [
  {
    title: 'Controlador e operador',
    content:
      'No contexto de uso da plataforma, a organização contratante atua como controladora dos dados. O CONFIRMA PLANTÃO atua como operador para execução das atividades contratadas.',
  },
  {
    title: 'Bases legais aplicáveis',
    content:
      'O tratamento ocorre com base em execução contratual, cumprimento de obrigação legal e legítimo interesse para segurança da informação e continuidade operacional.',
  },
  {
    title: 'Medidas técnicas e administrativas',
    content:
      'Aplicamos segregação por tenant, controles de permissão por perfil, registros de auditoria, mecanismos de autenticação e monitoramento de eventos de risco.',
  },
  {
    title: 'Atendimento aos titulares',
    content:
      'Solicitações de titulares devem ser encaminhadas pelo controlador. Nosso time apoia a operação com meios técnicos para levantamento, correção e eliminação quando cabível.',
  },
  {
    title: 'Retenção e governança',
    content:
      'A retencao respeita necessidade operacional, obrigações legais e política de governança acordada com a organização contratante.',
  },
]

export default function LgpdPage() {
  return (
    <MarketingShell
      title="Conformidade LGPD"
      description="Como o CONFIRMA PLANTÃO apoia sua operação no cumprimento da Lei Geral de Proteção de Dados."
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
