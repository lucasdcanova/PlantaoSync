'use client'

import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { DEMO_ACCESS_PROFILES, DEMO_NOTIFICATION_RULES } from '@/lib/demo-data'
import { useAuthStore } from '@/store/auth.store'
import { Bell, Shield } from 'lucide-react'

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
  const isDemoMode = useAuthStore((s) => s.isDemoMode)

  const notificationRules = isDemoMode ? DEMO_NOTIFICATION_RULES : []
  const accessProfiles = isDemoMode ? DEMO_ACCESS_PROFILES : []

  return (
    <>
      <Header title="Configurações" subtitle="Políticas operacionais, acesso e governança" />

      <div className="space-y-6 p-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Regras de notificação</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Canais e gatilhos ativos para manter a operação com rastreabilidade.
          </p>

          {notificationRules.length === 0 ? (
            <EmptySection icon={Bell} message="Nenhuma regra de notificação configurada ainda." />
          ) : (
            <div className="mt-5 grid gap-3">
              {notificationRules.map((rule) => (
                <article key={rule.id} className="rounded-xl border border-border bg-background px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{rule.name}</h3>
                      <p className="text-xs text-muted-foreground">{rule.channel}</p>
                    </div>
                    <Badge className="border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300">
                      {rule.status}
                    </Badge>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-foreground">Perfis de acesso</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Definição de escopo por papel para separar leitura clínica, operação e governança.
          </p>

          {accessProfiles.length === 0 ? (
            <EmptySection icon={Shield} message="Nenhum perfil de acesso configurado ainda." />
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {accessProfiles.map((profile) => (
                <article key={profile.id} className="rounded-xl border border-border bg-background p-4">
                  <h3 className="font-medium text-foreground">{profile.role}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{profile.scope}</p>
                  <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">Membros vinculados</p>
                  <p className="text-lg font-semibold text-foreground">{profile.members}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
