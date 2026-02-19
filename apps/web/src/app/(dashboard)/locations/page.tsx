import { MapPin } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function LocationsPage() {
  return (
    <DashboardPlaceholderPage
      title="Locais"
      subtitle="Unidades, setores e pontos de plantao"
      description="Organize os ambientes de trabalho para distribuir escalas por hospital, unidade e especialidade."
      icon={<MapPin className="h-5 w-5" />}
      highlights={[
        'Cadastro de unidades com dados de contato',
        'Separacao por setor para escalas mais precisas',
        'Visao consolidada de cobertura por local',
        'Base pronta para relatorios operacionais',
      ]}
      primaryAction={{ label: 'Voltar para overview', href: '/overview' }}
    />
  )
}
