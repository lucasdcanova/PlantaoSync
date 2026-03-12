import { create } from 'zustand'
import type { Schedule, ScheduleCoverageMode, ScheduleStatus } from '@agendaplantao/shared'

export interface ScheduleExtraShift {
  id: string
  date: string
  startTime: string
  endTime: string
  requiredCount: number
  notes?: string
  locationId: string
}

export interface ScheduleGeofenceConfig {
  lat: number
  lng: number
  radiusMeters: number
  autoCheckInEnabled: boolean
  label?: string
}

export interface ManagerSchedule extends Schedule {
  extraShifts: ScheduleExtraShift[]
  requireSwapApproval: boolean
  shiftValue: number
  geofence?: ScheduleGeofenceConfig
}

export interface ScheduleEditorInput {
  locationId: string
  locationName?: string
  shiftValue: number
  title: string
  description?: string
  startDate: string
  endDate: string
  coverageMode: ScheduleCoverageMode
  coverageStartTime?: string
  coverageEndTime?: string
  shiftDurationHours: number
  professionalsPerShift: number
  status: ScheduleStatus
  publishedAt?: string
  requireSwapApproval: boolean
  geofence?: ScheduleGeofenceConfig
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
  /** True once the first successful fetch from the backend has completed. */
  hasFetched: boolean
  createSchedule: (input: ScheduleEditorInput) => ManagerSchedule
  updateSchedule: (id: string, input: ScheduleEditorInput) => ManagerSchedule
  deleteSchedule: (id: string) => void
  setSchedules: (schedules: Partial<ManagerSchedule>[]) => void
  upsertSchedule: (schedule: Partial<ManagerSchedule>) => ManagerSchedule
  removeSchedule: (id: string) => void
  addExtraShift: (scheduleId: string, input: ScheduleExtraShiftInput) => ScheduleExtraShift
  removeExtraShift: (scheduleId: string, extraShiftId: string) => void
  resetSchedules: () => void
}

const LOCAL_ORGANIZATION_ID = 'org-local'
const DEFAULT_SHIFT_VALUE = 140_000

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeDate(value?: string) {
  if (!value) return undefined
  return value.slice(0, 10)
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

function isValidTime(value?: string) {
  if (!value) return false
  return TIME_REGEX.test(value)
}

function timeToMinutes(value: string) {
  if (!isValidTime(value)) return Number.NaN
  const [hourPart, minutePart] = value.split(':')
  const hours = Number(hourPart)
  const minutes = Number(minutePart)
  return hours * 60 + minutes
}

function normalizeCoverageMode(mode?: ScheduleCoverageMode): ScheduleCoverageMode {
  return mode === 'CUSTOM_WINDOW' ? 'CUSTOM_WINDOW' : 'FULL_DAY'
}

function normalizeCoverageTime(
  value: string | undefined,
  fallback: string,
  mode: ScheduleCoverageMode,
) {
  if (mode !== 'CUSTOM_WINDOW') return undefined
  if (isValidTime(value)) return value
  return fallback
}

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (Number.isFinite(value) && Number(value) >= 1) {
    return Math.max(1, Math.round(Number(value)))
  }
  return fallback
}

function getCoverageDurationHours(
  coverageMode: ScheduleCoverageMode,
  coverageStartTime?: string,
  coverageEndTime?: string,
) {
  if (coverageMode === 'FULL_DAY') return 24
  if (!coverageStartTime || !coverageEndTime) return Number.NaN

  const startMinutes = timeToMinutes(coverageStartTime)
  const endMinutes = timeToMinutes(coverageEndTime)
  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) return Number.NaN
  if (startMinutes === endMinutes) return Number.NaN

  let durationMinutes = endMinutes - startMinutes
  if (durationMinutes < 0) durationMinutes += 24 * 60
  return durationMinutes / 60
}

function normalizeShiftValue(value?: number, locationId?: string) {
  if (Number.isFinite(value) && Number(value) > 0) {
    return Math.round(Number(value))
  }

  return DEFAULT_SHIFT_VALUE
}

function normalizeGeofence(
  geofence: Partial<ScheduleGeofenceConfig> | undefined,
  _locationId?: string,
): ScheduleGeofenceConfig | undefined {
  const source = geofence
  if (!source) return undefined

  const lat = Number(source.lat)
  const lng = Number(source.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined

  return {
    lat,
    lng,
    radiusMeters:
      Number.isFinite(source.radiusMeters) && Number(source.radiusMeters) > 0
        ? Math.round(Number(source.radiusMeters))
        : 180,
    autoCheckInEnabled:
      typeof source.autoCheckInEnabled === 'boolean'
        ? source.autoCheckInEnabled
        : false,
    label: source.label?.trim() || undefined,
  }
}

function buildLocation(locationId: string, fallbackName?: string) {
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
  const locationId = schedule.locationId ?? 'loc-unknown'
  const coverageMode = normalizeCoverageMode(schedule.coverageMode)

  const extraShifts = (schedule.extraShifts ?? []).map((extraShift) =>
    normalizeExtraShift(extraShift, locationId),
  )

  return {
    ...(schedule as Schedule),
    id: schedule.id ?? `schedule-${Date.now().toString(36)}`,
    organizationId: schedule.organizationId ?? LOCAL_ORGANIZATION_ID,
    locationId,
    title: schedule.title ?? 'Escala sem título',
    description: schedule.description ?? undefined,
    startDate: normalizeDate(schedule.startDate) ?? todayDate(),
    endDate: normalizeDate(schedule.endDate) ?? todayDate(),
    coverageMode,
    coverageStartTime: normalizeCoverageTime(schedule.coverageStartTime, '07:00', coverageMode),
    coverageEndTime: normalizeCoverageTime(schedule.coverageEndTime, '19:00', coverageMode),
    shiftDurationHours: normalizePositiveInteger(schedule.shiftDurationHours, 12),
    professionalsPerShift: normalizePositiveInteger(schedule.professionalsPerShift, 1),
    publishedAt: normalizeDate(schedule.publishedAt),
    createdAt: normalizeDate(schedule.createdAt) ?? todayDate(),
    updatedAt: normalizeDate(schedule.updatedAt) ?? todayDate(),
    status: schedule.status ?? 'DRAFT',
    location: buildLocation(locationId, schedule.location?.name),
    shifts: schedule.shifts ?? [],
    extraShifts,
    requireSwapApproval: schedule.requireSwapApproval ?? true,
    shiftValue: normalizeShiftValue(schedule.shiftValue, locationId),
    geofence: normalizeGeofence(schedule.geofence, locationId),
  } satisfies ManagerSchedule
}

function withSortedSchedules(schedules: ManagerSchedule[]) {
  return [...schedules].sort((a, b) => b.startDate.localeCompare(a.startDate))
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

  if (!Number.isFinite(input.shiftValue) || input.shiftValue <= 0) {
    throw new Error('Informe um valor por plantão maior que zero.')
  }

  const normalizedCoverageMode = normalizeCoverageMode(input.coverageMode)
  const normalizedShiftDurationHours = normalizePositiveInteger(input.shiftDurationHours, 0)
  const normalizedProfessionalsPerShift = normalizePositiveInteger(input.professionalsPerShift, 0)
  const normalizedCoverageStartTime =
    normalizedCoverageMode === 'CUSTOM_WINDOW'
      ? normalizeCoverageTime(input.coverageStartTime, '', normalizedCoverageMode)
      : undefined
  const normalizedCoverageEndTime =
    normalizedCoverageMode === 'CUSTOM_WINDOW'
      ? normalizeCoverageTime(input.coverageEndTime, '', normalizedCoverageMode)
      : undefined

  if (normalizedCoverageMode === 'CUSTOM_WINDOW') {
    if (!isValidTime(normalizedCoverageStartTime)) {
      throw new Error('Informe um horário de início válido para o período da escala.')
    }
    if (!isValidTime(normalizedCoverageEndTime)) {
      throw new Error('Informe um horário de término válido para o período da escala.')
    }
  }

  if (!Number.isFinite(normalizedShiftDurationHours) || normalizedShiftDurationHours < 1) {
    throw new Error('Informe uma duração de plantão válida em horas.')
  }

  if (!Number.isFinite(normalizedProfessionalsPerShift) || normalizedProfessionalsPerShift < 1) {
    throw new Error('Informe quantos médicos por plantão são necessários.')
  }

  const coverageDurationHours = getCoverageDurationHours(
    normalizedCoverageMode,
    normalizedCoverageStartTime,
    normalizedCoverageEndTime,
  )

  if (!Number.isFinite(coverageDurationHours) || coverageDurationHours <= 0) {
    throw new Error('Período de cobertura inválido. Ajuste os horários da escala.')
  }

  if (normalizedShiftDurationHours > coverageDurationHours) {
    throw new Error('A duração do plantão não pode ser maior que a janela de cobertura.')
  }

  const shiftsPerPeriod = coverageDurationHours / normalizedShiftDurationHours
  if (!Number.isInteger(shiftsPerPeriod)) {
    throw new Error(
      'A duração do plantão deve dividir exatamente a cobertura selecionada (ex.: 24h/12h).',
    )
  }

  if (input.geofence) {
    if (!Number.isFinite(input.geofence.lat) || input.geofence.lat < -90 || input.geofence.lat > 90) {
      throw new Error('Latitude da geofence inválida.')
    }
    if (!Number.isFinite(input.geofence.lng) || input.geofence.lng < -180 || input.geofence.lng > 180) {
      throw new Error('Longitude da geofence inválida.')
    }
    if (!Number.isFinite(input.geofence.radiusMeters) || input.geofence.radiusMeters < 30) {
      throw new Error('Raio da geofence deve ser maior ou igual a 30m.')
    }
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
  const normalizedLocationName = input.locationName?.trim()
  const normalizedCoverageMode = normalizeCoverageMode(input.coverageMode)

  return normalizeSchedule({
    id: base.id,
    organizationId: base.organizationId,
    locationId: input.locationId,
    location: normalizedLocationName
      ? {
          id: input.locationId,
          name: normalizedLocationName,
        }
      : undefined,
    shiftValue: normalizeShiftValue(input.shiftValue, input.locationId),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    startDate: normalizeDate(input.startDate) ?? todayDate(),
    endDate: normalizeDate(input.endDate) ?? todayDate(),
    coverageMode: normalizedCoverageMode,
    coverageStartTime: normalizeCoverageTime(
      input.coverageStartTime,
      '07:00',
      normalizedCoverageMode,
    ),
    coverageEndTime: normalizeCoverageTime(
      input.coverageEndTime,
      '19:00',
      normalizedCoverageMode,
    ),
    shiftDurationHours: normalizePositiveInteger(input.shiftDurationHours, 12),
    professionalsPerShift: normalizePositiveInteger(input.professionalsPerShift, 1),
    status: input.status,
    publishedAt: normalizedPublishedAt,
    createdAt: normalizeDate(base.createdAt) ?? todayDate(),
    updatedAt: normalizeDate(base.updatedAt) ?? todayDate(),
    extraShifts: base.extraShifts,
    requireSwapApproval: input.requireSwapApproval,
    shifts: base.shifts ?? [],
    geofence: normalizeGeofence(input.geofence, input.locationId),
  })
}

export const useSchedulesStore = create<SchedulesState>()(
  (set, get) => ({
    // Start empty and hydrate from backend.
    schedules: [],
    hasFetched: false,

    createSchedule: (input) => {
      validateInput(input)

      const newSchedule = buildScheduleRecord(input, {
        id: `schedule-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        organizationId: LOCAL_ORGANIZATION_ID,
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

    setSchedules: (schedules) =>
      set({
        hasFetched: true,
        schedules: withSortedSchedules(
          schedules.map((schedule) => normalizeSchedule(schedule)),
        ),
      }),

    upsertSchedule: (schedule) => {
      const normalized = normalizeSchedule(schedule)
      set((state) => {
        const exists = state.schedules.some((item) => item.id === normalized.id)
        return {
          schedules: withSortedSchedules(
            exists
              ? state.schedules.map((item) => (item.id === normalized.id ? normalized : item))
              : [normalized, ...state.schedules],
          ),
        }
      })
      return normalized
    },

    removeSchedule: (id) =>
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

    resetSchedules: () => set({ schedules: [], hasFetched: false }),
  }),
)
