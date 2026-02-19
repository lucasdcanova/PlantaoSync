import { BarChart3 } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function ReportsPage() {
  return (
    <DashboardPlaceholderPage
      title="Relatorios"
      subtitle="Indicadores de desempenho e operacao"
      description="Acompanhe ocupacao, produtividade e consistencia de confirmacoes com visao executiva por periodo."
      icon={<BarChart3 className="h-5 w-5" />}
      highlights={[
        'Taxa de ocupacao por unidade e periodo',
        'Tempo medio entre publicacao e confirmacao',
        'Comparativo de custo previsto vs realizado',
        'Exportacao para analise externa',
      ]}
      primaryAction={{ label: 'Ver financeiro', href: '/finances' }}
    />
  )
}
