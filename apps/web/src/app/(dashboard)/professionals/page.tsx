import { Users } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function ProfessionalsPage() {
  return (
    <DashboardPlaceholderPage
      title="Profissionais"
      subtitle="Cadastro e acompanhamento da equipe"
      description="Gerencie medicos, especialidades, disponibilidade e historico de participacao em escalas."
      icon={<Users className="h-5 w-5" />}
      highlights={[
        'Base centralizada de profissionais e especialidades',
        'Historico de confirmacoes e cancelamentos por pessoa',
        'Busca rapida por disponibilidade e perfil',
        'Permissoes por papel na organizacao',
      ]}
      primaryAction={{ label: 'Ver escalas', href: '/schedules' }}
    />
  )
}
