import { DollarSign } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function FinancesPage() {
  return (
    <DashboardPlaceholderPage
      title="Financeiro"
      subtitle="Custo de cobertura com contexto assistencial"
      description="Acompanhe impacto financeiro por ciclo de escala sem perder a leitura de continuidade assistencial."
      icon={<DollarSign className="h-5 w-5" />}
      highlights={[
        'Projeção de custo por unidade e período de cobertura',
        'Status financeiro alinhado ao status operacional do plantão',
        'Conferência de divergências antes do fechamento mensal',
        'Indicadores para diretoria e controladoria',
      ]}
      primaryAction={{ label: 'Ver relatórios', href: '/reports' }}
    />
  )
}
