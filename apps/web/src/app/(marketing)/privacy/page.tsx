import { MarketingShell } from '@/components/marketing/marketing-shell'

const sections = [
  {
    title: '1. Dados coletados',
    content:
      'Coletamos dados cadastrais fornecidos no onboarding, dados operacionais de escalas, registros de acesso e eventos de uso necessarios para seguranca e auditoria.',
  },
  {
    title: '2. Finalidade de uso',
    content:
      'Os dados sao usados para operar a plataforma, autenticar usuarios, gerar relatorios, enviar notificacoes e manter rastreabilidade das acoes da equipe.',
  },
  {
    title: '3. Compartilhamento',
    content:
      'Nao comercializamos dados. Compartilhamentos ocorrem apenas com provedores essenciais de infraestrutura e comunicacao, sob contratos de confidencialidade e seguranca.',
  },
  {
    title: '4. Retencao e descarte',
    content:
      'Mantemos dados pelo periodo necessario para atendimento contratual, obrigacoes legais e historico operacional. O descarte segue politicas de seguranca e minimizacao.',
  },
  {
    title: '5. Direitos do titular',
    content:
      'Titulares podem solicitar confirmacao de tratamento, correcao, anonimização, portabilidade e eliminacao quando aplicavel, conforme a legislacao vigente.',
  },
]

export default function PrivacyPage() {
  return (
    <MarketingShell
      title="Politica de Privacidade"
      description="Transparencia sobre como tratamos dados no AgendaPlantao."
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
        <p className="text-sm text-muted-foreground">
          Ultima atualizacao: 19 de fevereiro de 2026.
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
