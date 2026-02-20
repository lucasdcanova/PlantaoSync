'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Save,
  Trash2,
  FilePlus2,
  AlertCircle,
} from 'lucide-react'
import type { ScheduleStatus } from '@agendaplantao/shared'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEMO_LOCATIONS } from '@/lib/demo-data'
import { SHIFT_STATUS_CONFIG, formatDate } from '@/lib/utils'
import { useSchedulesStore, type ScheduleEditorInput } from '@/store/schedules.store'

type ScheduleFormValues = {
  title: string
  description: string
  locationId: string
  startDate: string
  endDate: string
  status: ScheduleStatus
  publishedAt: string
}

const STATUS_OPTIONS: Array<{ value: ScheduleStatus; label: string }> = [
  { value: 'DRAFT', label: SHIFT_STATUS_CONFIG.DRAFT.label },
  { value: 'PUBLISHED', label: SHIFT_STATUS_CONFIG.PUBLISHED.label },
  { value: 'CLOSED', label: SHIFT_STATUS_CONFIG.CLOSED.label },
  { value: 'ARCHIVED', label: SHIFT_STATUS_CONFIG.ARCHIVED.label },
]

const DEFAULT_FORM: ScheduleFormValues = {
  title: '',
  description: '',
  locationId: DEMO_LOCATIONS[0]?.id ?? '',
  startDate: '',
  endDate: '',
  status: 'DRAFT',
  publishedAt: '',
}

function toFormValues(input: {
  title: string
  description?: string
  locationId: string
  startDate: string
  endDate: string
  status: ScheduleStatus
  publishedAt?: string
}) {
  return {
    title: input.title,
    description: input.description ?? '',
    locationId: input.locationId,
    startDate: input.startDate.slice(0, 10),
    endDate: input.endDate.slice(0, 10),
    status: input.status,
    publishedAt: input.publishedAt?.slice(0, 10) ?? '',
  } satisfies ScheduleFormValues
}

export default function ScheduleDetailsPage() {
  const params = useParams<{ id: string | string[] }>()
  const router = useRouter()

  const rawId = params?.id
  const scheduleId = Array.isArray(rawId) ? rawId[0] : rawId
  const isCreateMode = scheduleId === 'new'

  const schedules = useSchedulesStore((state) => state.schedules)
  const createSchedule = useSchedulesStore((state) => state.createSchedule)
  const updateSchedule = useSchedulesStore((state) => state.updateSchedule)
  const deleteSchedule = useSchedulesStore((state) => state.deleteSchedule)

  const schedule = useMemo(
    () => (isCreateMode ? null : (schedules.find((item) => item.id === scheduleId) ?? null)),
    [isCreateMode, scheduleId, schedules],
  )

  const [form, setForm] = useState<ScheduleFormValues>(DEFAULT_FORM)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isCreateMode) {
      setForm(DEFAULT_FORM)
      return
    }

    if (schedule) {
      setForm(toFormValues(schedule))
    }
  }, [isCreateMode, schedule])

  const statusConfig = SHIFT_STATUS_CONFIG[form.status]
  const selectedLocation = DEMO_LOCATIONS.find((location) => location.id === form.locationId)

  const canEditPublishedAt = form.status !== 'DRAFT'

  const detailsSubtitle = isCreateMode
    ? 'Configure uma nova escala mensal para a equipe'
    : 'Edite todos os dados operacionais desta escala'

  const formTitle = isCreateMode ? 'Nova Escala Mensal' : 'Edição Completa da Escala'

  const validateForm = () => {
    if (!form.title.trim()) {
      return 'Informe o título da escala.'
    }

    if (!form.locationId) {
      return 'Selecione o local da escala.'
    }

    if (!form.startDate || !form.endDate) {
      return 'Informe as datas de início e fim.'
    }

    if (form.startDate > form.endDate) {
      return 'A data de início não pode ser maior que a data final.'
    }

    return null
  }

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setErrorMessage(null)
    setSuccessMessage(null)

    const validationError = validateForm()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    const payload: ScheduleEditorInput = {
      title: form.title,
      description: form.description,
      locationId: form.locationId,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      publishedAt: canEditPublishedAt ? form.publishedAt || undefined : undefined,
    }

    try {
      if (isCreateMode) {
        const created = createSchedule(payload)
        setSuccessMessage('Escala criada com sucesso.')
        router.replace(`/schedules/${created.id}`)
        return
      }

      if (!scheduleId) {
        setErrorMessage('ID da escala inválido.')
        return
      }

      updateSchedule(scheduleId, payload)
      setSuccessMessage('Escala atualizada com sucesso.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao salvar a escala.')
    }
  }

  const handleDelete = () => {
    if (!scheduleId || isCreateMode) return

    const confirmed = window.confirm('Deseja excluir esta escala? Esta ação não pode ser desfeita.')
    if (!confirmed) return

    deleteSchedule(scheduleId)
    router.push('/schedules')
  }

  const handleReset = () => {
    if (isCreateMode) {
      setForm(DEFAULT_FORM)
      return
    }

    if (schedule) {
      setForm(toFormValues(schedule))
    }
  }

  if (!scheduleId) {
    return (
      <>
        <Header title="Escalas" subtitle="Identificador de escala inválido" />
        <div className="p-6">
          <Button asChild variant="outline">
            <Link href="/schedules">Voltar para escalas</Link>
          </Button>
        </div>
      </>
    )
  }

  if (!isCreateMode && !schedule) {
    return (
      <>
        <Header title="Escala não encontrada" subtitle="Não localizamos esta escala no ambiente" />

        <div className="p-6">
          <div className="border-border bg-card shadow-card mx-auto max-w-3xl rounded-2xl border p-8">
            <p className="text-muted-foreground text-sm">
              A escala solicitada não está disponível. Ela pode ter sido removida.
            </p>
            <div className="mt-5">
              <Button asChild>
                <Link href="/schedules">Voltar para escalas</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title={formTitle} subtitle={detailsSubtitle} />

      <div className="space-y-5 p-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <Button asChild variant="ghost" className="w-fit gap-2">
            <Link href="/schedules">
              <ArrowLeft className="h-4 w-4" />
              Voltar para meses
            </Link>
          </Button>

          {!isCreateMode && (
            <Button variant="destructive" size="sm" className="gap-2" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          )}
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[1.4fr_1fr]">
          <form
            onSubmit={handleSave}
            className="border-border bg-card shadow-card rounded-2xl border p-6"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-foreground text-xl font-bold">Dados da escala</h2>
                <p className="text-muted-foreground text-sm">
                  Preencha e salve para criar/editar a escala no ambiente do gestor.
                </p>
              </div>
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-title">Título</Label>
                <Input
                  id="schedule-title"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Ex.: Cobertura UTI Adulto - Março 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule-description">Descrição</Label>
                <textarea
                  id="schedule-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  className="focus-visible:ring-ring focus-visible:ring-offset-background placeholder:text-muted-foreground border-input bg-card text-foreground shadow-card flex w-full resize-y rounded-md border px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  placeholder="Resumo operacional, observações e orientação para o mês."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schedule-location">Local</Label>
                  <select
                    id="schedule-location"
                    value={form.locationId}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        locationId: event.target.value,
                      }))
                    }
                    className="focus-visible:ring-ring focus-visible:ring-offset-background border-input bg-card text-foreground shadow-card h-10 w-full rounded-md border px-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    {DEMO_LOCATIONS.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-status">Status</Label>
                  <select
                    id="schedule-status"
                    value={form.status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as ScheduleStatus
                      setForm((prev) => ({
                        ...prev,
                        status: nextStatus,
                        publishedAt:
                          nextStatus === 'DRAFT'
                            ? ''
                            : prev.publishedAt || new Date().toISOString().slice(0, 10),
                      }))
                    }}
                    className="focus-visible:ring-ring focus-visible:ring-offset-background border-input bg-card text-foreground shadow-card h-10 w-full rounded-md border px-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    {STATUS_OPTIONS.map((statusOption) => (
                      <option key={statusOption.value} value={statusOption.value}>
                        {statusOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="schedule-start">Data inicial</Label>
                  <Input
                    id="schedule-start"
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        startDate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schedule-end">Data final</Label>
                  <Input
                    id="schedule-end"
                    type="date"
                    value={form.endDate}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        endDate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule-published">Data de publicação</Label>
                <Input
                  id="schedule-published"
                  type="date"
                  disabled={!canEditPublishedAt}
                  value={form.publishedAt}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      publishedAt: event.target.value,
                    }))
                  }
                />
                {!canEditPublishedAt && (
                  <p className="text-muted-foreground text-xs">
                    A data de publicação é habilitada quando o status é diferente de rascunho.
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {successMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={handleReset}>
                  {isCreateMode ? 'Limpar' : 'Desfazer alterações'}
                </Button>
                <Button type="submit" className="gap-2">
                  {isCreateMode ? <FilePlus2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {isCreateMode ? 'Criar escala' : 'Salvar alterações'}
                </Button>
              </div>
            </div>
          </form>

          <aside className="space-y-4">
            <div className="border-border bg-card shadow-card rounded-2xl border p-5">
              <h3 className="font-display text-foreground text-base font-semibold">
                Resumo rápido
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="border-border bg-background rounded-xl border p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Local</p>
                  <p className="text-foreground mt-2 flex items-center gap-2">
                    <MapPin className="text-brand-500 h-4 w-4" />
                    {selectedLocation?.name ?? 'Não informado'}
                  </p>
                </div>

                <div className="border-border bg-background rounded-xl border p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">Período</p>
                  <p className="text-foreground mt-2 flex items-center gap-2">
                    <Calendar className="text-brand-500 h-4 w-4" />
                    {form.startDate ? formatDate(form.startDate) : '—'} até{' '}
                    {form.endDate ? formatDate(form.endDate) : '—'}
                  </p>
                </div>

                <div className="border-border bg-background rounded-xl border p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Publicação
                  </p>
                  <p className="text-foreground mt-2 flex items-center gap-2">
                    <Clock className="text-brand-500 h-4 w-4" />
                    {form.publishedAt ? formatDate(form.publishedAt) : 'Ainda não publicada'}
                  </p>
                </div>
              </div>
            </div>

            {!isCreateMode && schedule && (
              <div className="border-border bg-card shadow-card rounded-2xl border p-5">
                <h3 className="font-display text-foreground text-base font-semibold">Metadados</h3>
                <div className="text-muted-foreground mt-3 space-y-2 text-sm">
                  <p>
                    Criada em{' '}
                    <span className="text-foreground font-medium">
                      {formatDate(schedule.createdAt)}
                    </span>
                  </p>
                  <p>
                    Atualizada em{' '}
                    <span className="text-foreground font-medium">
                      {formatDate(schedule.updatedAt)}
                    </span>
                  </p>
                  <p className="break-all text-xs">ID: {schedule.id}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
