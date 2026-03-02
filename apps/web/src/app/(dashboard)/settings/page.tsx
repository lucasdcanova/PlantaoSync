'use client'

import { useQuery } from '@tanstack/react-query'
import { Bell, Shield } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { getApiClient } from '@/lib/api'

type UserRow = {
  id: string
  role: 'ADMIN' | 'MANAGER' | 'PROFESSIONAL'
  isActive: boolean
}

function EmptySection({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export default function SettingsPage() {
  const { data: users } = useQuery({
    queryKey: ['settings-users'],
    queryFn: async () => {
      const api = getApiClient()
      const response = await api.get('users', { searchParams: { limit: 300 } }).json<{ data: UserRow[] }>()
      return response.data
    },
  })

  const managerCount = users?.filter((user) => user.isActive && (user.role === 'ADMIN' || user.role === 'MANAGER')).length ?? 0
  const professionalCount = users?.filter((user) => user.isActive && user.role === 'PROFESSIONAL').length ?? 0

  return (
    <>
      <Header title="Configurações" subtitle="Políticas operacionais, acesso e governança" />

      <div className="space-y-6 p-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Regras de notificação</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Canais e gatilhos ativos para manter a operação com rastreabilidade.
          </p>

          <EmptySection
            icon={Bell}
            message="As regras avançadas de notificação serão gerenciadas por esta seção em breve."
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Perfis de acesso</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Definição de escopo por papel para separar leitura clínica, operação e governança.
          </p>

          {users && users.length > 0 ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <article className="rounded-xl border border-border bg-background p-4">
                <h3 className="font-medium text-foreground">Gestão</h3>
                <p className="mt-1 text-sm text-muted-foreground">Admin e gestores com controle operacional.</p>
                <div className="mt-3">
                  <Badge>{managerCount} membro(s)</Badge>
                </div>
              </article>

              <article className="rounded-xl border border-border bg-background p-4">
                <h3 className="font-medium text-foreground">Profissionais</h3>
                <p className="mt-1 text-sm text-muted-foreground">Médicos vinculados às escalas da instituição.</p>
                <div className="mt-3">
                  <Badge>{professionalCount} membro(s)</Badge>
                </div>
              </article>
            </div>
          ) : (
            <EmptySection icon={Shield} message="Nenhum perfil de acesso configurado ainda." />
          )}
        </section>
      </div>
    </>
  )
}
