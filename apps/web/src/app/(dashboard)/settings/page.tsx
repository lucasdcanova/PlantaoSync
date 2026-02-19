import { Settings } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function SettingsPage() {
  return (
    <DashboardPlaceholderPage
      title="Configurações"
      subtitle="Políticas operacionais e segurança da plataforma"
      description="Defina regras de notificação, acesso e governança para manter o padrão operacional em toda a instituição."
      icon={<Settings className="h-5 w-5" />}
      highlights={[
        'Perfis de acesso por papel assistencial e administrativo',
        'Parâmetros de notificação por tipo de evento',
        'Padrões de governança para unidades da organização',
        'Configurações para trilha de auditoria e conformidade',
      ]}
      primaryAction={{ label: 'Voltar para central', href: '/overview' }}
    />
  )
}
