import type { ScheduleCoverageMode, ScheduleStatus } from '@agendaplantao/shared'
import type { ManagerLocation } from '@/store/locations.store'
import type { ProfessionalProfile } from '@/store/professionals.store'
import type { ManagerSchedule, ScheduleGeofenceConfig } from '@/store/schedules.store'

type ApiLocation = {
  id: string
  name: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

type ApiSchedule = {
  id: string
  organizationId: string
  locationId: string
  title: string
  description?: string | null
  startDate: string
  endDate: string
  coverageMode?: ScheduleCoverageMode | null
  coverageStartTime?: string | null
  coverageEndTime?: string | null
  shiftDurationHours?: number | null
  professionalsPerShift?: number | null
  shiftValue?: number | null
  requireSwapApproval?: boolean | null
  geofenceLat?: number | null
  geofenceLng?: number | null
  geofenceRadiusMeters?: number | null
  geofenceAutoCheckInEnabled?: boolean | null
  geofenceLabel?: string | null
  status: ScheduleStatus
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  location?: ApiLocation | null
  shifts?: ApiShift[] | null
}

type ApiShift = {
  id: string
  date: string
  startTime: string
  endTime: string
  requiredCount?: number | null
  notes?: string | null
  locationId: string
}

type ApiUser = {
  id: string
  name: string
  email: string
  crm?: string | null
  specialty?: string | null
  phone?: string | null
  isActive?: boolean
}

export type ApiInviteCode = {
  id: string
  code: string
  sectorName: string
  issuedByName: string
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED'
  expiresAt: string
  createdAt: string
}

function toDateKey(value?: string | null) {
  if (!value) return new Date().toISOString().slice(0, 10)
  return value.slice(0, 10)
}

export function mapApiLocationToManager(location: ApiLocation): ManagerLocation {
  return {
    id: location.id,
    name: location.name,
    criticality: 'Média',
    occupancyRate: 0,
    pendingShifts: 0,
    activeProfessionals: 0,
    monthlyCost: 0,
    isActive: location.isActive ?? true,
    createdAt: toDateKey(location.createdAt),
    updatedAt: toDateKey(location.updatedAt),
  }
}

function buildScheduleGeofence(schedule: ApiSchedule): ScheduleGeofenceConfig | undefined {
  if (!Number.isFinite(schedule.geofenceLat) || !Number.isFinite(schedule.geofenceLng)) {
    return undefined
  }

  return {
    lat: Number(schedule.geofenceLat),
    lng: Number(schedule.geofenceLng),
    radiusMeters:
      Number.isFinite(schedule.geofenceRadiusMeters) && Number(schedule.geofenceRadiusMeters) >= 30
        ? Math.round(Number(schedule.geofenceRadiusMeters))
        : 180,
    autoCheckInEnabled: Boolean(schedule.geofenceAutoCheckInEnabled),
    label: schedule.geofenceLabel ?? undefined,
  }
}

export function mapApiScheduleToManager(schedule: ApiSchedule): ManagerSchedule {
  const extraShifts =
    schedule.shifts?.map((shift) => ({
      id: shift.id,
      date: toDateKey(shift.date),
      startTime: shift.startTime,
      endTime: shift.endTime,
      requiredCount: shift.requiredCount ?? 1,
      notes: shift.notes ?? undefined,
      locationId: shift.locationId,
    })) ?? []

  return {
    id: schedule.id,
    organizationId: schedule.organizationId,
    locationId: schedule.locationId,
    title: schedule.title,
    description: schedule.description ?? undefined,
    startDate: toDateKey(schedule.startDate),
    endDate: toDateKey(schedule.endDate),
    coverageMode: schedule.coverageMode ?? 'FULL_DAY',
    coverageStartTime: schedule.coverageStartTime ?? undefined,
    coverageEndTime: schedule.coverageEndTime ?? undefined,
    shiftDurationHours: schedule.shiftDurationHours ?? 12,
    professionalsPerShift: schedule.professionalsPerShift ?? 1,
    status: schedule.status,
    publishedAt: schedule.publishedAt ? toDateKey(schedule.publishedAt) : undefined,
    createdAt: toDateKey(schedule.createdAt),
    updatedAt: toDateKey(schedule.updatedAt),
    shifts: [],
    location: schedule.location
      ? {
          id: schedule.location.id,
          name: schedule.location.name,
        }
      : undefined,
    extraShifts,
    requireSwapApproval: schedule.requireSwapApproval ?? true,
    shiftValue: schedule.shiftValue ?? 140_000,
    geofence: buildScheduleGeofence(schedule),
  }
}

export function mapApiProfessionalToProfessional(user: ApiUser): ProfessionalProfile {
  return {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    crm: user.crm ?? 'CRM não informado',
    specialty: user.specialty ?? 'Especialidade não informada',
    phone: user.phone ?? undefined,
    status: user.isActive ? 'Ativo' : 'Indisponível',
    hospitalStatus: user.isActive ? 'ATIVO' : 'REMOVIDO',
    acceptanceRate: 0,
    completedShifts: 0,
    nextAvailability: '—',
    locations: [],
  }
}
