export const OPEN_ENDED_SCHEDULE_END_DATE = '9999-12-31'

function toDateKey(value: string) {
  return value.slice(0, 10)
}

export function isOpenEndedSchedule(endDate?: string) {
  if (!endDate) return false
  return toDateKey(endDate) === OPEN_ENDED_SCHEDULE_END_DATE
}

export function getScheduleRangeEndDate(endDate?: string) {
  if (!endDate) return OPEN_ENDED_SCHEDULE_END_DATE
  if (isOpenEndedSchedule(endDate)) return OPEN_ENDED_SCHEDULE_END_DATE
  return toDateKey(endDate)
}

export function isDateInScheduleRange(date: string, startDate: string, endDate?: string) {
  const normalizedDate = toDateKey(date)
  const normalizedStartDate = toDateKey(startDate)
  const normalizedEndDate = getScheduleRangeEndDate(endDate)

  return normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate
}

export function doesScheduleOverlapRange(
  scheduleStartDate: string,
  scheduleEndDate: string | undefined,
  rangeStartDate: string,
  rangeEndDate: string,
) {
  const normalizedScheduleStart = toDateKey(scheduleStartDate)
  const normalizedScheduleEnd = getScheduleRangeEndDate(scheduleEndDate)
  const normalizedRangeStart = toDateKey(rangeStartDate)
  const normalizedRangeEnd = toDateKey(rangeEndDate)

  return normalizedScheduleStart <= normalizedRangeEnd && normalizedScheduleEnd >= normalizedRangeStart
}
