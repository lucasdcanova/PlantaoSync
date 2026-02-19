import { Settings } from 'lucide-react'
import { DashboardPlaceholderPage } from '@/components/dashboard/dashboard-placeholder'

export default function SettingsPage() {
  return (
    <DashboardPlaceholderPage
      title="Configuracoes"
      subtitle="Preferencias da organizacao e seguranca"
      description="Ajuste parametros de notificacao, identidade visual e regras internas para padronizar a operacao."
      icon={<Settings className="h-5 w-5" />}
      highlights={[
        'Preferencias gerais da organizacao',
        'Controle de notificacoes por canal',
        'Politicas de acesso e perfil de usuario',
        'Configuracoes para auditoria operacional',
      ]}
      primaryAction={{ label: 'Voltar para overview', href: '/overview' }}
    />
  )
}
