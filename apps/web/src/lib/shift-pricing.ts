import type { ManagerLocation } from '@/store/locations.store'
import type { ManagerSchedule } from '@/store/schedules.store'

const DEFAULT_SHIFT_VALUE = 140_000

type ShiftValueResolverInput = {
  date: string
  sectorName: string
  scheduleId?: string
  fallbackValue?: number
}

function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function dateKey(value: string) {
  return value.slice(0, 10)
}

function pickScheduleShiftValue(schedule?: ManagerSchedule | null) {
  if (!schedule) return undefined
  if (!Number.isFinite(schedule.shiftValue) || schedule.shiftValue <= 0) return undefined
  return schedule.shiftValue
}

function pickFallbackValue(value?: number) {
  if (!Number.isFinite(value) || Number(value) <= 0) return DEFAULT_SHIFT_VALUE
  return Math.round(Number(value))
}

function getShiftWindow(date: string, startTime: string, endTime: string) {
  const start = new Date(`${date}T${startTime}:00`)
  const end = new Date(`${date}T${endTime}:00`)

  if (end <= start) end.setDate(end.getDate() + 1)

  return { start, end }
}

function scheduleContainsDate(schedule: ManagerSchedule, shiftDate: string) {
  const normalizedDate = dateKey(shiftDate)
  return (
    normalizedDate >= dateKey(schedule.startDate) && normalizedDate <= dateKey(schedule.endDate)
  )
}

export function getShiftDurationHours(date: string, startTime: string, endTime: string) {
  const { start, end } = getShiftWindow(date, startTime, endTime)
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

export function createShiftValueResolver(
  schedules: ManagerSchedule[],
  locations: ManagerLocation[],
) {
  const scheduleById = new Map(schedules.map((schedule) => [schedule.id, schedule]))

  const locationIdByName = new Map(
    locations.map((location) => [normalizeName(location.name), location.id]),
  )

  const schedulesByLocation = new Map<string, ManagerSchedule[]>()
  schedules.forEach((schedule) => {
    const current = schedulesByLocation.get(schedule.locationId) ?? []
    current.push(schedule)
    schedulesByLocation.set(schedule.locationId, current)
  })

  const sortedSchedules = [...schedules].sort((a, b) => {
    return (
      dateKey(b.updatedAt).localeCompare(dateKey(a.updatedAt)) ||
      dateKey(b.startDate).localeCompare(dateKey(a.startDate))
    )
  })

  return ({ date, sectorName, scheduleId, fallbackValue }: ShiftValueResolverInput) => {
    const fallback = pickFallbackValue(fallbackValue)

    const directValue = pickScheduleShiftValue(
      scheduleId ? scheduleById.get(scheduleId) : undefined,
    )
    if (directValue) return directValue

    const locationId = locationIdByName.get(normalizeName(sectorName))
    if (locationId) {
      const locationSchedules = schedulesByLocation.get(locationId) ?? []
      const match = locationSchedules.find((schedule) => scheduleContainsDate(schedule, date))
      const matchValue = pickScheduleShiftValue(match)
      if (matchValue) return matchValue
    }

    const byName = sortedSchedules.find((schedule) => {
      const scheduleLocationName = schedule.location?.name
      if (!scheduleLocationName) return false
      return (
        normalizeName(scheduleLocationName) === normalizeName(sectorName) &&
        scheduleContainsDate(schedule, date)
      )
    })
    const byNameValue = pickScheduleShiftValue(byName)
    if (byNameValue) return byNameValue

    const byDateOnly = sortedSchedules.find((schedule) => scheduleContainsDate(schedule, date))
    const byDateValue = pickScheduleShiftValue(byDateOnly)
    if (byDateValue) return byDateValue

    return fallback
  }
}
