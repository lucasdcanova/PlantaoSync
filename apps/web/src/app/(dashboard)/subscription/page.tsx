import { CreditCard } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function SubscriptionPage() {
  return (
    <DashboardPlaceholderPage
      title="Plano"
      subtitle="Assinatura e limites da sua organizacao"
      description="Visualize o status atual do plano, consumo e proximos passos para escalar a operacao."
      icon={<CreditCard className="h-5 w-5" />}
      highlights={[
        'Visao de limites por recurso',
        'Status da assinatura e ciclo de cobranca',
        'Historico resumido de alteracoes de plano',
        'Recomendacoes para crescimento da equipe',
      ]}
      primaryAction={{ label: 'Falar com comercial', href: '/faq' }}
    />
  )
}
