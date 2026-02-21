'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserCheck,
  UserPlus,
  X,
  RotateCcw,
  Phone,
  Mail,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProfessionalsStore } from '@/store/professionals.store'
import { useAuthStore } from '@/store/auth.store'
import { DEMO_DOCTOR_INVITE_CODES } from '@/lib/demo-data'
import { cn, getInitials } from '@/lib/utils'
import type { DemoProfessional } from '@/lib/demo-data'

const statusConfig: Record<DemoProfessional['status'], { color: string; dot: string }> = {
  'Em cobertura': {
    color: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
    dot: 'bg-cyan-500',
  },
  Ativo: {
    color: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300',
    dot: 'bg-green-500',
  },
  Indisponível: {
    color: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
}

const SPECIALTIES = [
  'Anestesiologia','Cardiologia','Cirurgia Geral','Clínica Médica',
  'Emergência','Ginecologia','Intensivista','Neurologia',
  'Ortopedia','Pediatria','Psiquiatria','Radiologia','Outra',
]

function AddProfessionalForm({ onClose }: { onClose: () => void }) {
  const { addProfessional } = useProfessionalsStore()
  const [form, setForm] = useState({ name: '', email: '', crm: '', specialty: '', phone: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.crm.trim() || !form.specialty.trim()) {
      setError('Preencha nome, e-mail, CRM e especialidade.')
      return
    }
    addProfessional(form)
    setSuccess(true)
    setTimeout(() => onClose(), 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="card-base border-brand-200/50 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-brand-600" />
          <h3 className="font-display text-sm font-semibold text-foreground">Adicionar profissional</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <CheckCircle2 className="h-8 w-8 text-status-success" />
          <p className="text-sm font-medium text-foreground">Profissional adicionado!</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nome completo *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Dra. Maria Silva" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">E-mail *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="medico@hospital.com.br" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">CRM *</Label>
              <Input value={form.crm} onChange={(e) => setForm((f) => ({ ...f, crm: e.target.value }))} placeholder="CRM-SP 000000" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Especialidade *</Label>
              <select
                value={form.specialty}
                onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione</option>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-xs text-muted-foreground">Telefone (opcional)</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-0000" />
            </div>
          </div>
          {error && <p className="mt-2 text-xs text-status-urgent">{error}</p>}
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={handleSubmit} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Adicionar à equipe
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>Cancelar</Button>
          </div>
        </>
      )}
    </motion.div>
  )
}

function ProfessionalCard({
  professional,
  onRemove,
  onRestore,
}: {
  professional: DemoProfessional
  onRemove: () => void
  onRestore: () => void
}) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const isRemoved = professional.hospitalStatus === 'REMOVIDO'
  const status = statusConfig[professional.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: isRemoved ? 0.5 : 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className={cn('card-base p-4', isRemoved && 'grayscale')}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100 dark:bg-brand-900/20 dark:border-brand-800">
          {getInitials(professional.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{professional.name}</p>
            {isRemoved ? (
              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">Removido</Badge>
            ) : (
              <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', status.color)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                {professional.status}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{professional.specialty} · {professional.crm}</p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {professional.email && (
              <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{professional.email}</span>
            )}
            {professional.phone && (
              <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{professional.phone}</span>
            )}
          </div>
          {!isRemoved && (
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-green-600" />{professional.acceptanceRate}% aceite
              </span>
              <span className="inline-flex items-center gap-1">
                <Stethoscope className="h-3 w-3 text-brand-500" />{professional.completedShifts} plantões
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />Disp. {professional.nextAvailability}
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0">
          {isRemoved ? (
            <button
              type="button"
              onClick={onRestore}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />Restaurar
            </button>
          ) : confirmRemove ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Confirmar?</span>
              <button
                type="button"
                onClick={() => { onRemove(); setConfirmRemove(false) }}
                className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-status-urgent hover:bg-red-100 transition-colors"
              >
                Sim
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                className="rounded-md px-1.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-status-urgent hover:bg-red-50 transition-colors"
              aria-label={`Remover ${professional.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ProfessionalsPage() {
  const isDemoMode = useAuthStore((s) => s.isDemoMode)
  const { professionals, removeProfessional, restoreProfessional } = useProfessionalsStore()
  const inviteCodes = isDemoMode ? DEMO_DOCTOR_INVITE_CODES : []
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ativos' | 'todos' | 'removidos'>('ativos')
  const [showAddForm, setShowAddForm] = useState(false)

  const filtered = professionals.filter((p) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q) || p.crm.toLowerCase().includes(q)
    if (filter === 'ativos') return matchesSearch && p.hospitalStatus === 'ATIVO'
    if (filter === 'removidos') return matchesSearch && p.hospitalStatus === 'REMOVIDO'
    return matchesSearch
  })

  const activeCount = professionals.filter((p) => p.hospitalStatus === 'ATIVO').length
  const onDutyCount = professionals.filter((p) => p.status === 'Em cobertura' && p.hospitalStatus === 'ATIVO').length
  const avgAcceptance = activeCount > 0
    ? Math.round(professionals.filter((p) => p.hospitalStatus === 'ATIVO').reduce((s, p) => s + p.acceptanceRate, 0) / activeCount)
    : 0
  const removedCount = professionals.filter((p) => p.hospitalStatus === 'REMOVIDO').length

  return (
    <>
      <Header title="Equipe Médica" subtitle="Adicione, remova e acompanhe os profissionais da escala" />

      <div className="space-y-5 p-4 sm:p-6">
        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Profissionais ativos', value: activeCount, color: 'text-foreground' },
            { label: 'Em cobertura agora', value: onDutyCount, color: 'text-cyan-600' },
            { label: 'Taxa média de aceite', value: `${avgAcceptance}%`, color: 'text-green-600' },
            { label: 'Removidos da escala', value: removedCount, color: 'text-muted-foreground' },
          ].map((stat) => (
            <div key={stat.label} className="card-base p-4">
              <p className={cn('font-display text-2xl font-bold', stat.color)}>{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, CRM ou especialidade..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="inline-flex rounded-full border border-border bg-background p-1">
            {(['ativos', 'todos', 'removidos'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-all',
                  filter === f ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f === 'ativos' ? 'Ativos' : f === 'removidos' ? 'Removidos' : 'Todos'}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setShowAddForm((v) => !v)} className="gap-1.5 shrink-0">
            <Plus className="h-3.5 w-3.5" />
            Adicionar médico
          </Button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showAddForm && <AddProfessionalForm onClose={() => setShowAddForm(false)} />}
        </AnimatePresence>

        {/* Professional list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <ProfessionalCard
                key={p.id}
                professional={p}
                onRemove={() => removeProfessional(p.id)}
                onRestore={() => restoreProfessional(p.id)}
              />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="card-base p-10 text-center text-muted-foreground text-sm">
              {search ? 'Nenhum profissional encontrado.' : 'Nenhum profissional nesta categoria.'}
            </div>
          )}
        </div>

        {/* Invite codes */}
        <section className="card-base p-6">
          <h2 className="font-display text-base font-semibold text-foreground">Convites para cadastro médico</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compartilhe os códigos com médicos para auto-cadastro via <code className="text-xs bg-muted px-1 py-0.5 rounded">/invite</code>.
          </p>
          {inviteCodes.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nenhum código de convite gerado ainda.</p>
          ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {inviteCodes.map((invite) => (
              <article key={invite.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{invite.sectorName}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{invite.code}</p>
                  </div>
                  <Badge className={invite.status === 'ATIVO'
                    ? 'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300'
                    : 'border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400'
                  }>
                    {invite.status}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Emitido por {invite.issuedBy} · expira em {invite.expiresAt}
                </p>
              </article>
            ))}
          </div>
          )}
        </section>
      </div>
    </>
  )
}
