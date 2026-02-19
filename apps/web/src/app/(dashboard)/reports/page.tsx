import { BarChart3 } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function ReportsPage() {
  return (
    <DashboardPlaceholderPage
      title="Relatórios"
      subtitle="Cobertura, produtividade e risco por período"
      description="Gere leituras executivas para comitês assistenciais e operacionais com foco em decisão rápida."
      icon={<BarChart3 className="h-5 w-5" />}
      highlights={[
        'Cobertura por unidade, especialidade e janela de risco',
        'Tempo médio entre convocação e confirmação efetiva',
        'Comparativo entre planejamento e execução da escala',
        'Exportação para auditoria interna e governança',
      ]}
      primaryAction={{ label: 'Abrir financeiro', href: '/finances' }}
    />
  )
}
