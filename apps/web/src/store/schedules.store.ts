import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Schedule, ScheduleStatus } from '@agendaplantao/shared'
import { DEMO_LOCATIONS, DEMO_SCHEDULES } from '@/lib/demo-data'

export interface ScheduleExtraShift {
  id: string
  date: string
  startTime: string
  endTime: string
  requiredCount: number
  notes?: string
  locationId: string
}

export interface ManagerSchedule extends Schedule {
  extraShifts: ScheduleExtraShift[]
  requireSwapApproval: boolean
}

export interface ScheduleEditorInput {
  locationId: string
  title: string
  description?: string
  startDate: string
  endDate: string
  status: ScheduleStatus
  publishedAt?: string
  requireSwapApproval: boolean
}

export interface ScheduleExtraShiftInput {
  date: string
  startTime: string
  endTime: string
  requiredCount: number
  notes?: string
  locationId?: string
}

interface SchedulesState {
  schedules: ManagerSchedule[]
  createSchedule: (input: ScheduleEditorInput) => ManagerSchedule
  updateSchedule: (id: string, input: ScheduleEditorInput) => ManagerSchedule
  deleteSchedule: (id: string) => void
  addExtraShift: (scheduleId: string, input: ScheduleExtraShiftInput) => ScheduleExtraShift
  removeExtraShift: (scheduleId: string, extraShiftId: string) => void
  resetSchedules: () => void
}

const DEMO_ORGANIZATION_ID = 'org-demo'

const DEMO_EXTRA_SHIFTS_BY_SCHEDULE: Record<string, ScheduleExtraShift[]> = {
  '1': [
    {
      id: 'extra-1-1',
      date: '2026-02-17',
      startTime: '08:00',
      endTime: '14:00',
      requiredCount: 1,
      notes: 'Cobertura especial de Carnaval para reforço de UTI.',
      locationId: 'loc-uti',
    },
  ],
  '2': [
    {
      id: 'extra-2-1',
      date: '2026-02-22',
      startTime: '10:00',
      endTime: '16:00',
      requiredCount: 2,
      notes: 'Mutirão de pós-feriado no Pronto-Socorro.',
      locationId: 'loc-ps',
    },
  ],
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeDate(value?: string) {
  if (!value) return undefined
  return value.slice(0, 10)
}

function buildLocation(locationId: string, fallbackName?: string) {
  const location = DEMO_LOCATIONS.find((item) => item.id === locationId)
  if (location) {
    return { id: location.id, name: location.name }
  }

  return {
    id: locationId,
    name: fallbackName?.trim() || 'Não informado',
  }
}

function normalizeExtraShift(extraShift: Partial<ScheduleExtraShift>, fallbackLocationId: string) {
  return {
    id: extraShift.id ?? `extra-${Date.now().toString(36)}`,
    date: normalizeDate(extraShift.date) ?? todayDate(),
    startTime: extraShift.startTime ?? '07:00',
    endTime: extraShift.endTime ?? '19:00',
    requiredCount: Number.isFinite(extraShift.requiredCount)
      ? Math.max(1, Number(extraShift.requiredCount))
      : 1,
    notes: extraShift.notes?.trim() || undefined,
    locationId: extraShift.locationId || fallbackLocationId,
  } satisfies ScheduleExtraShift
}

function normalizeSchedule(schedule: Partial<ManagerSchedule>) {
  const locationId = schedule.locationId ?? DEMO_LOCATIONS[0]?.id ?? 'loc-unknown'

  const extraShifts = (schedule.extraShifts ?? []).map((extraShift) =>
    normalizeExtraShift(extraShift, locationId),
  )

  return {
    ...(schedule as Schedule),
    id: schedule.id ?? `schedule-${Date.now().toString(36)}`,
    organizationId: schedule.organizationId ?? DEMO_ORGANIZATION_ID,
    locationId,
    title: schedule.title ?? 'Escala sem título',
    description: schedule.description ?? undefined,
    startDate: normalizeDate(schedule.startDate) ?? todayDate(),
    endDate: normalizeDate(schedule.endDate) ?? todayDate(),
    publishedAt: normalizeDate(schedule.publishedAt),
    createdAt: normalizeDate(schedule.createdAt) ?? todayDate(),
    updatedAt: normalizeDate(schedule.updatedAt) ?? todayDate(),
    status: schedule.status ?? 'DRAFT',
    location: buildLocation(locationId, schedule.location?.name),
    shifts: schedule.shifts ?? [],
    extraShifts,
    requireSwapApproval: schedule.requireSwapApproval ?? true,
  } satisfies ManagerSchedule
}

function withSortedSchedules(schedules: ManagerSchedule[]) {
  return [...schedules].sort((a, b) => b.startDate.localeCompare(a.startDate))
}

function buildInitialSchedules() {
  return withSortedSchedules(
    DEMO_SCHEDULES.map((schedule) =>
      normalizeSchedule({
        ...schedule,
        extraShifts: DEMO_EXTRA_SHIFTS_BY_SCHEDULE[schedule.id] ?? [],
        requireSwapApproval: schedule.status !== 'ARCHIVED',
      }),
    ),
  )
}

function validateInput(input: ScheduleEditorInput) {
  if (!input.title.trim()) {
    throw new Error('Informe o título da escala.')
  }

  if (!input.locationId.trim()) {
    throw new Error('Selecione um local para a escala.')
  }

  if (!input.startDate || !input.endDate) {
    throw new Error('Informe a data de início e fim da escala.')
  }

  if (input.startDate > input.endDate) {
    throw new Error('A data de início não pode ser maior que a data final.')
  }
}

function validateExtraShiftInput(input: ScheduleExtraShiftInput) {
  if (!input.date) {
    throw new Error('Informe a data do turno extra.')
  }

  if (!input.startTime || !input.endTime) {
    throw new Error('Informe horário de início e fim do turno extra.')
  }

  if (input.startTime === input.endTime) {
    throw new Error('Horário de início e fim não podem ser iguais.')
  }

  if (!Number.isFinite(input.requiredCount) || input.requiredCount < 1) {
    throw new Error('Quantidade de profissionais deve ser maior que zero.')
  }
}

function buildScheduleRecord(
  input: ScheduleEditorInput,
  base: Pick<ManagerSchedule, 'id' | 'organizationId' | 'createdAt' | 'extraShifts' | 'shifts'> & {
    updatedAt?: string
  },
) {
  const normalizedPublishedAt =
    input.status === 'DRAFT' ? undefined : (normalizeDate(input.publishedAt) ?? todayDate())

  return normalizeSchedule({
    id: base.id,
    organizationId: base.organizationId,
    locationId: input.locationId,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    startDate: normalizeDate(input.startDate) ?? todayDate(),
    endDate: normalizeDate(input.endDate) ?? todayDate(),
    status: input.status,
    publishedAt: normalizedPublishedAt,
    createdAt: normalizeDate(base.createdAt) ?? todayDate(),
    updatedAt: normalizeDate(base.updatedAt) ?? todayDate(),
    extraShifts: base.extraShifts,
    requireSwapApproval: input.requireSwapApproval,
    shifts: base.shifts ?? [],
  })
}

export const useSchedulesStore = create<SchedulesState>()(
  persist(
    (set, get) => ({
      schedules: buildInitialSchedules(),

      createSchedule: (input) => {
        validateInput(input)

        const newSchedule = buildScheduleRecord(input, {
          id: `schedule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          organizationId: DEMO_ORGANIZATION_ID,
          createdAt: todayDate(),
          updatedAt: todayDate(),
          extraShifts: [],
          shifts: [],
        })

        set((state) => ({
          schedules: withSortedSchedules([newSchedule, ...state.schedules]),
        }))

        return newSchedule
      },

      updateSchedule: (id, input) => {
        validateInput(input)

        const current = get().schedules.find((item) => item.id === id)
        if (!current) {
          throw new Error('Escala não encontrada.')
        }

        const updated = buildScheduleRecord(input, {
          id: current.id,
          organizationId: current.organizationId,
          createdAt: current.createdAt,
          updatedAt: todayDate(),
          extraShifts: current.extraShifts,
          shifts: current.shifts,
        })

        set((state) => ({
          schedules: withSortedSchedules(
            state.schedules.map((item) => (item.id === id ? updated : item)),
          ),
        }))

        return updated
      },

      deleteSchedule: (id) =>
        set((state) => ({
          schedules: state.schedules.filter((item) => item.id !== id),
        })),

      addExtraShift: (scheduleId, input) => {
        validateExtraShiftInput(input)

        const schedule = get().schedules.find((item) => item.id === scheduleId)
        if (!schedule) {
          throw new Error('Escala não encontrada para adicionar turno extra.')
        }

        if (input.date < schedule.startDate || input.date > schedule.endDate) {
          throw new Error('A data do turno extra precisa estar dentro do período da escala.')
        }

        const extraShift = normalizeExtraShift(
          {
            id: `extra-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
            ...input,
          },
          input.locationId || schedule.locationId,
        )

        set((state) => ({
          schedules: state.schedules.map((item) =>
            item.id === scheduleId
              ? {
                  ...item,
                  updatedAt: todayDate(),
                  extraShifts: [...item.extraShifts, extraShift].sort((a, b) =>
                    `${a.date}-${a.startTime}`.localeCompare(`${b.date}-${b.startTime}`),
                  ),
                }
              : item,
          ),
        }))

        return extraShift
      },

      removeExtraShift: (scheduleId, extraShiftId) =>
        set((state) => ({
          schedules: state.schedules.map((item) =>
            item.id === scheduleId
              ? {
                  ...item,
                  updatedAt: todayDate(),
                  extraShifts: item.extraShifts.filter(
                    (extraShift) => extraShift.id !== extraShiftId,
                  ),
                }
              : item,
          ),
        })),

      resetSchedules: () => set({ schedules: buildInitialSchedules() }),
    }),
    {
      name: 'confirma-plantao-schedules',
      partialize: (state) => ({ schedules: state.schedules }),
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<SchedulesState> | undefined
        const persistedSchedules = typedPersistedState?.schedules ?? currentState.schedules

        return {
          ...currentState,
          ...typedPersistedState,
          schedules: withSortedSchedules(
            persistedSchedules.map((schedule) => normalizeSchedule(schedule)),
          ),
        }
      },
    },
  ),
)
