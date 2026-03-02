export type ScheduleStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'
export type ConfirmationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
export type FinancialStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED'
export type ScheduleCoverageMode = 'FULL_DAY' | 'CUSTOM_WINDOW'

export interface Schedule {
  id: string
  organizationId: string
  locationId: string
  title: string
  description?: string
  startDate: string
  endDate: string
  coverageMode?: ScheduleCoverageMode
  coverageStartTime?: string
  coverageEndTime?: string
  shiftDurationHours?: number
  professionalsPerShift?: number
  status: ScheduleStatus
  publishedAt?: string
  createdAt: string
  updatedAt: string
  shifts?: Shift[]
  location?: {
    id: string
    name: string
  }
}

export interface Shift {
  id: string
  scheduleId: string
  locationId: string
  date: string
  startTime: string
  endTime: string
  specialty?: string
  requiredCount: number
  valuePerShift: number
  notes?: string
  createdAt: string
  confirmations?: ShiftConfirmation[]
  confirmedCount?: number
}

export interface ShiftConfirmation {
  id: string
  shiftId: string
  userId: string
  status: ConfirmationStatus
  confirmedAt?: string
  cancelledAt?: string
  notes?: string
  createdAt: string
  user?: {
    id: string
    name: string
    avatarUrl?: string
    specialty?: string
  }
  shift?: Shift
}

export interface CreateScheduleDto {
  locationId: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  coverageMode?: ScheduleCoverageMode
  coverageStartTime?: string
  coverageEndTime?: string
  shiftDurationHours?: number
  professionalsPerShift?: number
}

export interface CreateShiftDto {
  scheduleId: string
  locationId: string
  date: string
  startTime: string
  endTime: string
  specialty?: string
  requiredCount?: number
  valuePerShift: number
  notes?: string
}
