import type { Metadata } from 'next'
import { MarketingShell } from '@/components/marketing/marketing-shell'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Entenda como o AgendaPlantão coleta, utiliza e protege dados em operações de escalas médicas.',
  alternates: {
    canonical: '/privacy',
  },
}

const sections = [
  {
    title: '1. Dados coletados',
    content:
      'Coletamos dados cadastrais fornecidos no onboarding, dados operacionais de escalas, registros de acesso e eventos de uso necessários para segurança e auditoria.',
  },
  {
    title: '2. Finalidade de uso',
    content:
      'Os dados são usados para operar a plataforma, autenticar usuários, gerar relatórios, enviar notificações e manter rastreabilidade das ações da equipe.',
  },
  {
    title: '3. Compartilhamento',
    content:
      'Não comercializamos dados. Compartilhamentos ocorrem apenas com provedores essenciais de infraestrutura e comunicação, sob contratos de confidencialidade e segurança.',
  },
  {
    title: '4. Retenção e descarte',
    content:
      'Mantemos dados pelo período necessário para atendimento contratual, obrigações legais e histórico operacional. O descarte segue políticas de segurança e minimização.',
  },
  {
    title: '5. Direitos do titular',
    content:
      'Titulares podem solicitar confirmação de tratamento, correção, anonimização, portabilidade e eliminação quando aplicável, conforme a legislação vigente.',
  },
]

export default function PrivacyPage() {
  return (
    <MarketingShell
      title="Política de Privacidade"
      description="Transparência sobre como tratamos dados no AgendaPlantão."
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
        <p className="text-sm text-muted-foreground">
          Última atualização: 19 de fevereiro de 2026.
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
