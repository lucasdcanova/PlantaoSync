import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEMO_DOCTOR_MY_SHIFTS,
  DEMO_DOCTOR_SECTORS,
  DEMO_MANAGER_ASSIGNED_SHIFTS,
  DEMO_PROFESSIONALS,
} from '@/lib/demo-data'

export type GeoCaptureSource = 'browser' | 'demo-simulado'
export type AttendanceStatus = 'PENDENTE' | 'CHECKED_IN' | 'CHECKED_OUT'
export type StressRiskLevel = 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRITICO'
export type StressTriggerCode =
  | 'LOTACAO'
  | 'EQUIPE_REDUZIDA'
  | 'CASOS_GRAVES'
  | 'ATRASO_PASSAGEM'
  | 'FALHA_SISTEMA'
  | 'CONFLITO_EQUIPE'
  | 'FALTA_PAUSA'
  | 'SONO'
  | 'DOR_FISICA'
  | 'OUTRO'

export interface ShiftGeofence {
  sectorId: string
  sectorName: string
  lat: number
  lng: number
  radiusMeters: number
  label: string
  autoCheckInEnabled?: boolean
  configuredByManager?: boolean
  configuredAt?: string
}

export interface AttendanceGeoSnapshot {
  lat: number
  lng: number
  accuracyMeters: number
  capturedAt: string
  distanceMeters: number
  withinGeofence: boolean
  source: GeoCaptureSource
}

export interface StressSelfReport {
  level: 1 | 2 | 3 | 4 | 5
  energyLevel: 1 | 2 | 3 | 4 | 5
  supportLevel: 1 | 2 | 3 | 4 | 5
  triggers: StressTriggerCode[]
  note?: string
}

export interface StressScoreBreakdown {
  selfReport: number
  lateness: number
  overtime: number
  workload: number
  nightShift: number
  triggers: number
  lowEnergy: number
  lowSupport: number
  shortRest: number
}

export interface StressAnalytics {
  score: number
  riskLevel: StressRiskLevel
  breakdown: StressScoreBreakdown
  flags: string[]
  recoveryMinutesRecommended: number
  dominantDrivers: Array<{ key: keyof StressScoreBreakdown; value: number }>
}

export interface InstitutionShiftEvaluation {
  organization: 1 | 2 | 3 | 4 | 5
  patientVolume: 1 | 2 | 3 | 4 | 5
  safety: 1 | 2 | 3 | 4 | 5
  structure: 1 | 2 | 3 | 4 | 5
  paymentOnTime: 1 | 2 | 3 | 4 | 5
  teamEnvironment: 1 | 2 | 3 | 4 | 5
  note?: string
}

export interface ShiftAttendanceRecord {
  id: string
  shiftId: string
  professionalId: string
  professionalUserId: string
  professionalName: string
  sectorId: string
  sectorName: string
  shiftDate: string
  startTime: string
  endTime: string
  patientLoad?: 'Baixa' | 'Moderada' | 'Alta'
  scheduledStartAt: string
  scheduledEndAt: string
  status: AttendanceStatus
  onTime: boolean
  lateMinutes: number
  earlyCheckoutMinutes: number
  overtimeMinutes: number
  workedMinutes: number
  checkIn?: AttendanceGeoSnapshot
  checkOut?: AttendanceGeoSnapshot
  stressSelfReport?: StressSelfReport
  stressAnalytics?: StressAnalytics
  institutionEvaluation?: InstitutionShiftEvaluation
  createdAt: string
  updatedAt: string
}

export interface CheckInShiftInput {
  shiftId: string
  professionalId: string
  professionalUserId: string
  professionalName: string
  sectorId: string
  sectorName: string
  shiftDate: string
  startTime: string
  endTime: string
  patientLoad?: 'Baixa' | 'Moderada' | 'Alta'
  geo: {
    lat: number
    lng: number
    accuracyMeters?: number
    source?: GeoCaptureSource
    capturedAt?: string
  }
}

export interface CheckOutShiftInput {
  shiftId: string
  professionalUserId: string
  geo: {
    lat: number
    lng: number
    accuracyMeters?: number
    source?: GeoCaptureSource
    capturedAt?: string
  }
  stress: StressSelfReport
  institutionEvaluation?: InstitutionShiftEvaluation
}

export interface ShiftCancellationEvent {
  id: string
  shiftId: string
  professionalId: string
  professionalUserId: string
  professionalName: string
  sectorId: string
  sectorName: string
  shiftDate: string
  startTime: string
  endTime: string
  scheduledStartAt: string
  cancelledAt: string
  reason?: string
}

export interface AttendanceManagerAnalytics {
  totals: {
    plannedRecords: number
    plannedCommitments: number
    checkedInRecords: number
    checkedOutRecords: number
    institutionCompletedShifts: number
    attendanceRate: number
    checkInRate: number
    checkoutRate: number
    onTimeRate: number
    abandonmentCount: number
    abandonmentRate: number
    lastMinuteCancellationCount: number
    lastMinuteCancellationRate: number
    avgLateMinutes: number
    avgOvertimeMinutes: number
    avgCheckInDistanceMeters: number
    avgStressScore: number
    avgStressLevel: number
    highRiskRate: number
  }
  lateRanking: Array<{
    professionalId: string
    professionalName: string
    specialty?: string
    records: number
    lateCount: number
    lateRate: number
    avgLateMinutes: number
    maxLateMinutes: number
    avgCheckInDistanceMeters: number
  }>
  stressRanking: Array<{
    professionalId: string
    professionalName: string
    specialty?: string
    checkouts: number
    avgStressLevel: number
    avgStressScore: number
    highRiskCount: number
    criticalCount: number
    recurringTriggers: string[]
  }>
  riskDistribution: Array<{ name: string; value: number; color: string }>
  stressTimeline: Array<{
    label: string
    avgStressScore: number
    avgStressLevel: number
    avgLateMinutes: number
    checkouts: number
  }>
  topTriggers: Array<{ code: StressTriggerCode; label: string; count: number }>
  highRiskCheckouts: Array<{
    id: string
    professionalName: string
    sectorName: string
    shiftDate: string
    score: number
    level: number
    riskLevel: StressRiskLevel
    lateMinutes: number
    triggers: string[]
  }>
  institutionEvaluation: {
    totalEvaluations: number
    completionRate: number
    averages: {
      organization: number
      patientVolume: number
      safety: number
      structure: number
      paymentOnTime: number
      teamEnvironment: number
      overall: number
    }
    dimensionSeries: Array<{
      key:
        | 'organization'
        | 'patientVolume'
        | 'safety'
        | 'structure'
        | 'paymentOnTime'
        | 'teamEnvironment'
      label: string
      avg: number
    }>
    recentNotes: Array<{
      id: string
      professionalName: string
      sectorName: string
      shiftDate: string
      note: string
      overall: number
    }>
  }
  predictiveFailureRisk: {
    totalUpcomingShifts: number
    avgRiskPercent: number
    highRiskCount: number
    byProfessional: Array<{
      professionalId: string
      professionalName: string
      specialty?: string
      upcomingShifts: number
      avgRiskPercent: number
      maxRiskPercent: number
    }>
    topUpcomingShifts: Array<{
      id: string
      shiftId: string
      professionalId: string
      professionalName: string
      specialty?: string
      sectorName: string
      shiftDate: string
      startTime: string
      endTime: string
      riskPercent: number
      riskBand: 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRITICO'
      factors: string[]
    }>
  }
}

interface ShiftAttendanceState {
  geofences: Record<string, ShiftGeofence>
  records: ShiftAttendanceRecord[]
  cancellationEvents: ShiftCancellationEvent[]
  autoCheckInConsent: boolean
  autoCheckInWindowStartMinutesBefore: number
  autoCheckInWindowEndMinutesAfter: number
  initDemoData: () => void
  checkInShift: (input: CheckInShiftInput) => ShiftAttendanceRecord
  checkOutShift: (input: CheckOutShiftInput) => ShiftAttendanceRecord
  setAutoCheckInConsent: (value: boolean) => void
  upsertGeofence: (input: {
    sectorId: string
    sectorName: string
    lat: number
    lng: number
    radiusMeters?: number
    label?: string
    autoCheckInEnabled?: boolean
    configuredByManager?: boolean
  }) => ShiftGeofence
  getShiftAttendance: (shiftId: string, professionalUserId?: string) => ShiftAttendanceRecord | null
  resetAttendanceData: () => void
  resetAttendanceDemoData: () => void
}

type DemoProfessionalLike = {
  id: string
  userId: string
  name: string
  specialty?: string
}

const DEMO_REFERENCE_TODAY = '2026-02-22'

export const STRESS_TRIGGER_LABELS: Record<StressTriggerCode, string> = {
  LOTACAO: 'Lotação acima do esperado',
  EQUIPE_REDUZIDA: 'Equipe reduzida',
  CASOS_GRAVES: 'Casos graves/críticos',
  ATRASO_PASSAGEM: 'Atraso na passagem de plantão',
  FALHA_SISTEMA: 'Falha/lentidão no sistema',
  CONFLITO_EQUIPE: 'Conflito de equipe',
  FALTA_PAUSA: 'Sem pausa adequada',
  SONO: 'Sono/cansaço',
  DOR_FISICA: 'Dor física',
  OUTRO: 'Outro',
}

export const STRESS_LEVEL_META: Record<
  StressSelfReport['level'],
  { label: string; colorClassName: string; scoreBase: number }
> = {
  1: {
    label: 'Muito tranquilo',
    colorClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    scoreBase: 12,
  },
  2: {
    label: 'Leve',
    colorClassName: 'border-lime-200 bg-lime-50 text-lime-700',
    scoreBase: 28,
  },
  3: {
    label: 'Moderado',
    colorClassName: 'border-amber-200 bg-amber-50 text-amber-700',
    scoreBase: 46,
  },
  4: {
    label: 'Alto',
    colorClassName: 'border-orange-200 bg-orange-50 text-orange-700',
    scoreBase: 64,
  },
  5: {
    label: 'Crítico',
    colorClassName: 'border-red-200 bg-red-50 text-red-700',
    scoreBase: 82,
  },
}

export const STRESS_RISK_META: Record<
  StressRiskLevel,
  { label: string; color: string; className: string }
> = {
  BAIXO: {
    label: 'Baixo',
    color: '#22c55e',
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  MODERADO: {
    label: 'Moderado',
    color: '#f59e0b',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  ALTO: {
    label: 'Alto',
    color: '#f97316',
    className: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  CRITICO: {
    label: 'Crítico',
    color: '#ef4444',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
}

const INSTITUTION_EVALUATION_DIMENSION_LABELS = {
  organization: 'Organização',
  patientVolume: 'Volume de pacientes',
  safety: 'Segurança',
  structure: 'Estrutura',
  paymentOnTime: 'Pagamento em dia',
  teamEnvironment: 'Ambiente de equipe',
} as const

type InstitutionEvaluationDimensionKey = keyof InstitutionShiftEvaluation & keyof typeof INSTITUTION_EVALUATION_DIMENSION_LABELS

const DEFAULT_GEOFENCE_RADIUS_METERS = 180

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function roundInt(value: number) {
  return Math.round(value)
}

function toIsoDate(value: string) {
  return value.slice(0, 10)
}

function parseShiftWindow(shiftDate: string, startTime: string, endTime: string) {
  const dateKey = toIsoDate(shiftDate)
  const start = new Date(`${dateKey}T${startTime}:00`)
  const end = new Date(`${dateKey}T${endTime}:00`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Horário do plantão inválido.')
  }

  if (end <= start) {
    end.setDate(end.getDate() + 1)
  }

  return { start, end }
}

function minutesBetween(later: Date, earlier: Date) {
  return Math.round((later.getTime() - earlier.getTime()) / 60000)
}

function normalizeSectorName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function stableNoise(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

function resolveSectorIdByName(sectorName: string) {
  const normalized = normalizeSectorName(sectorName)
  const match = DEMO_DOCTOR_SECTORS.find((sector) => normalizeSectorName(sector.name) === normalized)
  return match?.id
}

function buildDefaultGeofences() {
  const now = new Date().toISOString()
  const geofences: Record<string, ShiftGeofence> = {
    'sec-uti-adulto': {
      sectorId: 'sec-uti-adulto',
      sectorName: 'UTI Adulto',
      lat: -23.561414,
      lng: -46.655881,
      radiusMeters: 170,
      label: 'UTI Adulto · Bloco A',
      autoCheckInEnabled: true,
      configuredByManager: true,
      configuredAt: now,
    },
    'sec-ps': {
      sectorId: 'sec-ps',
      sectorName: 'Pronto-Socorro',
      lat: -23.562004,
      lng: -46.656491,
      radiusMeters: 220,
      label: 'Pronto-Socorro · Entrada principal',
      autoCheckInEnabled: true,
      configuredByManager: true,
      configuredAt: now,
    },
    'sec-clinica': {
      sectorId: 'sec-clinica',
      sectorName: 'Clínica Médica',
      lat: -23.561895,
      lng: -46.654934,
      radiusMeters: 180,
      label: 'Clínica Médica · Bloco C',
      autoCheckInEnabled: true,
      configuredByManager: true,
      configuredAt: now,
    },
    'sec-neonatal': {
      sectorId: 'sec-neonatal',
      sectorName: 'UTI Neonatal',
      lat: -23.560987,
      lng: -46.655422,
      radiusMeters: 160,
      label: 'UTI Neonatal · 5º andar',
      autoCheckInEnabled: true,
      configuredByManager: true,
      configuredAt: now,
    },
  }

  return geofences
}

function buildFallbackGeofence(sectorId: string, sectorName: string): ShiftGeofence {
  const campusLat = -23.5616
  const campusLng = -46.6556
  const hash = sectorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const jitterLat = ((hash % 9) - 4) * 0.00012
  const jitterLng = ((Math.floor(hash / 3) % 9) - 4) * 0.00012

  return {
    sectorId,
    sectorName,
    lat: campusLat + jitterLat,
    lng: campusLng + jitterLng,
    radiusMeters: DEFAULT_GEOFENCE_RADIUS_METERS,
    label: `${sectorName} · Geofence padrão`,
    autoCheckInEnabled: false,
    configuredByManager: false,
  }
}

function ensureGeofence(
  geofences: Record<string, ShiftGeofence>,
  sectorId: string,
  sectorName: string,
): ShiftGeofence {
  return geofences[sectorId] ?? buildFallbackGeofence(sectorId, sectorName)
}

function buildGeoSnapshot(
  geofence: ShiftGeofence,
  input: { lat: number; lng: number; accuracyMeters?: number; source?: GeoCaptureSource; capturedAt?: string },
) {
  const accuracyMeters = clamp(input.accuracyMeters ?? 30, 1, 5000)
  const capturedAt = input.capturedAt ?? new Date().toISOString()
  const distanceMeters = haversineDistanceMeters(geofence.lat, geofence.lng, input.lat, input.lng)
  const tolerance = geofence.radiusMeters + Math.min(accuracyMeters, 120)
  const withinGeofence = distanceMeters <= tolerance

  return {
    lat: input.lat,
    lng: input.lng,
    accuracyMeters,
    capturedAt,
    distanceMeters: roundInt(distanceMeters),
    withinGeofence,
    source: input.source ?? 'browser',
  } satisfies AttendanceGeoSnapshot
}

function isNightShiftWindow(start: Date, end: Date) {
  if (end.getDate() !== start.getDate() || end.getMonth() !== start.getMonth()) return true
  const startHour = start.getHours()
  const endHour = end.getHours()
  return startHour >= 18 || startHour < 6 || endHour <= 8
}

function triggerWeight(trigger: StressTriggerCode) {
  switch (trigger) {
    case 'CASOS_GRAVES':
      return 7
    case 'EQUIPE_REDUZIDA':
      return 6
    case 'LOTACAO':
      return 6
    case 'FALTA_PAUSA':
      return 5
    case 'SONO':
      return 5
    case 'CONFLITO_EQUIPE':
      return 4
    case 'ATRASO_PASSAGEM':
      return 4
    case 'DOR_FISICA':
      return 4
    case 'FALHA_SISTEMA':
      return 3
    case 'OUTRO':
      return 2
    default:
      return 2
  }
}

function patientLoadScore(load?: ShiftAttendanceRecord['patientLoad']) {
  if (load === 'Alta') return 12
  if (load === 'Moderada') return 6
  if (load === 'Baixa') return 2
  return 0
}

function detectStressRisk(score: number): StressRiskLevel {
  if (score >= 75) return 'CRITICO'
  if (score >= 58) return 'ALTO'
  if (score >= 36) return 'MODERADO'
  return 'BAIXO'
}

function computePreviousRestHours(
  records: ShiftAttendanceRecord[],
  professionalUserId: string,
  checkInAt: Date,
  currentRecordId?: string,
) {
  const previousCheckout = records
    .filter(
      (record) =>
        record.professionalUserId === professionalUserId &&
        record.id !== currentRecordId &&
        Boolean(record.checkOut?.capturedAt),
    )
    .map((record) => record.checkOut?.capturedAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => value.getTime() < checkInAt.getTime())
    .sort((a, b) => b.getTime() - a.getTime())[0]

  if (!previousCheckout) return null
  return (checkInAt.getTime() - previousCheckout.getTime()) / (1000 * 60 * 60)
}

function computeStressAnalytics(
  record: ShiftAttendanceRecord,
  stress: StressSelfReport,
  allRecords: ShiftAttendanceRecord[],
) {
  const checkInAt = record.checkIn ? new Date(record.checkIn.capturedAt) : new Date(record.scheduledStartAt)
  const scheduledStart = new Date(record.scheduledStartAt)
  const scheduledEnd = new Date(record.scheduledEndAt)

  const restHours = computePreviousRestHours(allRecords, record.professionalUserId, checkInAt, record.id)
  const shortRestPenalty =
    restHours === null
      ? 0
      : restHours < 8
        ? 12
        : restHours < 12
          ? 7
          : restHours < 16
            ? 3
            : 0

  const triggerScore = clamp(
    stress.triggers.reduce((sum, trigger) => sum + triggerWeight(trigger), 0),
    0,
    18,
  )

  const breakdown: StressScoreBreakdown = {
    selfReport: STRESS_LEVEL_META[stress.level].scoreBase,
    lateness: clamp(Math.round(record.lateMinutes * 0.22), 0, 20),
    overtime: clamp(Math.round(record.overtimeMinutes * 0.08), 0, 18),
    workload: patientLoadScore(record.patientLoad),
    nightShift: isNightShiftWindow(scheduledStart, scheduledEnd) ? 7 : 0,
    triggers: triggerScore,
    lowEnergy: clamp((5 - stress.energyLevel) * 4, 0, 16),
    lowSupport: clamp((5 - stress.supportLevel) * 3, 0, 12),
    shortRest: shortRestPenalty,
  }

  const score = clamp(
    Object.values(breakdown).reduce((sum, value) => sum + value, 0),
    0,
    100,
  )

  const riskLevel = detectStressRisk(score)
  const flags: string[] = []

  if (record.lateMinutes >= 15) flags.push('atraso_relevante')
  if (record.overtimeMinutes >= 60) flags.push('hora_extra_alta')
  if (stress.level >= 4) flags.push('autopercepcao_alta')
  if (stress.supportLevel <= 2) flags.push('baixo_suporte')
  if (stress.energyLevel <= 2) flags.push('baixa_energia')
  if (stress.triggers.includes('CASOS_GRAVES')) flags.push('exposicao_casos_graves')
  if (restHours !== null && restHours < 12) flags.push('janela_descanso_curta')
  if (riskLevel === 'CRITICO') flags.push('risco_critico')

  const dominantDrivers = (Object.entries(breakdown) as Array<[keyof StressScoreBreakdown, number]>)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key, value]) => ({ key, value }))

  const recoveryMinutesRecommended = clamp(
    Math.round(45 + score * 2.1 + record.overtimeMinutes * 0.25),
    45,
    720,
  )

  return {
    score: roundInt(score),
    riskLevel,
    breakdown,
    flags,
    recoveryMinutesRecommended: roundInt(recoveryMinutesRecommended),
    dominantDrivers,
  } satisfies StressAnalytics
}

function baseRecordFromShift(input: {
  shiftId: string
  professionalId: string
  professionalUserId: string
  professionalName: string
  sectorId: string
  sectorName: string
  shiftDate: string
  startTime: string
  endTime: string
  patientLoad?: ShiftAttendanceRecord['patientLoad']
}) {
  const { start, end } = parseShiftWindow(input.shiftDate, input.startTime, input.endTime)
  const now = new Date().toISOString()

  return {
    id: `att-${input.shiftId}-${input.professionalUserId}`,
    shiftId: input.shiftId,
    professionalId: input.professionalId,
    professionalUserId: input.professionalUserId,
    professionalName: input.professionalName,
    sectorId: input.sectorId,
    sectorName: input.sectorName,
    shiftDate: toIsoDate(input.shiftDate),
    startTime: input.startTime,
    endTime: input.endTime,
    patientLoad: input.patientLoad,
    scheduledStartAt: start.toISOString(),
    scheduledEndAt: end.toISOString(),
    status: 'PENDENTE' as const,
    onTime: false,
    lateMinutes: 0,
    earlyCheckoutMinutes: 0,
    overtimeMinutes: 0,
    workedMinutes: 0,
    createdAt: now,
    updatedAt: now,
  } satisfies ShiftAttendanceRecord
}

function sortAttendanceRecords(records: ShiftAttendanceRecord[]) {
  return [...records].sort((a, b) => {
    const keyA = `${a.shiftDate} ${a.startTime} ${a.professionalName}`
    const keyB = `${b.shiftDate} ${b.startTime} ${b.professionalName}`
    return keyB.localeCompare(keyA, 'pt-BR')
  })
}

function buildInitialRecords() {
  const geofences = buildDefaultGeofences()
  const professionalsById = new Map(
    DEMO_PROFESSIONALS.map((professional) => [professional.id, professional] as const),
  )

  const records: ShiftAttendanceRecord[] = []

  const buildSyntheticPosition = (geofence: ShiftGeofence, distanceMeters: number, seed: number) => {
    const angle = stableNoise(seed + 17) * Math.PI * 2
    const metersPerLat = 111320
    const metersPerLng = 111320 * Math.cos((geofence.lat * Math.PI) / 180)
    const lat = geofence.lat + (Math.cos(angle) * distanceMeters) / metersPerLat
    const lng = geofence.lng + (Math.sin(angle) * distanceMeters) / metersPerLng

    return { lat, lng }
  }

  DEMO_MANAGER_ASSIGNED_SHIFTS.forEach((assignment, index) => {
    if (assignment.date > DEMO_REFERENCE_TODAY) return

    const professional = professionalsById.get(assignment.professionalId)
    const sectorId = resolveSectorIdByName(assignment.sectorName) ?? `sector-${index}`
    const geofence = ensureGeofence(geofences, sectorId, assignment.sectorName)

    const base = baseRecordFromShift({
      shiftId: assignment.id,
      professionalId: assignment.professionalId,
      professionalUserId: professional?.userId ?? `user-${assignment.professionalId}`,
      professionalName: professional?.name ?? assignment.professionalName,
      sectorId,
      sectorName: assignment.sectorName,
      shiftDate: assignment.date,
      startTime: assignment.startTime,
      endTime: assignment.endTime,
      patientLoad:
        index % 4 === 0 ? 'Alta' : index % 3 === 0 ? 'Baixa' : 'Moderada',
    })

    const scheduledStart = new Date(base.scheduledStartAt)
    const scheduledEnd = new Date(base.scheduledEndAt)
    const lateMinutes = Math.max(0, Math.round((stableNoise(index + 3) - 0.35) * 34))
    const earlyArrivalMinutes = Math.round(stableNoise(index + 5) * 8)
    const checkInAt = new Date(
      scheduledStart.getTime() - earlyArrivalMinutes * 60000 + lateMinutes * 60000,
    )
    const overtimeMinutes = Math.max(0, Math.round((stableNoise(index + 7) - 0.55) * 140))
    const earlyCheckoutMinutes = overtimeMinutes > 0 ? 0 : Math.max(0, Math.round((stableNoise(index + 11) - 0.8) * 40))
    const checkOutAt = new Date(
      scheduledEnd.getTime() + overtimeMinutes * 60000 - earlyCheckoutMinutes * 60000,
    )

    const checkInDistance = clamp(Math.round(40 + stableNoise(index + 13) * 120), 15, 220)
    const checkOutDistance = clamp(Math.round(35 + stableNoise(index + 17) * 110), 10, 220)
    const checkInPos = buildSyntheticPosition(geofence, checkInDistance, index + 19)
    const checkOutPos = buildSyntheticPosition(geofence, checkOutDistance, index + 29)

    const checkInSnapshot = buildGeoSnapshot(geofence, {
      ...checkInPos,
      accuracyMeters: clamp(Math.round(12 + stableNoise(index + 23) * 35), 8, 60),
      source: 'demo-simulado',
      capturedAt: checkInAt.toISOString(),
    })

    const shouldKeepOpen = assignment.date === DEMO_REFERENCE_TODAY && index % 5 === 0

    let record: ShiftAttendanceRecord = {
      ...base,
      status: 'CHECKED_IN',
      checkIn: checkInSnapshot,
      lateMinutes,
      onTime: lateMinutes <= 5,
      updatedAt: checkInAt.toISOString(),
    }

    if (!shouldKeepOpen) {
      const checkOutSnapshot = buildGeoSnapshot(geofence, {
        ...checkOutPos,
        accuracyMeters: clamp(Math.round(10 + stableNoise(index + 31) * 30), 8, 55),
        source: 'demo-simulado',
        capturedAt: checkOutAt.toISOString(),
      })

      const stressLevel = (Math.min(5, Math.max(1, Math.round(2 + stableNoise(index + 37) * 3)))) as 1 | 2 | 3 | 4 | 5
      const energyLevel = (Math.min(5, Math.max(1, Math.round(4 - stableNoise(index + 41) * 3)))) as 1 | 2 | 3 | 4 | 5
      const supportLevel = (Math.min(5, Math.max(1, Math.round(3 + stableNoise(index + 43) * 2)))) as 1 | 2 | 3 | 4 | 5

      const triggerPool: StressTriggerCode[] = [
        'LOTACAO',
        'EQUIPE_REDUZIDA',
        'CASOS_GRAVES',
        'ATRASO_PASSAGEM',
        'FALHA_SISTEMA',
        'FALTA_PAUSA',
        'SONO',
      ]
      const triggers = triggerPool.filter((_, triggerIndex) => stableNoise(index * 3 + triggerIndex) > 0.58)
      if (triggers.length === 0) triggers.push(index % 2 === 0 ? 'LOTACAO' : 'FALTA_PAUSA')

      const workedMinutes = Math.max(0, minutesBetween(checkOutAt, checkInAt))
      record = {
        ...record,
        status: 'CHECKED_OUT',
        checkOut: checkOutSnapshot,
        overtimeMinutes,
        earlyCheckoutMinutes,
        workedMinutes,
        updatedAt: checkOutAt.toISOString(),
        stressSelfReport: {
          level: stressLevel,
          energyLevel,
          supportLevel,
          triggers: triggers.slice(0, 4),
          note:
            stressLevel >= 4
              ? 'Turno com alta carga assistencial e pausas limitadas.'
              : undefined,
        },
        institutionEvaluation:
          stableNoise(index + 47) > 0.35
            ? {
                organization: (Math.min(5, Math.max(1, Math.round(3 + stableNoise(index + 49) * 2)))) as 1 | 2 | 3 | 4 | 5,
                patientVolume: (Math.min(5, Math.max(1, Math.round(2 + stableNoise(index + 51) * 3)))) as 1 | 2 | 3 | 4 | 5,
                safety: (Math.min(5, Math.max(1, Math.round(3 + stableNoise(index + 53) * 2)))) as 1 | 2 | 3 | 4 | 5,
                structure: (Math.min(5, Math.max(1, Math.round(3 + stableNoise(index + 55) * 2)))) as 1 | 2 | 3 | 4 | 5,
                paymentOnTime: (Math.min(5, Math.max(1, Math.round(4 + stableNoise(index + 57) * 1)))) as 1 | 2 | 3 | 4 | 5,
                teamEnvironment: (Math.min(5, Math.max(1, Math.round(3 + stableNoise(index + 59) * 2)))) as 1 | 2 | 3 | 4 | 5,
                note:
                  stableNoise(index + 63) > 0.7
                    ? 'Fluxo bem organizado, mas houve sobrecarga em momentos críticos.'
                    : undefined,
              }
            : undefined,
      }

      record.stressAnalytics = computeStressAnalytics(record, record.stressSelfReport, records)
    }

    records.push(record)
  })

  DEMO_DOCTOR_MY_SHIFTS.forEach((shift, index) => {
    if (shift.status !== 'CONCLUIDO') return
    if (records.some((record) => record.shiftId === shift.id && record.professionalUserId === shift.professionalUserId)) {
      return
    }

    const professional = professionalsById.get(shift.professionalId)
    const geofence = ensureGeofence(
      geofences,
      shift.sectorId,
      shift.sectorName,
    )
    const base = baseRecordFromShift({
      shiftId: shift.id,
      professionalId: shift.professionalId,
      professionalUserId: shift.professionalUserId,
      professionalName: professional?.name ?? 'Médico demo',
      sectorId: shift.sectorId,
      sectorName: shift.sectorName,
      shiftDate: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      patientLoad: shift.patientLoad,
    })

    const scheduledStart = new Date(base.scheduledStartAt)
    const scheduledEnd = new Date(base.scheduledEndAt)
    const checkInAt = new Date(scheduledStart.getTime() + (index + 1) * 4 * 60000)
    const checkOutAt = new Date(scheduledEnd.getTime() + index * 18 * 60000)

    const checkInSnapshot = buildGeoSnapshot(geofence, {
      lat: geofence.lat + 0.00018,
      lng: geofence.lng - 0.00005,
      accuracyMeters: 14,
      source: 'demo-simulado',
      capturedAt: checkInAt.toISOString(),
    })

    const checkOutSnapshot = buildGeoSnapshot(geofence, {
      lat: geofence.lat - 0.0001,
      lng: geofence.lng + 0.00006,
      accuracyMeters: 12,
      source: 'demo-simulado',
      capturedAt: checkOutAt.toISOString(),
    })

    const stressSelfReport: StressSelfReport = {
      level: shift.patientLoad === 'Alta' ? 4 : shift.patientLoad === 'Moderada' ? 3 : 2,
      energyLevel: shift.patientLoad === 'Alta' ? 2 : 3,
      supportLevel: 3,
      triggers:
        shift.patientLoad === 'Alta'
          ? ['LOTACAO', 'CASOS_GRAVES', 'FALTA_PAUSA']
          : ['ATRASO_PASSAGEM'],
      note: shift.notes,
    }

    let record: ShiftAttendanceRecord = {
      ...base,
      status: 'CHECKED_IN',
      checkIn: checkInSnapshot,
      onTime: minutesBetween(checkInAt, scheduledStart) <= 5,
      lateMinutes: Math.max(0, minutesBetween(checkInAt, scheduledStart)),
      updatedAt: checkInAt.toISOString(),
    }

    record = {
      ...record,
      status: 'CHECKED_OUT',
      checkOut: checkOutSnapshot,
      earlyCheckoutMinutes: 0,
      overtimeMinutes: Math.max(0, minutesBetween(checkOutAt, scheduledEnd)),
      workedMinutes: Math.max(0, minutesBetween(checkOutAt, checkInAt)),
      stressSelfReport,
      institutionEvaluation: {
        organization: 4,
        patientVolume: shift.patientLoad === 'Alta' ? 2 : 3,
        safety: 4,
        structure: 4,
        paymentOnTime: 5,
        teamEnvironment: 4,
        note: shift.patientLoad === 'Alta' ? 'Volume alto no turno, porém equipe colaborativa.' : undefined,
      },
      updatedAt: checkOutAt.toISOString(),
    }
    record.stressAnalytics = computeStressAnalytics(record, stressSelfReport, records)
    records.push(record)
  })

  return sortAttendanceRecords(records)
}

function buildInitialCancellationEvents() {
  const professionalsById = new Map(
    DEMO_PROFESSIONALS.map((professional) => [professional.id, professional] as const),
  )

  const cancellationCandidates = DEMO_MANAGER_ASSIGNED_SHIFTS.filter((assignment, index) => {
    const seed = stableNoise(index + 61)
    return assignment.date <= DEMO_REFERENCE_TODAY && seed > 0.62
  }).slice(0, 8)

  return cancellationCandidates.map((assignment, index) => {
    const professional = professionalsById.get(assignment.professionalId)
    const sectorId = resolveSectorIdByName(assignment.sectorName) ?? `cancel-sector-${index}`
    const { start } = parseShiftWindow(assignment.date, assignment.startTime, assignment.endTime)

    const isLastMinute = index % 3 !== 0
    const hoursBeforeStart = isLastMinute
      ? clamp(Math.round(0.5 + stableNoise(index + 73) * 5), 1, 6)
      : clamp(Math.round(8 + stableNoise(index + 79) * 20), 8, 24)

    const cancelledAt = new Date(start.getTime() - hoursBeforeStart * 60 * 60000)

    return {
      id: `cancel-${assignment.id}`,
      shiftId: assignment.id,
      professionalId: assignment.professionalId,
      professionalUserId: professional?.userId ?? `user-${assignment.professionalId}`,
      professionalName: professional?.name ?? assignment.professionalName,
      sectorId,
      sectorName: assignment.sectorName,
      shiftDate: assignment.date,
      startTime: assignment.startTime,
      endTime: assignment.endTime,
      scheduledStartAt: start.toISOString(),
      cancelledAt: cancelledAt.toISOString(),
      reason: isLastMinute
        ? 'Imprevisto pessoal informado próximo ao início do plantão.'
        : 'Cancelamento antecipado com remanejamento da escala.',
    } satisfies ShiftCancellationEvent
  })
}

const ABANDONMENT_EARLY_CHECKOUT_THRESHOLD_MINUTES = 30
const OPEN_SHIFT_ABANDONMENT_GRACE_MINUTES = 30
const LAST_MINUTE_CANCELLATION_THRESHOLD_HOURS = 6

function isLastMinuteCancellation(event: ShiftCancellationEvent) {
  const scheduledStart = new Date(event.scheduledStartAt)
  const cancelledAt = new Date(event.cancelledAt)
  if (Number.isNaN(scheduledStart.getTime()) || Number.isNaN(cancelledAt.getTime())) return false
  const diffHours = (scheduledStart.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60)
  return diffHours >= 0 && diffHours <= LAST_MINUTE_CANCELLATION_THRESHOLD_HOURS
}

function isShiftAbandonment(record: ShiftAttendanceRecord, now = new Date()) {
  const scheduledEnd = new Date(record.scheduledEndAt)
  if (Number.isNaN(scheduledEnd.getTime())) return false

  if (record.checkOut) {
    return record.earlyCheckoutMinutes >= ABANDONMENT_EARLY_CHECKOUT_THRESHOLD_MINUTES
  }

  if (!record.checkIn) return false

  const cutoff = new Date(scheduledEnd.getTime() + OPEN_SHIFT_ABANDONMENT_GRACE_MINUTES * 60000)
  return now.getTime() >= cutoff.getTime()
}

function isInstitutionCompletedShift(record: ShiftAttendanceRecord) {
  return Boolean(record.checkOut) && !isShiftAbandonment(record)
}

function buildDemoAttendanceState() {
  return {
    geofences: buildDefaultGeofences(),
    records: buildInitialRecords(),
    cancellationEvents: buildInitialCancellationEvents(),
    autoCheckInConsent: false,
    autoCheckInWindowStartMinutesBefore: 30,
    autoCheckInWindowEndMinutesAfter: 90,
  }
}

function buildEmptyAttendanceState() {
  return {
    geofences: {} as Record<string, ShiftGeofence>,
    records: [] as ShiftAttendanceRecord[],
    cancellationEvents: [] as ShiftCancellationEvent[],
    autoCheckInConsent: false,
    autoCheckInWindowStartMinutesBefore: 30,
    autoCheckInWindowEndMinutesAfter: 90,
  }
}

function requireRecordGeofence(
  state: ShiftAttendanceState,
  recordLike: { sectorId: string; sectorName: string },
) {
  return ensureGeofence(state.geofences, recordLike.sectorId, recordLike.sectorName)
}

function upsertRecord(records: ShiftAttendanceRecord[], updated: ShiftAttendanceRecord) {
  const next = records.some((record) => record.id === updated.id)
    ? records.map((record) => (record.id === updated.id ? updated : record))
    : [...records, updated]

  return sortAttendanceRecords(next)
}

function validateStressReport(stress: StressSelfReport) {
  if (!stress || typeof stress !== 'object') {
    throw new Error('Informe o nível de estresse para finalizar o checkout.')
  }

  if (![1, 2, 3, 4, 5].includes(stress.level)) {
    throw new Error('Nível de estresse inválido.')
  }

  if (![1, 2, 3, 4, 5].includes(stress.energyLevel)) {
    throw new Error('Nível de energia inválido.')
  }

  if (![1, 2, 3, 4, 5].includes(stress.supportLevel)) {
    throw new Error('Nível de suporte inválido.')
  }

  if (!Array.isArray(stress.triggers)) {
    throw new Error('Gatilhos de estresse inválidos.')
  }
}

function normalizeInstitutionEvaluation(
  input?: InstitutionShiftEvaluation,
): InstitutionShiftEvaluation | undefined {
  if (!input) return undefined

  const keys: Array<keyof InstitutionShiftEvaluation> = [
    'organization',
    'patientVolume',
    'safety',
    'structure',
    'paymentOnTime',
    'teamEnvironment',
  ]

  const normalized = {} as InstitutionShiftEvaluation
  for (const key of keys) {
    const value = input[key]
    if (![1, 2, 3, 4, 5].includes(value as number)) {
      throw new Error('Avaliação da instituição inválida.')
    }
    ;(normalized as any)[key] = value
  }

  normalized.note = input.note?.trim() || undefined
  return normalized
}

type PredictiveAssignmentInput = {
  id: string
  professionalId: string
  professionalName: string
  specialty?: string
  sectorName: string
  date: string
  startTime: string
  endTime: string
}

type AttendanceAnalyticsOptions = {
  cancellationEvents?: ShiftCancellationEvent[]
  upcomingAssignments?: PredictiveAssignmentInput[]
  referenceDate?: Date | string
}

function getEvaluationOverallScore(evaluation: InstitutionShiftEvaluation) {
  const keys = Object.keys(INSTITUTION_EVALUATION_DIMENSION_LABELS) as InstitutionEvaluationDimensionKey[]
  const sum = keys.reduce((acc, key) => acc + Number(evaluation[key] ?? 0), 0)
  return round1(sum / keys.length)
}

function averageNumbers(values: number[]) {
  if (values.length === 0) return 0
  return round1(values.reduce((acc, value) => acc + value, 0) / values.length)
}

function deterministicCommuteEstimateKm(professionalId: string) {
  const seed = professionalId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return round1(4 + stableNoise(seed) * 28)
}

function classifyPredictiveRiskBand(riskPercent: number): 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRITICO' {
  if (riskPercent >= 35) return 'CRITICO'
  if (riskPercent >= 22) return 'ALTO'
  if (riskPercent >= 12) return 'MODERADO'
  return 'BAIXO'
}

function isNightShiftByClock(startTime: string, endTime: string) {
  return startTime >= '18:00' || startTime < '06:00' || endTime <= '08:00'
}

export function buildAttendanceManagerAnalytics(
  records: ShiftAttendanceRecord[],
  professionals: Array<{ id: string; name: string; specialty?: string }> = [],
  options: AttendanceAnalyticsOptions = {},
): AttendanceManagerAnalytics {
  const professionalsById = new Map(professionals.map((professional) => [professional.id, professional]))
  const referenceDate =
    options.referenceDate instanceof Date
      ? options.referenceDate
      : options.referenceDate
        ? new Date(options.referenceDate)
        : new Date()
  const cancellationEvents = options.cancellationEvents ?? []
  const upcomingAssignments = options.upcomingAssignments ?? []

  const checkedIn = records.filter((record) => Boolean(record.checkIn))
  const checkedOut = records.filter((record) => Boolean(record.checkOut))
  const onTime = checkedIn.filter((record) => record.onTime)
  const abandonmentRecords = checkedIn.filter((record) => isShiftAbandonment(record, referenceDate))
  const institutionCompleted = checkedOut.filter((record) => isInstitutionCompletedShift(record))
  const lastMinuteCancellations = cancellationEvents.filter(isLastMinuteCancellation)

  const plannedCommitments = records.length + cancellationEvents.length
  const attendanceRate =
    plannedCommitments > 0 ? round1((checkedIn.length / plannedCommitments) * 100) : 0
  const abandonmentRate =
    checkedIn.length > 0 ? round1((abandonmentRecords.length / checkedIn.length) * 100) : 0
  const lastMinuteCancellationRate =
    plannedCommitments > 0
      ? round1((lastMinuteCancellations.length / plannedCommitments) * 100)
      : 0

  const avgLateMinutes =
    checkedIn.length > 0
      ? round1(checkedIn.reduce((sum, record) => sum + record.lateMinutes, 0) / checkedIn.length)
      : 0

  const avgOvertimeMinutes =
    checkedOut.length > 0
      ? round1(
          checkedOut.reduce((sum, record) => sum + record.overtimeMinutes, 0) / checkedOut.length,
        )
      : 0

  const avgCheckInDistanceMeters =
    checkedIn.length > 0
      ? round1(
          checkedIn.reduce((sum, record) => sum + (record.checkIn?.distanceMeters ?? 0), 0) /
            checkedIn.length,
        )
      : 0

  const completedWithStress = checkedOut.filter(
    (record) => record.stressSelfReport && record.stressAnalytics,
  )
  const avgStressScore =
    completedWithStress.length > 0
      ? round1(
          completedWithStress.reduce(
            (sum, record) => sum + (record.stressAnalytics?.score ?? 0),
            0,
          ) / completedWithStress.length,
        )
      : 0

  const avgStressLevel =
    completedWithStress.length > 0
      ? round1(
          completedWithStress.reduce(
            (sum, record) => sum + (record.stressSelfReport?.level ?? 0),
            0,
          ) / completedWithStress.length,
        )
      : 0

  const highRiskRate =
    completedWithStress.length > 0
      ? round1(
          (completedWithStress.filter((record) =>
            ['ALTO', 'CRITICO'].includes(record.stressAnalytics?.riskLevel ?? ''),
          ).length /
            completedWithStress.length) *
            100,
        )
      : 0

  type LateAccumulator = {
    professionalId: string
    professionalName: string
    specialty?: string
    records: number
    lateCount: number
    lateMinutesSum: number
    maxLateMinutes: number
    checkInDistanceSum: number
    checkInDistanceCount: number
  }

  const lateMap = new Map<string, LateAccumulator>()
  checkedIn.forEach((record) => {
    const professional = professionalsById.get(record.professionalId)
    const key = record.professionalId || record.professionalUserId
    const current = lateMap.get(key) ?? {
      professionalId: record.professionalId || key,
      professionalName: professional?.name ?? record.professionalName,
      specialty: professional?.specialty,
      records: 0,
      lateCount: 0,
      lateMinutesSum: 0,
      maxLateMinutes: 0,
      checkInDistanceSum: 0,
      checkInDistanceCount: 0,
    }

    current.records += 1
    current.lateMinutesSum += record.lateMinutes
    if (record.lateMinutes > 0) current.lateCount += 1
    current.maxLateMinutes = Math.max(current.maxLateMinutes, record.lateMinutes)
    if (record.checkIn?.distanceMeters !== undefined) {
      current.checkInDistanceSum += record.checkIn.distanceMeters
      current.checkInDistanceCount += 1
    }
    lateMap.set(key, current)
  })

  const lateRanking = Array.from(lateMap.values())
    .map((row) => ({
      professionalId: row.professionalId,
      professionalName: row.professionalName,
      specialty: row.specialty,
      records: row.records,
      lateCount: row.lateCount,
      lateRate: row.records > 0 ? round1((row.lateCount / row.records) * 100) : 0,
      avgLateMinutes: row.records > 0 ? round1(row.lateMinutesSum / row.records) : 0,
      maxLateMinutes: row.maxLateMinutes,
      avgCheckInDistanceMeters:
        row.checkInDistanceCount > 0
          ? round1(row.checkInDistanceSum / row.checkInDistanceCount)
          : 0,
    }))
    .sort(
      (a, b) =>
        b.avgLateMinutes - a.avgLateMinutes ||
        b.lateRate - a.lateRate ||
        b.maxLateMinutes - a.maxLateMinutes ||
        a.professionalName.localeCompare(b.professionalName, 'pt-BR'),
    )

  const triggerCount = new Map<StressTriggerCode, number>()
  const stressByProfessional = new Map<
    string,
    {
      professionalId: string
      professionalName: string
      specialty?: string
      checkouts: number
      stressLevelSum: number
      stressScoreSum: number
      highRiskCount: number
      criticalCount: number
      triggers: Map<StressTriggerCode, number>
    }
  >()

  completedWithStress.forEach((record) => {
    const report = record.stressSelfReport
    const analytics = record.stressAnalytics
    if (!report || !analytics) return

    report.triggers.forEach((trigger) => {
      triggerCount.set(trigger, (triggerCount.get(trigger) ?? 0) + 1)
    })

    const professional = professionalsById.get(record.professionalId)
    const key = record.professionalId || record.professionalUserId
    const current = stressByProfessional.get(key) ?? {
      professionalId: record.professionalId || key,
      professionalName: professional?.name ?? record.professionalName,
      specialty: professional?.specialty,
      checkouts: 0,
      stressLevelSum: 0,
      stressScoreSum: 0,
      highRiskCount: 0,
      criticalCount: 0,
      triggers: new Map<StressTriggerCode, number>(),
    }

    current.checkouts += 1
    current.stressLevelSum += report.level
    current.stressScoreSum += analytics.score
    if (analytics.riskLevel === 'ALTO' || analytics.riskLevel === 'CRITICO') current.highRiskCount += 1
    if (analytics.riskLevel === 'CRITICO') current.criticalCount += 1
    report.triggers.forEach((trigger) => {
      current.triggers.set(trigger, (current.triggers.get(trigger) ?? 0) + 1)
    })
    stressByProfessional.set(key, current)
  })

  const stressRanking = Array.from(stressByProfessional.values())
    .map((row) => ({
      professionalId: row.professionalId,
      professionalName: row.professionalName,
      specialty: row.specialty,
      checkouts: row.checkouts,
      avgStressLevel: row.checkouts > 0 ? round1(row.stressLevelSum / row.checkouts) : 0,
      avgStressScore: row.checkouts > 0 ? round1(row.stressScoreSum / row.checkouts) : 0,
      highRiskCount: row.highRiskCount,
      criticalCount: row.criticalCount,
      recurringTriggers: Array.from(row.triggers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([trigger]) => STRESS_TRIGGER_LABELS[trigger]),
    }))
    .sort(
      (a, b) =>
        b.avgStressScore - a.avgStressScore ||
        b.highRiskCount - a.highRiskCount ||
        a.professionalName.localeCompare(b.professionalName, 'pt-BR'),
    )

  const riskBuckets: Record<StressRiskLevel, number> = {
    BAIXO: 0,
    MODERADO: 0,
    ALTO: 0,
    CRITICO: 0,
  }
  completedWithStress.forEach((record) => {
    const riskLevel = record.stressAnalytics?.riskLevel
    if (riskLevel) riskBuckets[riskLevel] += 1
  })

  const riskDistribution = (Object.keys(riskBuckets) as StressRiskLevel[]).map((riskLevel) => ({
    name: STRESS_RISK_META[riskLevel].label,
    value: riskBuckets[riskLevel],
    color: STRESS_RISK_META[riskLevel].color,
  }))

  const timelineBucketMap = new Map<
    string,
    {
      label: string
      stressScoreSum: number
      stressLevelSum: number
      lateMinutesSum: number
      checkouts: number
    }
  >()
  completedWithStress.forEach((record) => {
    const key = record.shiftDate
    const bucket = timelineBucketMap.get(key) ?? {
      label: key.split('-').reverse().join('/'),
      stressScoreSum: 0,
      stressLevelSum: 0,
      lateMinutesSum: 0,
      checkouts: 0,
    }
    bucket.checkouts += 1
    bucket.stressScoreSum += record.stressAnalytics?.score ?? 0
    bucket.stressLevelSum += record.stressSelfReport?.level ?? 0
    bucket.lateMinutesSum += record.lateMinutes
    timelineBucketMap.set(key, bucket)
  })

  const stressTimeline = Array.from(timelineBucketMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-10)
    .map(([, bucket]) => ({
      label: bucket.label,
      avgStressScore: round1(bucket.stressScoreSum / Math.max(bucket.checkouts, 1)),
      avgStressLevel: round1(bucket.stressLevelSum / Math.max(bucket.checkouts, 1)),
      avgLateMinutes: round1(bucket.lateMinutesSum / Math.max(bucket.checkouts, 1)),
      checkouts: bucket.checkouts,
    }))

  const topTriggers = Array.from(triggerCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([code, count]) => ({ code, label: STRESS_TRIGGER_LABELS[code], count }))

  const highRiskCheckouts = completedWithStress
    .filter((record) => {
      const risk = record.stressAnalytics?.riskLevel
      return risk === 'ALTO' || risk === 'CRITICO'
    })
    .sort(
      (a, b) =>
        (b.stressAnalytics?.score ?? 0) - (a.stressAnalytics?.score ?? 0) ||
        b.shiftDate.localeCompare(a.shiftDate),
    )
    .slice(0, 8)
    .map((record) => ({
      id: record.id,
      professionalName:
        professionalsById.get(record.professionalId)?.name ?? record.professionalName,
      sectorName: record.sectorName,
      shiftDate: record.shiftDate,
      score: record.stressAnalytics?.score ?? 0,
      level: record.stressSelfReport?.level ?? 0,
      riskLevel: record.stressAnalytics?.riskLevel ?? 'MODERADO',
      lateMinutes: record.lateMinutes,
      triggers: (record.stressSelfReport?.triggers ?? []).map(
        (trigger) => STRESS_TRIGGER_LABELS[trigger],
      ),
    }))

  const evaluations = checkedOut
    .filter((record) => record.institutionEvaluation)
    .map((record) => ({
      record,
      evaluation: record.institutionEvaluation as InstitutionShiftEvaluation,
    }))

  const evaluationDimensionKeys = Object.keys(
    INSTITUTION_EVALUATION_DIMENSION_LABELS,
  ) as InstitutionEvaluationDimensionKey[]

  const institutionEvaluationDimensionSeries = evaluationDimensionKeys.map((key) => ({
    key,
    label: INSTITUTION_EVALUATION_DIMENSION_LABELS[key],
    avg: averageNumbers(evaluations.map(({ evaluation }) => Number(evaluation[key]))),
  }))

  const institutionEvaluationAverages = {
    organization: institutionEvaluationDimensionSeries.find((item) => item.key === 'organization')?.avg ?? 0,
    patientVolume: institutionEvaluationDimensionSeries.find((item) => item.key === 'patientVolume')?.avg ?? 0,
    safety: institutionEvaluationDimensionSeries.find((item) => item.key === 'safety')?.avg ?? 0,
    structure: institutionEvaluationDimensionSeries.find((item) => item.key === 'structure')?.avg ?? 0,
    paymentOnTime: institutionEvaluationDimensionSeries.find((item) => item.key === 'paymentOnTime')?.avg ?? 0,
    teamEnvironment: institutionEvaluationDimensionSeries.find((item) => item.key === 'teamEnvironment')?.avg ?? 0,
    overall: averageNumbers(evaluations.map(({ evaluation }) => getEvaluationOverallScore(evaluation))),
  }

  const institutionEvaluationRecentNotes = evaluations
    .filter(({ evaluation }) => Boolean(evaluation.note))
    .sort((a, b) => b.record.shiftDate.localeCompare(a.record.shiftDate))
    .slice(0, 8)
    .map(({ record, evaluation }) => ({
      id: record.id,
      professionalName:
        professionalsById.get(record.professionalId)?.name ?? record.professionalName,
      sectorName: record.sectorName,
      shiftDate: record.shiftDate,
      note: evaluation.note ?? '',
      overall: getEvaluationOverallScore(evaluation),
    }))

  // Predictive risk of failure/no-show for upcoming shifts
  const pastRecordsByProfessional = new Map<string, ShiftAttendanceRecord[]>()
  records.forEach((record) => {
    const key = record.professionalId || record.professionalUserId
    const list = pastRecordsByProfessional.get(key) ?? []
    list.push(record)
    pastRecordsByProfessional.set(key, list)
  })

  const cancellationByProfessional = new Map<string, ShiftCancellationEvent[]>()
  cancellationEvents.forEach((event) => {
    const key = event.professionalId || event.professionalUserId
    const list = cancellationByProfessional.get(key) ?? []
    list.push(event)
    cancellationByProfessional.set(key, list)
  })

  const predictiveRows = upcomingAssignments
    .filter((assignment) => {
      const shiftStart = new Date(`${assignment.date.slice(0, 10)}T${assignment.startTime}:00`)
      return shiftStart.getTime() > referenceDate.getTime()
    })
    .map((assignment) => {
      const key = assignment.professionalId
      const history = (pastRecordsByProfessional.get(key) ?? []).sort((a, b) =>
        `${a.shiftDate}T${a.startTime}`.localeCompare(`${b.shiftDate}T${b.startTime}`),
      )
      const cancelHistory = cancellationByProfessional.get(key) ?? []
      const totalHistory = history.length
      const checkedInHistory = history.filter((record) => Boolean(record.checkIn))
      const abandonmentHistory = history.filter((record) => isShiftAbandonment(record, referenceDate))
      const noCheckInHistory = history.filter((record) => !record.checkIn)
      const onTimeHistory = checkedInHistory.filter((record) => record.onTime)
      const avgLate = averageNumbers(checkedInHistory.map((record) => record.lateMinutes))
      const avgCheckInDistance = averageNumbers(
        checkedInHistory.map((record) => record.checkIn?.distanceMeters ?? 0).filter((value) => value > 0),
      )
      const recent14dCount = history.filter((record) => {
        const shiftStart = new Date(record.scheduledStartAt)
        const diffDays = (referenceDate.getTime() - shiftStart.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays >= 0 && diffDays <= 14
      }).length
      const recent7dCount = history.filter((record) => {
        const shiftStart = new Date(record.scheduledStartAt)
        const diffDays = (referenceDate.getTime() - shiftStart.getTime()) / (1000 * 60 * 60 * 24)
        return diffDays >= 0 && diffDays <= 7
      }).length
      const lastMinuteCancelCount = cancelHistory.filter(isLastMinuteCancellation).length
      const commuteEstimateKm = deterministicCommuteEstimateKm(key || assignment.professionalName)
      const nightShift = isNightShiftByClock(assignment.startTime, assignment.endTime)

      const abandonmentRatePct =
        checkedInHistory.length > 0
          ? (abandonmentHistory.length / checkedInHistory.length) * 100
          : 0
      const noShowSignalPct =
        totalHistory > 0 ? (noCheckInHistory.length / totalHistory) * 100 : 0
      const lateRatePct =
        checkedInHistory.length > 0
          ? ((checkedInHistory.length - onTimeHistory.length) / checkedInHistory.length) * 100
          : 0
      const lastMinuteCancelRatePct =
        cancelHistory.length > 0 ? (lastMinuteCancelCount / cancelHistory.length) * 100 : 0

      let risk =
        6 +
        abandonmentRatePct * 0.22 +
        noShowSignalPct * 0.16 +
        lateRatePct * 0.08 +
        avgLate * 0.35 +
        lastMinuteCancelRatePct * 0.12 +
        recent14dCount * 1.1 +
        Math.max(0, recent7dCount - 2) * 1.4 +
        commuteEstimateKm * 0.28 +
        (nightShift ? 4 : 0) +
        (avgCheckInDistance > 120 ? 3 : 0)

      if (onTimeHistory.length >= 6) risk -= 4
      if (institutionCompleted.filter((record) => record.professionalId === assignment.professionalId).length >= 8) {
        risk -= 3
      }

      const riskPercent = clamp(round1(risk), 3, 92)
      const factors: string[] = []
      if (abandonmentRatePct >= 10) factors.push(`Histórico de abandono ${round1(abandonmentRatePct)}%`)
      if (lastMinuteCancelCount > 0) factors.push(`Cancelamentos em cima da hora: ${lastMinuteCancelCount}`)
      if (lateRatePct >= 25) factors.push(`Pontualidade pressionada (${round1(lateRatePct)}% atraso)`)
      if (recent14dCount >= 6) factors.push(`Alta frequência recente (${recent14dCount} plantões/14d)`)
      if (commuteEstimateKm >= 18) factors.push(`Distância estimada ${commuteEstimateKm} km`)
      if (nightShift) factors.push('Turno noturno')
      if (factors.length === 0) factors.push('Histórico recente estável')

      return {
        id: `pred-${assignment.id}`,
        shiftId: assignment.id,
        professionalId: assignment.professionalId,
        professionalName:
          professionalsById.get(assignment.professionalId)?.name ?? assignment.professionalName,
        specialty:
          professionalsById.get(assignment.professionalId)?.specialty ?? assignment.specialty,
        sectorName: assignment.sectorName,
        shiftDate: assignment.date.slice(0, 10),
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        riskPercent,
        riskBand: classifyPredictiveRiskBand(riskPercent),
        factors: factors.slice(0, 4),
      }
    })
    .sort((a, b) => b.riskPercent - a.riskPercent || a.shiftDate.localeCompare(b.shiftDate))

  const predictiveByProfessionalMap = new Map<
    string,
    {
      professionalId: string
      professionalName: string
      specialty?: string
      upcomingShifts: number
      riskSum: number
      maxRiskPercent: number
    }
  >()

  predictiveRows.forEach((row) => {
    const current = predictiveByProfessionalMap.get(row.professionalId) ?? {
      professionalId: row.professionalId,
      professionalName: row.professionalName,
      specialty: row.specialty,
      upcomingShifts: 0,
      riskSum: 0,
      maxRiskPercent: 0,
    }
    current.upcomingShifts += 1
    current.riskSum += row.riskPercent
    current.maxRiskPercent = Math.max(current.maxRiskPercent, row.riskPercent)
    predictiveByProfessionalMap.set(row.professionalId, current)
  })

  const predictiveByProfessional = Array.from(predictiveByProfessionalMap.values())
    .map((row) => ({
      professionalId: row.professionalId,
      professionalName: row.professionalName,
      specialty: row.specialty,
      upcomingShifts: row.upcomingShifts,
      avgRiskPercent: round1(row.riskSum / Math.max(1, row.upcomingShifts)),
      maxRiskPercent: row.maxRiskPercent,
    }))
    .sort((a, b) => b.avgRiskPercent - a.avgRiskPercent || b.maxRiskPercent - a.maxRiskPercent)

  return {
    totals: {
      plannedRecords: records.length,
      plannedCommitments,
      checkedInRecords: checkedIn.length,
      checkedOutRecords: checkedOut.length,
      institutionCompletedShifts: institutionCompleted.length,
      attendanceRate,
      checkInRate: records.length > 0 ? round1((checkedIn.length / records.length) * 100) : 0,
      checkoutRate: checkedIn.length > 0 ? round1((checkedOut.length / checkedIn.length) * 100) : 0,
      onTimeRate: checkedIn.length > 0 ? round1((onTime.length / checkedIn.length) * 100) : 0,
      abandonmentCount: abandonmentRecords.length,
      abandonmentRate,
      lastMinuteCancellationCount: lastMinuteCancellations.length,
      lastMinuteCancellationRate,
      avgLateMinutes,
      avgOvertimeMinutes,
      avgCheckInDistanceMeters,
      avgStressScore,
      avgStressLevel,
      highRiskRate,
    },
    lateRanking,
    stressRanking,
    riskDistribution,
    stressTimeline,
    topTriggers,
    highRiskCheckouts,
    institutionEvaluation: {
      totalEvaluations: evaluations.length,
      completionRate:
        checkedOut.length > 0 ? round1((evaluations.length / checkedOut.length) * 100) : 0,
      averages: institutionEvaluationAverages,
      dimensionSeries: institutionEvaluationDimensionSeries,
      recentNotes: institutionEvaluationRecentNotes,
    },
    predictiveFailureRisk: {
      totalUpcomingShifts: predictiveRows.length,
      avgRiskPercent: averageNumbers(predictiveRows.map((row) => row.riskPercent)),
      highRiskCount: predictiveRows.filter((row) => ['ALTO', 'CRITICO'].includes(row.riskBand)).length,
      byProfessional: predictiveByProfessional,
      topUpcomingShifts: predictiveRows.slice(0, 10),
    },
  }
}

export const useShiftAttendanceStore = create<ShiftAttendanceState>()(
  persist(
    (set, get) => ({
      ...buildEmptyAttendanceState(),

      initDemoData: () => set(() => ({ ...buildDemoAttendanceState() })),

      setAutoCheckInConsent: (value) => set(() => ({ autoCheckInConsent: Boolean(value) })),

      upsertGeofence: (input) => {
        const normalized: ShiftGeofence = {
          sectorId: input.sectorId,
          sectorName: input.sectorName.trim() || 'Setor',
          lat: Number(input.lat),
          lng: Number(input.lng),
          radiusMeters: clamp(Number(input.radiusMeters ?? DEFAULT_GEOFENCE_RADIUS_METERS), 30, 1000),
          label: input.label?.trim() || input.sectorName.trim() || 'Geofence',
          autoCheckInEnabled: input.autoCheckInEnabled ?? false,
          configuredByManager: input.configuredByManager ?? true,
          configuredAt: new Date().toISOString(),
        }

        if (!Number.isFinite(normalized.lat) || normalized.lat < -90 || normalized.lat > 90) {
          throw new Error('Latitude da geofence inválida.')
        }
        if (!Number.isFinite(normalized.lng) || normalized.lng < -180 || normalized.lng > 180) {
          throw new Error('Longitude da geofence inválida.')
        }

        set((state) => ({
          geofences: {
            ...state.geofences,
            [normalized.sectorId]: normalized,
          },
        }))

        return normalized
      },

      getShiftAttendance: (shiftId, professionalUserId) => {
        const records = get().records
        if (professionalUserId) {
          return (
            records.find(
              (record) =>
                record.shiftId === shiftId && record.professionalUserId === professionalUserId,
            ) ?? null
          )
        }

        return records.find((record) => record.shiftId === shiftId) ?? null
      },

      checkInShift: (input) => {
        let result: ShiftAttendanceRecord | null = null

        set((state) => {
          const geofence = requireRecordGeofence(state, { sectorId: input.sectorId, sectorName: input.sectorName })
          const geo = buildGeoSnapshot(geofence, input.geo)

          if (!geo.withinGeofence) {
            throw new Error(
              `Localização fora da área do plantão (${geo.distanceMeters}m do ponto esperado em ${geofence.label}).`,
            )
          }

          const existing = state.records.find(
            (record) =>
              record.shiftId === input.shiftId && record.professionalUserId === input.professionalUserId,
          )

          if (existing?.status === 'CHECKED_IN') {
            throw new Error('Check-in já realizado para este plantão.')
          }

          if (existing?.status === 'CHECKED_OUT') {
            throw new Error('Este plantão já foi finalizado com checkout.')
          }

          const base =
            existing ??
            baseRecordFromShift({
              shiftId: input.shiftId,
              professionalId: input.professionalId,
              professionalUserId: input.professionalUserId,
              professionalName: input.professionalName,
              sectorId: input.sectorId,
              sectorName: input.sectorName,
              shiftDate: input.shiftDate,
              startTime: input.startTime,
              endTime: input.endTime,
              patientLoad: input.patientLoad,
            })

          const scheduledStart = new Date(base.scheduledStartAt)
          const checkInAt = new Date(geo.capturedAt)
          const lateMinutes = Math.max(0, minutesBetween(checkInAt, scheduledStart))

          const updated: ShiftAttendanceRecord = {
            ...base,
            patientLoad: input.patientLoad ?? base.patientLoad,
            status: 'CHECKED_IN',
            checkIn: geo,
            onTime: lateMinutes <= 5,
            lateMinutes,
            updatedAt: geo.capturedAt,
          }

          result = updated
          return { records: upsertRecord(state.records, updated) }
        })

        if (!result) {
          throw new Error('Não foi possível concluir o check-in.')
        }

        return result
      },

      checkOutShift: (input) => {
        validateStressReport(input.stress)

        let result: ShiftAttendanceRecord | null = null

        set((state) => {
          const record = state.records.find(
            (item) => item.shiftId === input.shiftId && item.professionalUserId === input.professionalUserId,
          )

          if (!record) {
            throw new Error('Faça o check-in antes de finalizar o checkout.')
          }

          if (!record.checkIn) {
            throw new Error('Check-in não encontrado para este plantão.')
          }

          if (record.status === 'CHECKED_OUT') {
            throw new Error('Checkout já realizado para este plantão.')
          }

          const geofence = requireRecordGeofence(state, record)
          const geo = buildGeoSnapshot(geofence, input.geo)
          if (!geo.withinGeofence) {
            throw new Error(
              `Checkout fora da área do plantão (${geo.distanceMeters}m do ponto esperado em ${geofence.label}).`,
            )
          }

          const scheduledEnd = new Date(record.scheduledEndAt)
          const checkInAt = new Date(record.checkIn.capturedAt)
          const checkOutAt = new Date(geo.capturedAt)
          const overtimeMinutes = Math.max(0, minutesBetween(checkOutAt, scheduledEnd))
          const earlyCheckoutMinutes = Math.max(0, minutesBetween(scheduledEnd, checkOutAt))
          const workedMinutes = Math.max(0, minutesBetween(checkOutAt, checkInAt))

          let updated: ShiftAttendanceRecord = {
            ...record,
            status: 'CHECKED_OUT',
            checkOut: geo,
            overtimeMinutes,
            earlyCheckoutMinutes,
            workedMinutes,
            stressSelfReport: {
              ...input.stress,
              triggers: Array.from(new Set(input.stress.triggers)).slice(0, 6),
              note: input.stress.note?.trim() || undefined,
            },
            institutionEvaluation: normalizeInstitutionEvaluation(input.institutionEvaluation),
            updatedAt: geo.capturedAt,
          }

          updated = {
            ...updated,
            stressAnalytics: computeStressAnalytics(updated, updated.stressSelfReport!, state.records),
          }

          result = updated
          return { records: upsertRecord(state.records, updated) }
        })

        if (!result) {
          throw new Error('Não foi possível concluir o checkout.')
        }

        return result
      },

      resetAttendanceData: () => set(() => ({ ...buildEmptyAttendanceState() })),
      resetAttendanceDemoData: () => set(() => ({ ...buildEmptyAttendanceState() })),
    }),
    {
      name: 'confirma-plantao-shift-attendance',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        geofences: state.geofences,
        records: state.records,
        cancellationEvents: state.cancellationEvents,
        autoCheckInConsent: state.autoCheckInConsent,
        autoCheckInWindowStartMinutesBefore: state.autoCheckInWindowStartMinutesBefore,
        autoCheckInWindowEndMinutesAfter: state.autoCheckInWindowEndMinutesAfter,
      }),
    },
  ),
)

export function buildDemoGeoPositionFromGeofence(
  geofence: ShiftGeofence,
  source: GeoCaptureSource = 'demo-simulado',
) {
  const lat = geofence.lat + 0.00009
  const lng = geofence.lng - 0.00004
  return {
    lat,
    lng,
    accuracyMeters: 14,
    source,
  }
}

export function listStressTriggerOptions() {
  return (Object.keys(STRESS_TRIGGER_LABELS) as StressTriggerCode[]).map((code) => ({
    code,
    label: STRESS_TRIGGER_LABELS[code],
  }))
}

export function formatStressDrivers(analytics?: StressAnalytics) {
  if (!analytics) return []

  const labels: Record<keyof StressScoreBreakdown, string> = {
    selfReport: 'Autopercepção',
    lateness: 'Atraso no check-in',
    overtime: 'Hora extra',
    workload: 'Carga assistencial',
    nightShift: 'Turno noturno',
    triggers: 'Gatilhos reportados',
    lowEnergy: 'Baixa energia',
    lowSupport: 'Baixo suporte',
    shortRest: 'Descanso curto',
  }

  return analytics.dominantDrivers.map((driver) => ({
    label: labels[driver.key],
    value: driver.value,
  }))
}

export function inferAttendanceSectorIdByName(name: string) {
  return resolveSectorIdByName(name)
}

export function getInstitutionEvaluationDimensionLabels() {
  return INSTITUTION_EVALUATION_DIMENSION_LABELS
}
