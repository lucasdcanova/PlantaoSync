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
  Plus,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'
import type { ScheduleStatus } from '@agendaplantao/shared'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEMO_LOCATIONS } from '@/lib/demo-data'
import { SHIFT_STATUS_CONFIG, formatDate } from '@/lib/utils'
import {
  useSchedulesStore,
  type ScheduleEditorInput,
  type ScheduleExtraShiftInput,
} from '@/store/schedules.store'

type ScheduleFormValues = {
  title: string
  description: string
  locationId: string
  startDate: string
  endDate: string
  status: ScheduleStatus
  publishedAt: string
  requireSwapApproval: boolean
}

type ExtraShiftFormValues = {
  date: string
  startTime: string
  endTime: string
  requiredCount: number
  notes: string
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
  requireSwapApproval: true,
}

const DEFAULT_EXTRA_SHIFT_FORM: ExtraShiftFormValues = {
  date: '',
  startTime: '07:00',
  endTime: '19:00',
  requiredCount: 1,
  notes: '',
}

function toFormValues(input: {
  title: string
  description?: string
  locationId: string
  startDate: string
  endDate: string
  status: ScheduleStatus
  publishedAt?: string
  requireSwapApproval: boolean
}) {
  return {
    title: input.title,
    description: input.description ?? '',
    locationId: input.locationId,
    startDate: input.startDate.slice(0, 10),
    endDate: input.endDate.slice(0, 10),
    status: input.status,
    publishedAt: input.publishedAt?.slice(0, 10) ?? '',
    requireSwapApproval: input.requireSwapApproval,
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
  const addExtraShift = useSchedulesStore((state) => state.addExtraShift)
  const removeExtraShift = useSchedulesStore((state) => state.removeExtraShift)

  const schedule = useMemo(
    () => (isCreateMode ? null : (schedules.find((item) => item.id === scheduleId) ?? null)),
    [isCreateMode, scheduleId, schedules],
  )

  const [form, setForm] = useState<ScheduleFormValues>(DEFAULT_FORM)
  const [extraShiftForm, setExtraShiftForm] =
    useState<ExtraShiftFormValues>(DEFAULT_EXTRA_SHIFT_FORM)
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
      requireSwapApproval: form.requireSwapApproval,
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

  const handleAddExtraShift = () => {
    if (isCreateMode || !scheduleId || !schedule) {
      setErrorMessage('Salve a escala primeiro para incluir turnos extras.')
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)

    const payload: ScheduleExtraShiftInput = {
      date: extraShiftForm.date,
      startTime: extraShiftForm.startTime,
      endTime: extraShiftForm.endTime,
      requiredCount: Number(extraShiftForm.requiredCount),
      notes: extraShiftForm.notes,
      locationId: form.locationId,
    }

    try {
      addExtraShift(scheduleId, payload)
      setExtraShiftForm(DEFAULT_EXTRA_SHIFT_FORM)
      setSuccessMessage('Turno extra adicionado à escala.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao adicionar turno extra.')
    }
  }

  const handleRemoveExtraShift = (extraShiftId: string) => {
    if (!scheduleId) return

    removeExtraShift(scheduleId, extraShiftId)
    setSuccessMessage('Turno extra removido.')
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
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
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

        <div className="mx-auto grid w-full max-w-6xl gap-5 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5">
            <form
              onSubmit={handleSave}
              className="border-border bg-card shadow-card rounded-2xl border p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-foreground text-xl font-bold">
                    Dados da escala
                  </h2>
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
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
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
                    className="border-input bg-card text-foreground shadow-card placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background flex w-full resize-y rounded-md border px-3 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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
                      className="border-input bg-card text-foreground shadow-card focus-visible:ring-ring focus-visible:ring-offset-background h-10 w-full rounded-md border px-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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
                      className="border-input bg-card text-foreground shadow-card focus-visible:ring-ring focus-visible:ring-offset-background h-10 w-full rounded-md border px-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
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

                <div className="border-border bg-background rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        Autorização de troca por gestor
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Quando ativo, solicitações de troca desta escala exigem validação da gestão.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.requireSwapApproval}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            requireSwapApproval: event.target.checked,
                          }))
                        }
                        className="border-border text-brand-600 focus:ring-brand-500 h-4 w-4 rounded"
                      />
                      <span className="text-foreground text-xs font-medium">
                        {form.requireSwapApproval ? 'Ativa' : 'Desativada'}
                      </span>
                    </label>
                  </div>
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
                    {isCreateMode ? (
                      <FilePlus2 className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isCreateMode ? 'Criar escala' : 'Salvar alterações'}
                  </Button>
                </div>
              </div>
            </form>

            <section className="border-border bg-card shadow-card rounded-2xl border p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-foreground text-lg font-bold">
                    Turnos extras por data
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Adicione reforços pontuais (ex.: carnaval, eventos, sobrecarga inesperada).
                  </p>
                </div>
                <Badge variant="outline" className="text-[11px]">
                  Datas especiais
                </Badge>
              </div>

              {isCreateMode ? (
                <div className="border-border bg-background text-muted-foreground rounded-xl border border-dashed px-4 py-5 text-sm">
                  Salve a escala para habilitar o cadastro de turnos extras.
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="extra-date">Data</Label>
                      <Input
                        id="extra-date"
                        type="date"
                        value={extraShiftForm.date}
                        onChange={(event) =>
                          setExtraShiftForm((prev) => ({ ...prev, date: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="extra-start">Início</Label>
                      <Input
                        id="extra-start"
                        type="time"
                        value={extraShiftForm.startTime}
                        onChange={(event) =>
                          setExtraShiftForm((prev) => ({ ...prev, startTime: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="extra-end">Fim</Label>
                      <Input
                        id="extra-end"
                        type="time"
                        value={extraShiftForm.endTime}
                        onChange={(event) =>
                          setExtraShiftForm((prev) => ({ ...prev, endTime: event.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="extra-required">Qtd. médicos</Label>
                      <Input
                        id="extra-required"
                        type="number"
                        min={1}
                        value={extraShiftForm.requiredCount}
                        onChange={(event) =>
                          setExtraShiftForm((prev) => ({
                            ...prev,
                            requiredCount: Number(event.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" onClick={handleAddExtraShift} className="w-full gap-2">
                        <Plus className="h-4 w-4" />
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <Label htmlFor="extra-notes">Observações do turno extra</Label>
                    <Input
                      id="extra-notes"
                      value={extraShiftForm.notes}
                      onChange={(event) =>
                        setExtraShiftForm((prev) => ({ ...prev, notes: event.target.value }))
                      }
                      placeholder="Motivo, detalhes do reforço e cobertura esperada."
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    {schedule?.extraShifts.length ? (
                      schedule.extraShifts.map((extraShift) => (
                        <article
                          key={extraShift.id}
                          className="border-border bg-background flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-foreground text-sm font-medium">
                              {formatDate(extraShift.date)} · {extraShift.startTime} às{' '}
                              {extraShift.endTime}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {extraShift.requiredCount} médico(s) ·{' '}
                              {DEMO_LOCATIONS.find((item) => item.id === extraShift.locationId)
                                ?.name || 'Local não informado'}
                            </p>
                            {extraShift.notes && (
                              <p className="text-muted-foreground mt-0.5 text-xs">
                                {extraShift.notes}
                              </p>
                            )}
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => handleRemoveExtraShift(extraShift.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remover
                          </Button>
                        </article>
                      ))
                    ) : (
                      <div className="border-border bg-background text-muted-foreground rounded-xl border border-dashed px-4 py-5 text-sm">
                        Nenhum turno extra cadastrado para esta escala.
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </div>

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

                <div className="border-border bg-background rounded-xl border p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Troca na escala
                  </p>
                  <p className="text-foreground mt-2 flex items-center gap-2">
                    {form.requireSwapApproval ? (
                      <>
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                        Exige aprovação do gestor
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4 text-amber-600" />
                        Troca sem validação da gestão
                      </>
                    )}
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
                  <p>
                    Turnos extras:{' '}
                    <span className="text-foreground font-medium">
                      {schedule.extraShifts.length}
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
