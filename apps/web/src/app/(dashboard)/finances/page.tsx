import { DollarSign } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function FinancesPage() {
  return (
    <DashboardPlaceholderPage
      title="Financeiro"
      subtitle="Custos de plantao e status de pagamento"
      description="Consolide valores por escala e profissional para melhorar previsibilidade e governanca financeira."
      icon={<DollarSign className="h-5 w-5" />}
      highlights={[
        'Resumo mensal de custos por local',
        'Status de pagamento por plantao',
        'Conferencia de valores antes do fechamento',
        'Base para auditoria e planejamento',
      ]}
      primaryAction={{ label: 'Abrir relatorios', href: '/reports' }}
    />
  )
}
