import { CreditCard } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function SubscriptionPage() {
  return (
    <DashboardPlaceholderPage
      title="Plano"
      subtitle="Capacidade contratada e limites operacionais"
      description="Monitore uso da plataforma e projete expansão da operação de escala com previsibilidade."
      icon={<CreditCard className="h-5 w-5" />}
      highlights={[
        'Visão de recursos utilizados por ciclo operacional',
        'Status da assinatura e período de renovação',
        'Histórico de evolução de plano e capacidade',
        'Recomendações para ampliar cobertura com segurança',
      ]}
      primaryAction={{ label: 'Falar com especialista', href: '/faq' }}
    />
  )
}
