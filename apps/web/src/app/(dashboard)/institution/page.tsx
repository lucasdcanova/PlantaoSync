'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Camera,
  Check,
  Mail,
  Phone,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { OrgAvatar } from '@/components/ui/org-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiClient } from '@/lib/api'
import { API_BASE_URL } from '@/lib/env'
import { useAuthStore } from '@/store/auth.store'
import { useInstitutionStore } from '@/store/institution.store'
import { cn } from '@/lib/utils'

type OrganizationResponse = {
  id: string
  name: string
  cnpj?: string | null
  phone?: string | null
  logoUrl?: string | null
}

type UserRow = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'PROFESSIONAL'
  isActive: boolean
}

type ManagerRole = 'ADMIN' | 'MANAGER'

type ManagerRow = {
  id: string
  name: string
  email: string
  role: ManagerRole
}

function FieldGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Label>
      {children}
    </div>
  )
}

export default function InstitutionPage() {
  const { user, accessToken } = useAuthStore()
  const institutionStore = useInstitutionStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [organizationId, setOrganizationId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: '',
    cnpj: '',
    phone: '',
  })

  const [managers, setManagers] = useState<ManagerRow[]>([])

  const [showAddManager, setShowAddManager] = useState(false)
  const [isInvitingManager, setIsInvitingManager] = useState(false)
  const [managerError, setManagerError] = useState('')
  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    role: 'MANAGER' as ManagerRole,
  })

  const managerList = useMemo(() => managers, [managers])

  const loadInstitutionData = async () => {
    setIsLoading(true)
    try {
      const api = getApiClient()

      const [org, usersResponse] = await Promise.all([
        api.get('tenants/me').json<OrganizationResponse>(),
        api.get('users', { searchParams: { limit: 100 } }).json<{ data: UserRow[] }>(),
      ])

      setOrganizationId(org.id)
      setForm({
        name: org.name ?? '',
        cnpj: org.cnpj ?? '',
        phone: org.phone ?? '',
      })

      institutionStore.updateInfo({
        name: org.name ?? '',
        cnpj: org.cnpj ?? '',
        phone: org.phone ?? '',
      })
      institutionStore.setLogo(org.logoUrl ?? undefined)

      const activeManagers = usersResponse.data
        .filter((u) => u.isActive && (u.role === 'ADMIN' || u.role === 'MANAGER'))
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as ManagerRole,
        }))

      setManagers(activeManagers)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Falha ao carregar dados da instituição.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadInstitutionData()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const api = getApiClient()
      const updated = await api
        .patch('tenants/me', {
          json: {
            name: form.name.trim(),
            cnpj: form.cnpj.trim() || undefined,
            phone: form.phone.trim() || undefined,
          },
        })
        .json<OrganizationResponse>()

      institutionStore.updateInfo({
        name: updated.name ?? '',
        cnpj: updated.cnpj ?? '',
        phone: updated.phone ?? '',
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
      toast.success('Dados da instituição salvos no backend.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Falha ao salvar dados da instituição.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!accessToken) {
      toast.error('Sessão inválida para upload de logo.')
      return
    }

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/api/v1/uploads/org-logo`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      })

      if (!response.ok) {
        let message = 'Falha ao enviar logo.'
        try {
          const body = (await response.json()) as { message?: string }
          message = body.message ?? message
        } catch {}
        throw new Error(message)
      }

      const payload = (await response.json()) as {
        organization?: { logoUrl?: string | null }
        url?: string
      }

      const logoUrl = payload.organization?.logoUrl ?? payload.url
      institutionStore.setLogo(logoUrl ?? undefined)
      toast.success('Logo atualizada no backend.')
      await loadInstitutionData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha no upload da logo.')
    } finally {
      setIsUploadingLogo(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveLogo = async () => {
    setIsSaving(true)
    try {
      const api = getApiClient()
      const updated = await api
        .patch('tenants/me', {
          json: {
            logoUrl: null,
          },
        })
        .json<OrganizationResponse>()

      institutionStore.setLogo(updated.logoUrl ?? undefined)
      toast.success('Logo removida.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao remover logo.')
    } finally {
      setIsSaving(false)
    }
  }

  const canRemoveManager = (manager: ManagerRow) => {
    if (manager.email === user?.email) return false
    const adminCount = managerList.filter((m) => m.role === 'ADMIN').length
    if (manager.role === 'ADMIN' && adminCount <= 1) return false
    return true
  }

  const handleAddManager = async () => {
    if (!managerForm.name.trim() || !managerForm.email.trim()) {
      setManagerError('Nome e e-mail são obrigatórios.')
      return
    }

    setManagerError('')
    setIsInvitingManager(true)
    try {
      const api = getApiClient()
      await api.post('users/invite', {
        json: {
          name: managerForm.name.trim(),
          email: managerForm.email.trim().toLowerCase(),
          role: managerForm.role,
        },
      })

      setManagerForm({ name: '', email: '', role: 'MANAGER' })
      setShowAddManager(false)
      toast.success('Gestor adicionado com sucesso.')
      await loadInstitutionData()
    } catch (error) {
      setManagerError(
        error instanceof Error ? error.message : 'Falha ao adicionar gestor.',
      )
    } finally {
      setIsInvitingManager(false)
    }
  }

  const handleRemoveManager = async (managerId: string) => {
    try {
      const api = getApiClient()
      await api.delete(`users/${managerId}`)
      toast.success('Gestor desativado com sucesso.')
      await loadInstitutionData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao desativar gestor.')
    }
  }

  return (
    <>
      <Header title="Instituição" subtitle="Perfil e gestão da sua organização" />

      <div className="space-y-6 p-4 sm:p-6 max-w-3xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="card-base p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <OrgAvatar name={form.name || institutionStore.name} logoUrl={institutionStore.logoUrl} size="lg" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'absolute inset-0 flex items-center justify-center rounded-2xl',
                  'bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity',
                  'cursor-pointer',
                )}
                aria-label="Alterar foto da instituição"
              >
                {isUploadingLogo ? <Check className="h-6 w-6 text-white" /> : <Camera className="h-6 w-6 text-white" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => void handleLogoChange(event)}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold text-foreground truncate">
                  {form.name || 'Instituição'}
                </h2>
                <Badge className="border-brand-200 bg-brand-50 text-brand-800 text-[11px]">
                  {organizationId ? 'Conectado ao backend' : 'Carregando'}
                </Badge>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                disabled={isUploadingLogo}
              >
                <Camera className="h-3.5 w-3.5" />
                {institutionStore.logoUrl ? 'Alterar foto' : 'Adicionar foto da instituição'}
              </button>
              {institutionStore.logoUrl && (
                <button
                  type="button"
                  onClick={() => void handleRemoveLogo()}
                  className="ml-3 mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-status-urgent transition-colors"
                  disabled={isSaving}
                >
                  <X className="h-3 w-3" />
                  Remover foto
                </button>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.06 }}
          className="card-base p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-display text-base font-semibold text-foreground">Informações da instituição</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldGroup label="Nome oficial" icon={Building2}>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Hospital São Gabriel"
                  disabled={isLoading}
                />
              </FieldGroup>
            </div>

            <FieldGroup label="CNPJ" icon={Building2}>
              <Input
                value={form.cnpj}
                onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
                placeholder="00.000.000/0001-00"
                disabled={isLoading}
              />
            </FieldGroup>

            <FieldGroup label="Telefone" icon={Phone}>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(11) 3456-7890"
                disabled={isLoading}
              />
            </FieldGroup>

            <div className="sm:col-span-2 rounded-xl border border-dashed border-border bg-background px-3 py-3 text-xs text-muted-foreground">
              Campos extras como endereço, site e cidade serão exibidos assim que o backend tiver suporte dedicado para esses atributos.
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => void handleSave()} className="gap-2 min-w-[120px]" disabled={isSaving || isLoading}>
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Salvo!
                </>
              ) : isSaving ? (
                'Salvando...'
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.12 }}
          className="card-base p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-display text-base font-semibold text-foreground">
                Gestores ({managerList.length})
              </h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAddManager(true)
                setManagerError('')
              }}
              className="gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Adicionar gestor
            </Button>
          </div>

          {showAddManager && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 rounded-xl border border-brand-200/60 bg-brand-50/40 p-4 space-y-3"
            >
              <p className="text-xs font-semibold text-brand-800 uppercase tracking-wide">Novo gestor</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Nome completo</Label>
                  <Input
                    value={managerForm.name}
                    onChange={(e) => setManagerForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Dra. Fernanda Lima"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">E-mail</Label>
                  <Input
                    type="email"
                    value={managerForm.email}
                    onChange={(e) => setManagerForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="gestor@hospital.com.br"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Nível de acesso</Label>
                <div className="flex gap-2">
                  {(['MANAGER', 'ADMIN'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setManagerForm((f) => ({ ...f, role }))}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        managerForm.role === role
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-background text-muted-foreground border-border hover:border-brand-300',
                      )}
                    >
                      {role === 'ADMIN' ? 'Administrador' : 'Gestor'}
                    </button>
                  ))}
                </div>
              </div>

              {managerError && <p className="text-xs text-status-urgent">{managerError}</p>}

              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={() => void handleAddManager()} className="gap-1.5" disabled={isInvitingManager}>
                  <Plus className="h-3.5 w-3.5" />
                  {isInvitingManager ? 'Adicionando...' : 'Adicionar'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddManager(false)
                    setManagerError('')
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            {managerList.map((manager) => (
              <div
                key={manager.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 text-[11px] font-semibold border border-brand-100">
                  {manager.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{manager.name}</p>
                    {manager.email === user?.email && (
                      <span className="text-[10px] text-muted-foreground">(você)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{manager.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={manager.role === 'ADMIN' ? 'default' : 'outline'}
                    className={cn(
                      'text-[10px]',
                      manager.role === 'ADMIN'
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-border text-muted-foreground',
                    )}
                  >
                    {manager.role === 'ADMIN' ? 'Admin' : 'Gestor'}
                  </Badge>
                  {canRemoveManager(manager) && (
                    <button
                      type="button"
                      onClick={() => void handleRemoveManager(manager.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground/50 hover:text-status-urgent hover:bg-red-50 transition-colors"
                      aria-label={`Remover ${manager.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!isLoading && managerList.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background px-3 py-4 text-sm text-muted-foreground text-center">
              Nenhum gestor ativo encontrado.
            </div>
          )}
        </motion.section>
      </div>
    </>
  )
}
