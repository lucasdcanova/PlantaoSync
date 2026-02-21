'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Camera,
  Check,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  Globe,
  FileText,
  X,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { OrgAvatar } from '@/components/ui/org-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInstitutionStore, type DemoManager } from '@/store/institution.store'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const BRAZIL_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO',
]

function FieldGroup({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
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
  const store = useInstitutionStore()
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Local form state (draft)
  const [form, setForm] = useState({
    name: store.name,
    cnpj: store.cnpj,
    phone: store.phone,
    email: store.email,
    address: store.address,
    city: store.city,
    state: store.state,
    website: store.website,
  })
  const [saved, setSaved] = useState(false)

  // Manager form
  const [showAddManager, setShowAddManager] = useState(false)
  const [managerForm, setManagerForm] = useState({ name: '', email: '', role: 'MANAGER' as 'ADMIN' | 'MANAGER' })
  const [managerError, setManagerError] = useState('')

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      store.setLogo(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    store.updateInfo(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleAddManager = () => {
    if (!managerForm.name.trim() || !managerForm.email.trim()) {
      setManagerError('Nome e e-mail são obrigatórios.')
      return
    }
    const emailExists = store.managers.some(
      (m) => m.email.toLowerCase() === managerForm.email.trim().toLowerCase(),
    )
    if (emailExists) {
      setManagerError('Este e-mail já está cadastrado como gestor.')
      return
    }
    store.addManager({
      name: managerForm.name.trim(),
      email: managerForm.email.trim().toLowerCase(),
      role: managerForm.role,
    })
    setManagerForm({ name: '', email: '', role: 'MANAGER' })
    setManagerError('')
    setShowAddManager(false)
  }

  const canRemoveManager = (manager: DemoManager) => {
    // Can't remove yourself if you're the only ADMIN
    if (manager.email === user?.email) return false
    const adminCount = store.managers.filter((m) => m.role === 'ADMIN').length
    if (manager.role === 'ADMIN' && adminCount <= 1) return false
    return true
  }

  return (
    <>
      <Header title="Instituição" subtitle="Perfil e gestão da sua organização" />

      <div className="space-y-6 p-4 sm:p-6 max-w-3xl mx-auto">
        {/* Logo + identity card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="card-base p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo upload */}
            <div className="relative group">
              <OrgAvatar name={form.name || store.name} logoUrl={store.logoUrl} size="lg" />
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
                <Camera className="h-6 w-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold text-foreground truncate">
                  {form.name || 'Nome da Instituição'}
                </h2>
                <Badge className="border-brand-200 bg-brand-50 text-brand-800 text-[11px]">
                  ENTERPRISE
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">
                {form.city && form.state ? `${form.city}, ${form.state}` : 'Localização não definida'}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
                {store.logoUrl ? 'Alterar foto' : 'Adicionar foto da instituição'}
              </button>
              {store.logoUrl && (
                <button
                  type="button"
                  onClick={() => store.setLogo(undefined)}
                  className="ml-3 mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-status-urgent transition-colors"
                >
                  <X className="h-3 w-3" />
                  Remover foto
                </button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Institution info form */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.06 }}
          className="card-base p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-display text-base font-semibold text-foreground">Informações da Instituição</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FieldGroup label="Nome oficial" icon={Building2}>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Hospital São Gabriel"
                />
              </FieldGroup>
            </div>

            <FieldGroup label="CNPJ" icon={FileText}>
              <Input
                value={form.cnpj}
                onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
                placeholder="00.000.000/0001-00"
              />
            </FieldGroup>

            <FieldGroup label="Telefone" icon={Phone}>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(11) 3456-7890"
              />
            </FieldGroup>

            <FieldGroup label="E-mail institucional" icon={Mail}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="contato@hospital.com.br"
              />
            </FieldGroup>

            <FieldGroup label="Website" icon={Globe}>
              <Input
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="www.hospital.com.br"
              />
            </FieldGroup>

            <div className="sm:col-span-2">
              <FieldGroup label="Endereço" icon={MapPin}>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Av. Paulista, 1000"
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Cidade" icon={MapPin}>
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                placeholder="São Paulo"
              />
            </FieldGroup>

            <FieldGroup label="Estado" icon={MapPin}>
              <select
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione</option>
                {BRAZIL_STATES.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </FieldGroup>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} className="gap-2 min-w-[120px]">
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Salvo!
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </div>
        </motion.section>

        {/* Managers section */}
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
                Gestores ({store.managers.length})
              </h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setShowAddManager(true); setManagerError('') }}
              className="gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Adicionar gestor
            </Button>
          </div>

          {/* Add manager form */}
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
                    placeholder="Dr. João Silva"
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
                <p className="text-[11px] text-muted-foreground mt-1">
                  {managerForm.role === 'ADMIN'
                    ? 'Acesso total: pode gerenciar gestores, plano e configurações.'
                    : 'Acesso operacional: escalas, profissionais e relatórios.'}
                </p>
              </div>
              {managerError && (
                <p className="text-xs text-status-urgent">{managerError}</p>
              )}
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={handleAddManager} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setShowAddManager(false); setManagerError('') }}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Managers list */}
          <div className="space-y-3">
            {store.managers.map((manager) => (
              <div
                key={manager.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/60 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 text-[11px] font-semibold border border-brand-100">
                  {manager.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
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
                      onClick={() => store.removeManager(manager.id)}
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
        </motion.section>
      </div>
    </>
  )
}
