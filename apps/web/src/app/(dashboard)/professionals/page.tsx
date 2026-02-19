import { Users } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function ProfessionalsPage() {
  return (
    <DashboardPlaceholderPage
      title="Profissionais"
      subtitle="Elegibilidade, disponibilidade e histórico assistencial"
      description="Consolide quem pode cobrir cada tipo de plantão e reduza convocações desalinhadas com perfil clínico."
      icon={<Users className="h-5 w-5" />}
      highlights={[
        'Matriz de especialidade, unidade e aptidão',
        'Histórico de aceite, recusa e cancelamento por profissional',
        'Visão de disponibilidade para antecipar gargalos',
        'Base única para coordenação e direção clínica',
      ]}
      primaryAction={{ label: 'Ver ciclos de escala', href: '/schedules' }}
    />
  )
}
