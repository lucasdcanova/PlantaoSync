import { MapPin } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function LocationsPage() {
  return (
    <DashboardPlaceholderPage
      title="Locais"
      subtitle="Unidades, setores e níveis de criticidade"
      description="Organize a operação por ambiente assistencial para distribuir cobertura com prioridade clínica real."
      icon={<MapPin className="h-5 w-5" />}
      highlights={[
        'Mapa de unidades com setores e perfis de demanda',
        'Classificação de criticidade por local e turno',
        'Padronização de cobertura entre hospitais e clínicas',
        'Base para comparativos de desempenho por unidade',
      ]}
      primaryAction={{ label: 'Voltar para central', href: '/overview' }}
    />
  )
}
