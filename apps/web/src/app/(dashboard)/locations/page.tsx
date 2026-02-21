'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Gauge,
  Landmark,
  PencilLine,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { PageTransition, StaggerItem, StaggerList } from '@/components/shared/page-transition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSchedulesStore } from '@/store/schedules.store'
import {
  useLocationsStore,
  type LocationCriticality,
  type LocationEditorInput,
  type ManagerLocation,
} from '@/store/locations.store'
import { cn, formatCurrency } from '@/lib/utils'

const CRITICALITY_OPTIONS: Array<LocationCriticality> = ['Alta', 'Média', 'Baixa']

const criticalityClassName: Record<LocationCriticality, string> = {
  Alta: 'border border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300',
  Média:
    'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  Baixa:
    'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
}

type LocationFormState = {
  name: string
  criticality: LocationCriticality
  occupancyRate: string
  pendingShifts: string
  activeProfessionals: string
  monthlyCost: string
}

function toFormState(location?: ManagerLocation): LocationFormState {
  if (!location) {
    return {
      name: '',
      criticality: 'Média',
      occupancyRate: '90',
      pendingShifts: '0',
      activeProfessionals: '0',
      monthlyCost: '0,00',
    }
  }

  return {
    name: location.name,
    criticality: location.criticality,
    occupancyRate: String(location.occupancyRate),
    pendingShifts: String(location.pendingShifts),
    activeProfessionals: String(location.activeProfessionals),
    monthlyCost: (location.monthlyCost / 100).toFixed(2).replace('.', ','),
  }
}

function parseCurrencyToCents(value: string) {
  const numeric = Number(value.replace(',', '.'))
  if (!Number.isFinite(numeric) || numeric < 0) return Number.NaN
  return Math.round(numeric * 100)
}

function LocationEditorCard({
  mode,
  initialLocation,
  onSubmit,
  onCancel,
}: {
  mode: 'create' | 'edit'
  initialLocation?: ManagerLocation
  onSubmit: (input: LocationEditorInput) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<LocationFormState>(() => toFormState(initialLocation))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(toFormState(initialLocation))
    setError(null)
  }, [initialLocation])

  const handleSubmit = () => {
    const occupancyRate = Number(form.occupancyRate)
    const pendingShifts = Number(form.pendingShifts)
    const activeProfessionals = Number(form.activeProfessionals)
    const monthlyCost = parseCurrencyToCents(form.monthlyCost)

    if (!form.name.trim()) {
      setError('Informe o nome do setor.')
      return
    }

    if (!Number.isFinite(occupancyRate) || occupancyRate < 0 || occupancyRate > 100) {
      setError('Ocupação deve estar entre 0 e 100.')
      return
    }

    if (!Number.isFinite(pendingShifts) || pendingShifts < 0) {
      setError('Plantões pendentes deve ser zero ou maior.')
      return
    }

    if (!Number.isFinite(activeProfessionals) || activeProfessionals < 0) {
      setError('Profissionais ativos deve ser zero ou maior.')
      return
    }

    if (!Number.isFinite(monthlyCost) || monthlyCost < 0) {
      setError('Custo mensal inválido.')
      return
    }

    setError(null)
    onSubmit({
      name: form.name,
      criticality: form.criticality,
      occupancyRate,
      pendingShifts,
      activeProfessionals,
      monthlyCost,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="card-base border-brand-200/60 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-foreground text-base font-semibold">
          {mode === 'create' ? 'Incluir novo setor' : 'Editar setor'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors"
          aria-label="Fechar edição"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`location-name-${mode}`}>Nome do setor</Label>
          <Input
            id={`location-name-${mode}`}
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            placeholder="Ex.: UTI Adulto"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`location-criticality-${mode}`}>Criticidade</Label>
          <select
            id={`location-criticality-${mode}`}
            value={form.criticality}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                criticality: event.target.value as LocationCriticality,
              }))
            }
            className="border-input bg-card text-foreground shadow-card focus-visible:ring-ring focus-visible:ring-offset-background h-10 w-full rounded-md border px-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {CRITICALITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`location-occupancy-${mode}`}>Ocupação (%)</Label>
          <Input
            id={`location-occupancy-${mode}`}
            type="number"
            min={0}
            max={100}
            value={form.occupancyRate}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                occupancyRate: event.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`location-pending-${mode}`}>Plantões pendentes</Label>
          <Input
            id={`location-pending-${mode}`}
            type="number"
            min={0}
            value={form.pendingShifts}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                pendingShifts: event.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`location-professionals-${mode}`}>Profissionais ativos</Label>
          <Input
            id={`location-professionals-${mode}`}
            type="number"
            min={0}
            value={form.activeProfessionals}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                activeProfessionals: event.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor={`location-cost-${mode}`}>Custo mensal (R$)</Label>
          <Input
            id={`location-cost-${mode}`}
            type="text"
            value={form.monthlyCost}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                monthlyCost: event.target.value,
              }))
            }
            placeholder="0,00"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="button" className="gap-1.5" onClick={handleSubmit}>
          <Plus className="h-4 w-4" />
          {mode === 'create' ? 'Incluir setor' : 'Salvar setor'}
        </Button>
      </div>
    </motion.div>
  )
}

export default function LocationsPage() {
  const locations = useLocationsStore((state) => state.locations)
  const addLocation = useLocationsStore((state) => state.addLocation)
  const updateLocation = useLocationsStore((state) => state.updateLocation)
  const deleteLocation = useLocationsStore((state) => state.deleteLocation)
  const toggleLocationActive = useLocationsStore((state) => state.toggleLocationActive)
  const schedules = useSchedulesStore((state) => state.schedules)

  const [search, setSearch] = useState('')
  const [criticalityFilter, setCriticalityFilter] = useState<LocationCriticality | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null)

  const usageByLocation = useMemo(() => {
    const usage = new Map<string, { schedules: number; extras: number }>()

    schedules.forEach((schedule) => {
      const current = usage.get(schedule.locationId) ?? { schedules: 0, extras: 0 }
      usage.set(schedule.locationId, {
        ...current,
        schedules: current.schedules + 1,
      })

      schedule.extraShifts.forEach((extraShift) => {
        const extraCurrent = usage.get(extraShift.locationId) ?? { schedules: 0, extras: 0 }
        usage.set(extraShift.locationId, {
          ...extraCurrent,
          extras: extraCurrent.extras + 1,
        })
      })
    })

    return usage
  }, [schedules])

  const filteredLocations = useMemo(
    () =>
      locations.filter((location) => {
        const matchesSearch = location.name.toLowerCase().includes(search.toLowerCase())
        const matchesCriticality =
          criticalityFilter === 'all' || location.criticality === criticalityFilter
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' ? location.isActive : !location.isActive)

        return matchesSearch && matchesCriticality && matchesStatus
      }),
    [locations, search, criticalityFilter, statusFilter],
  )

  const activeLocations = locations.filter((location) => location.isActive)
  const avgOccupancy = activeLocations.length
    ? Math.round(
        activeLocations.reduce((sum, location) => sum + location.occupancyRate, 0) /
          activeLocations.length,
      )
    : 0
  const highCriticalityCount = activeLocations.filter(
    (location) => location.criticality === 'Alta',
  ).length
  const totalMonthlyCost = activeLocations.reduce((sum, location) => sum + location.monthlyCost, 0)

  const handleCreateLocation = (input: LocationEditorInput) => {
    try {
      addLocation(input)
      setShowCreateForm(false)
      toast.success('Setor incluído com sucesso.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao incluir setor.')
    }
  }

  const handleUpdateLocation = (locationId: string, input: LocationEditorInput) => {
    try {
      updateLocation(locationId, input)
      setEditingLocationId(null)
      toast.success('Setor atualizado com sucesso.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao atualizar setor.')
    }
  }

  const handleDeleteLocation = (location: ManagerLocation) => {
    const usage = usageByLocation.get(location.id) ?? { schedules: 0, extras: 0 }
    const totalLinks = usage.schedules + usage.extras

    if (totalLinks > 0) {
      toast.error(
        'Não é possível excluir este setor porque ele está vinculado a escalas ou turnos extras.',
      )
      return
    }

    const confirmed = window.confirm(
      `Deseja excluir o setor "${location.name}"? Esta ação não pode ser desfeita.`,
    )

    if (!confirmed) return

    deleteLocation(location.id)
    if (editingLocationId === location.id) setEditingLocationId(null)
    toast.success('Setor excluído com sucesso.')
  }

  const handleToggleActive = (location: ManagerLocation) => {
    toggleLocationActive(location.id)
    toast.success(location.isActive ? 'Setor desativado.' : 'Setor reativado.')
  }

  return (
    <>
      <Header
        title="Setores"
        subtitle="Gestão completa para incluir, editar, desativar e excluir setores assistenciais"
      />

      <PageTransition>
        <div className="space-y-5 p-4 sm:p-6">
          <section className="from-brand-50 via-background to-brand-100/40 border-brand-200/70 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6">
            <div className="bg-brand-200/40 pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-brand-700 text-xs font-semibold uppercase tracking-widest">
                  Centro de controle de setores
                </p>
                <h2 className="font-display text-foreground mt-2 text-2xl font-bold tracking-tight">
                  O gestor edita todos os dados operacionais em um só fluxo
                </h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Estruture criticidade, ocupação, custo e disponibilidade por setor com governança
                  total e feedback instantâneo.
                </p>
              </div>
              <Badge className="border-brand-300 text-brand-700 bg-white">CRUD completo</Badge>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: 'Setores cadastrados',
                value: locations.length,
                icon: Landmark,
                className: 'text-foreground',
              },
              {
                label: 'Setores ativos',
                value: activeLocations.length,
                icon: Activity,
                className: 'text-brand-700',
              },
              {
                label: 'Criticidade alta',
                value: highCriticalityCount,
                icon: ShieldAlert,
                className: 'text-red-600',
              },
              {
                label: 'Custo mensal ativo',
                value: formatCurrency(totalMonthlyCost),
                icon: Gauge,
                className: 'text-foreground',
              },
            ].map((item) => (
              <article key={item.label} className="card-base p-4">
                <div className="flex items-center justify-between">
                  <item.icon className="text-brand-500 h-4 w-4" />
                  <span className={cn('font-display text-xl font-bold', item.className)}>
                    {item.value}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1.5 text-[11px]">{item.label}</p>
              </article>
            ))}
          </section>

          <section className="card-base space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px] flex-1">
                <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar setor..."
                  className="h-9 pl-9 text-sm"
                />
              </div>

              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setShowCreateForm((prev) => !prev)}
              >
                <Plus className="h-3.5 w-3.5" />
                Novo setor
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="border-border bg-background inline-flex rounded-full border p-1">
                {(['all', ...CRITICALITY_OPTIONS] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCriticalityFilter(option)}
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                      criticalityFilter === option
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {option === 'all' ? 'Todas criticidades' : option}
                  </button>
                ))}
              </div>

              <div className="border-border bg-background inline-flex rounded-full border p-1">
                {[
                  { key: 'all', label: 'Todos' },
                  { key: 'active', label: 'Ativos' },
                  { key: 'inactive', label: 'Inativos' },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setStatusFilter(option.key as 'all' | 'active' | 'inactive')}
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                      statusFilter === option.key
                        ? 'bg-brand-600 text-white'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <span className="text-muted-foreground ml-auto text-xs">
                Ocupação média ativa: <strong className="text-foreground">{avgOccupancy}%</strong>
              </span>
            </div>
          </section>

          <AnimatePresence>
            {showCreateForm && (
              <LocationEditorCard
                mode="create"
                onSubmit={handleCreateLocation}
                onCancel={() => setShowCreateForm(false)}
              />
            )}
          </AnimatePresence>

          <StaggerList className="grid gap-4 lg:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredLocations.map((location) => {
                const usage = usageByLocation.get(location.id) ?? { schedules: 0, extras: 0 }
                const totalLinks = usage.schedules + usage.extras
                const isEditing = editingLocationId === location.id

                if (isEditing) {
                  return (
                    <motion.div key={location.id} layout>
                      <LocationEditorCard
                        mode="edit"
                        initialLocation={location}
                        onSubmit={(input) => handleUpdateLocation(location.id, input)}
                        onCancel={() => setEditingLocationId(null)}
                      />
                    </motion.div>
                  )
                }

                return (
                  <StaggerItem key={location.id}>
                    <motion.article
                      layout
                      whileHover={{ y: -2 }}
                      className={cn(
                        'card-base border-border/80 p-5 transition-all',
                        !location.isActive && 'opacity-70 grayscale-[0.25]',
                      )}
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-foreground text-lg font-bold">
                              {location.name}
                            </h3>
                            <Badge className={criticalityClassName[location.criticality]}>
                              Criticidade {location.criticality}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                location.isActive
                                  ? 'border-green-200 bg-green-50 text-green-700'
                                  : 'border-zinc-200 bg-zinc-50 text-zinc-700',
                              )}
                            >
                              {location.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Vínculos: {usage.schedules} escala(s) · {usage.extras} turno(s) extra(s)
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => handleToggleActive(location)}
                          >
                            {location.isActive ? 'Desativar' : 'Ativar'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => setEditingLocationId(location.id)}
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteLocation(location)}
                            disabled={totalLinks > 0}
                            title={
                              totalLinks > 0
                                ? 'Remova vínculos de escala antes de excluir este setor.'
                                : undefined
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Excluir
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Ocupação assistencial</span>
                          <span className="text-foreground font-medium">
                            {location.occupancyRate}%
                          </span>
                        </div>
                        <div className="bg-muted h-2 overflow-hidden rounded-full">
                          <div
                            className="bg-brand-500 h-full rounded-full"
                            style={{ width: `${location.occupancyRate}%` }}
                          />
                        </div>

                        <div className="grid gap-3 pt-1 text-sm sm:grid-cols-3">
                          <div className="border-border bg-background rounded-xl border px-3 py-2.5">
                            <p className="text-muted-foreground text-[11px]">
                              Profissionais ativos
                            </p>
                            <p className="text-foreground mt-1 inline-flex items-center gap-1 text-sm font-medium">
                              <UserCheck className="text-brand-500 h-3.5 w-3.5" />
                              {location.activeProfessionals}
                            </p>
                          </div>
                          <div className="border-border bg-background rounded-xl border px-3 py-2.5">
                            <p className="text-muted-foreground text-[11px]">Plantões pendentes</p>
                            <p className="text-foreground mt-1 inline-flex items-center gap-1 text-sm font-medium">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                              {location.pendingShifts}
                            </p>
                          </div>
                          <div className="border-border bg-background rounded-xl border px-3 py-2.5">
                            <p className="text-muted-foreground text-[11px]">Custo mensal</p>
                            <p className="text-foreground mt-1 inline-flex items-center gap-1 text-sm font-medium">
                              <Landmark className="h-3.5 w-3.5 text-emerald-600" />
                              {formatCurrency(location.monthlyCost)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  </StaggerItem>
                )
              })}
            </AnimatePresence>
          </StaggerList>

          {filteredLocations.length === 0 && (
            <div className="card-base py-10 text-center">
              <ShieldAlert className="text-muted-foreground/40 mx-auto mb-3 h-9 w-9" />
              <p className="text-foreground text-sm font-medium">Nenhum setor encontrado</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Ajuste os filtros ou inclua um novo setor para iniciar a gestão.
              </p>
            </div>
          )}
        </div>
      </PageTransition>
    </>
  )
}
