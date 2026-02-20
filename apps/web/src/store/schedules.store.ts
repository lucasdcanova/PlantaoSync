import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Schedule, ScheduleStatus } from '@agendaplantao/shared'
import { DEMO_LOCATIONS, DEMO_SCHEDULES } from '@/lib/demo-data'

export interface ScheduleEditorInput {
  locationId: string
  title: string
  description?: string
  startDate: string
  endDate: string
  status: ScheduleStatus
  publishedAt?: string
}

interface SchedulesState {
  schedules: Schedule[]
  createSchedule: (input: ScheduleEditorInput) => Schedule
  updateSchedule: (id: string, input: ScheduleEditorInput) => Schedule
  deleteSchedule: (id: string) => void
  resetSchedules: () => void
}

const DEMO_ORGANIZATION_ID = 'org-demo'

function todayDate() {
  return new Date().toISOString().slice(0, 10)
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

function normalizeDate(value?: string) {
  if (!value) return undefined
  return value.slice(0, 10)
}

function withSortedSchedules(schedules: Schedule[]) {
  return [...schedules].sort((a, b) => b.startDate.localeCompare(a.startDate))
}

function buildInitialSchedules() {
  return withSortedSchedules(
    DEMO_SCHEDULES.map((schedule) => ({
      ...schedule,
      startDate: normalizeDate(schedule.startDate) ?? todayDate(),
      endDate: normalizeDate(schedule.endDate) ?? todayDate(),
      publishedAt: normalizeDate(schedule.publishedAt),
      createdAt: normalizeDate(schedule.createdAt) ?? todayDate(),
      updatedAt: normalizeDate(schedule.updatedAt) ?? todayDate(),
      location: buildLocation(schedule.locationId, schedule.location?.name),
      description: schedule.description ?? undefined,
    })),
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

function buildScheduleRecord(
  input: ScheduleEditorInput,
  base: Pick<Schedule, 'id' | 'organizationId' | 'createdAt'> & {
    updatedAt?: string
    shifts?: Schedule['shifts']
  },
) {
  const normalizedPublishedAt =
    input.status === 'DRAFT' ? undefined : (normalizeDate(input.publishedAt) ?? todayDate())

  return {
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
    location: buildLocation(input.locationId),
    shifts: base.shifts ?? [],
  } satisfies Schedule
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

      resetSchedules: () => set({ schedules: buildInitialSchedules() }),
    }),
    {
      name: 'confirma-plantao-schedules',
      partialize: (state) => ({ schedules: state.schedules }),
    },
  ),
)
