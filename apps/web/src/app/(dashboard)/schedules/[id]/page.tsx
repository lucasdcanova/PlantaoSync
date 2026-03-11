'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
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
  Loader2,
  LocateFixed,
  Search,
  X,
} from 'lucide-react'
import type { ScheduleCoverageMode, ScheduleStatus } from '@agendaplantao/shared'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SHIFT_STATUS_CONFIG, cn, formatCurrency, formatDate } from '@/lib/utils'
import { OPEN_ENDED_SCHEDULE_END_DATE, isOpenEndedSchedule } from '@/lib/schedule-range'
import { getApiClient } from '@/lib/api'
import { mapApiLocationToManager, mapApiScheduleToManager } from '@/lib/backend-mappers'
import {
  useSchedulesStore,
  type ScheduleEditorInput,
} from '@/store/schedules.store'
import { useLocationsStore } from '@/store/locations.store'
import { useAuthStore } from '@/store/auth.store'

const GeofencePickerMap = dynamic(
  () => import('@/components/maps/geofence-picker-map').then((mod) => mod.GeofencePickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="border-border bg-muted/30 text-muted-foreground grid h-[260px] w-full place-items-center rounded-xl border text-sm">
        Carregando mapa...
      </div>
    ),
  },
)

type ScheduleFormValues = {
  title: string
  description: string
  locationId: string
  shiftValue: string
  startDate: string
  endDate: string
  coverageMode: ScheduleCoverageMode
  coverageStartTime: string
  coverageEndTime: string
  shiftDurationHours: string
  professionalsPerShift: string
  status: ScheduleStatus
  publishedAt: string
  requireSwapApproval: boolean
  geofenceLat: string
  geofenceLng: string
  geofenceRadiusMeters: string
  geofenceLabel: string
  geofenceAutoCheckInEnabled: boolean
  openEnded: boolean
}

type ExtraShiftFormValues = {
  date: string
  startTime: string
  endTime: string
  requiredCount: number
  notes: string
}

type GeocodeLookupResult = {
  lat: number
  lng: number
  displayName: string
  primaryText: string
  secondaryText: string
}

const STATUS_OPTIONS: Array<{ value: ScheduleStatus; label: string }> = [
  { value: 'DRAFT', label: SHIFT_STATUS_CONFIG.DRAFT.label },
  { value: 'PUBLISHED', label: SHIFT_STATUS_CONFIG.PUBLISHED.label },
  { value: 'CLOSED', label: SHIFT_STATUS_CONFIG.CLOSED.label },
  { value: 'ARCHIVED', label: SHIFT_STATUS_CONFIG.ARCHIVED.label },
]

const COVERAGE_MODE_OPTIONS: Array<{ value: ScheduleCoverageMode; label: string }> = [
  { value: 'FULL_DAY', label: 'Cobertura 24 horas' },
  { value: 'CUSTOM_WINDOW', label: 'Período específico' },
]

const DEFAULT_GEOFENCE_RADIUS_METERS = 180
const MIN_GEOFENCE_RADIUS_METERS = 30
const MAX_GEOFENCE_RADIUS_METERS = 1000
const GEOFENCE_RADIUS_PRESETS = [80, 150, 250, 400]

function clampGeofenceRadius(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_GEOFENCE_RADIUS_METERS

  return Math.min(
    MAX_GEOFENCE_RADIUS_METERS,
    Math.max(MIN_GEOFENCE_RADIUS_METERS, Math.round(value)),
  )
}

function formatGeofenceCoverage(radiusMeters: number) {
  const areaSquareMeters = Math.PI * radiusMeters * radiusMeters

  if (areaSquareMeters >= 1_000_000) {
    return `${(areaSquareMeters / 1_000_000).toFixed(2).replace('.', ',')} km²`
  }

  return `${Math.round(areaSquareMeters).toLocaleString('pt-BR')} m²`
}

function buildDefaultForm(defaultLocationId = ''): ScheduleFormValues {
  return {
    title: '',
    description: '',
    locationId: defaultLocationId,
    shiftValue: '1400,00',
    startDate: '',
    endDate: '',
    coverageMode: 'FULL_DAY',
    coverageStartTime: '07:00',
    coverageEndTime: '19:00',
    shiftDurationHours: '12',
    professionalsPerShift: '1',
    status: 'DRAFT',
    publishedAt: '',
    requireSwapApproval: true,
    geofenceLat: '',
    geofenceLng: '',
    geofenceRadiusMeters: String(DEFAULT_GEOFENCE_RADIUS_METERS),
    geofenceLabel: '',
    geofenceAutoCheckInEnabled: false,
    openEnded: false,
  }
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
  shiftValue: number
  startDate: string
  endDate?: string
  coverageMode?: ScheduleCoverageMode
  coverageStartTime?: string
  coverageEndTime?: string
  shiftDurationHours?: number
  professionalsPerShift?: number
  status: ScheduleStatus
  publishedAt?: string
  requireSwapApproval: boolean
  geofence?: {
    lat: number
    lng: number
    radiusMeters: number
    autoCheckInEnabled: boolean
    label?: string
  }
}) {
  return {
    title: input.title,
    description: input.description ?? '',
    locationId: input.locationId,
    shiftValue: (input.shiftValue / 100).toFixed(2).replace('.', ','),
    startDate: input.startDate.slice(0, 10),
    endDate: isOpenEndedSchedule(input.endDate) ? '' : input.endDate?.slice(0, 10) ?? '',
    coverageMode: input.coverageMode ?? 'FULL_DAY',
    coverageStartTime: input.coverageStartTime ?? '07:00',
    coverageEndTime: input.coverageEndTime ?? '19:00',
    shiftDurationHours: String(input.shiftDurationHours ?? 12),
    professionalsPerShift: String(input.professionalsPerShift ?? 1),
    status: input.status,
    publishedAt: input.publishedAt?.slice(0, 10) ?? '',
    requireSwapApproval: input.requireSwapApproval,
    geofenceLat:
      input.geofence && Number.isFinite(input.geofence.lat) ? String(input.geofence.lat) : '',
    geofenceLng:
      input.geofence && Number.isFinite(input.geofence.lng) ? String(input.geofence.lng) : '',
    geofenceRadiusMeters: String(input.geofence?.radiusMeters ?? DEFAULT_GEOFENCE_RADIUS_METERS),
    geofenceLabel: input.geofence?.label ?? '',
    geofenceAutoCheckInEnabled: input.geofence?.autoCheckInEnabled ?? false,
    openEnded: isOpenEndedSchedule(input.endDate),
  } satisfies ScheduleFormValues
}

function parseCurrencyToCents(value: string) {
  const cleaned = value.replace(/[^\d,.-]/g, '').trim()
  if (!cleaned) return Number.NaN

  const hasComma = cleaned.includes(',')
  const normalized = Number(hasComma ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned)

  if (!Number.isFinite(normalized) || normalized <= 0) return Number.NaN
  return Math.round(normalized * 100)
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

function isValidTime(value?: string) {
  if (!value) return false
  return TIME_REGEX.test(value)
}

function timeToMinutes(value: string) {
  if (!isValidTime(value)) return Number.NaN
  const [hoursPart, minutesPart] = value.split(':')
  return Number(hoursPart) * 60 + Number(minutesPart)
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

function formatCoverageWindow(
  coverageMode: ScheduleCoverageMode,
  coverageStartTime: string,
  coverageEndTime: string,
) {
  if (coverageMode === 'FULL_DAY') return '24 horas contínuas'
  return `${coverageStartTime || '—'} às ${coverageEndTime || '—'}`
}

export default function ScheduleDetailsPage() {
  const params = useParams<{ id: string | string[] }>()
  const router = useRouter()

  const rawId = params?.id
  const scheduleId = Array.isArray(rawId) ? rawId[0] : rawId
  const isCreateMode = scheduleId === 'new'

  const schedules = useSchedulesStore((state) => state.schedules)
  const upsertSchedule = useSchedulesStore((state) => state.upsertSchedule)
  const removeSchedule = useSchedulesStore((state) => state.removeSchedule)
  const locations = useLocationsStore((state) => state.locations)
  const setLocations = useLocationsStore((state) => state.setLocations)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const defaultLocationId =
    locations.find((location) => location.isActive)?.id ?? locations[0]?.id ?? ''
  const locationNameById = useMemo(
    () => new Map(locations.map((location) => [location.id, location.name])),
    [locations],
  )

  const schedule = useMemo(
    () => (isCreateMode ? null : (schedules.find((item) => item.id === scheduleId) ?? null)),
    [isCreateMode, scheduleId, schedules],
  )

  useEffect(() => {
    if (!isAuthenticated || isCreateMode || !scheduleId || schedule) return
    let cancelled = false

    const loadSchedule = async () => {
      try {
        const api = getApiClient()
        const response = await api.get(`schedules/${scheduleId}`).json()
        if (cancelled) return
        upsertSchedule(
          mapApiScheduleToManager(response as Parameters<typeof mapApiScheduleToManager>[0]),
        )
      } catch {
        // mantém fallback da tela de "não encontrada"
      }
    }

    void loadSchedule()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isCreateMode, schedule, scheduleId, upsertSchedule])

  const [form, setForm] = useState<ScheduleFormValues>(() => buildDefaultForm(defaultLocationId))
  const [extraShiftForm, setExtraShiftForm] =
    useState<ExtraShiftFormValues>(DEFAULT_EXTRA_SHIFT_FORM)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [geofenceSearchQuery, setGeofenceSearchQuery] = useState('')
  const [geofenceSearchResults, setGeofenceSearchResults] = useState<GeocodeLookupResult[]>([])
  const [geofenceSearchError, setGeofenceSearchError] = useState<string | null>(null)
  const [isSearchingGeofence, setIsSearchingGeofence] = useState(false)
  const [resolvedGeofenceAddress, setResolvedGeofenceAddress] =
    useState<GeocodeLookupResult | null>(null)
  const [isResolvingGeofenceAddress, setIsResolvingGeofenceAddress] = useState(false)

  useEffect(() => {
    if (isCreateMode) {
      setForm(buildDefaultForm(defaultLocationId))
      return
    }

    if (schedule) {
      setForm(toFormValues(schedule))
    }
  }, [defaultLocationId, isCreateMode, schedule])

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false

    const loadLocations = async () => {
      try {
        const api = getApiClient()
        const response = await api
          .get('locations')
          .json<Array<{ id: string; name: string; isActive?: boolean; createdAt?: string; updatedAt?: string }>>()

        if (cancelled) return
        setLocations(response.map((location) => mapApiLocationToManager(location)))
      } catch {
        // mantém UI funcional com dados já em memória/local
      }
    }

    void loadLocations()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, setLocations])

  const statusConfig = SHIFT_STATUS_CONFIG[form.status]
  const selectedLocation = locations.find((location) => location.id === form.locationId)
  const hasLocations = locations.length > 0

  const canEditPublishedAt = form.status !== 'DRAFT'

  const detailsSubtitle = isCreateMode
    ? 'Configure uma nova escala mensal para a equipe'
    : 'Edite todos os dados operacionais desta escala'

  const formTitle = isCreateMode ? 'Nova Escala Mensal' : 'Edição Completa da Escala'
  const parsedShiftValue = parseCurrencyToCents(form.shiftValue)
  const parsedShiftDurationHours = Number(form.shiftDurationHours)
  const parsedProfessionalsPerShift = Number(form.professionalsPerShift)
  const coverageDurationHours = getCoverageDurationHours(
    form.coverageMode,
    form.coverageStartTime,
    form.coverageEndTime,
  )
  const shiftsPerCoveragePeriod =
    Number.isFinite(coverageDurationHours) &&
    Number.isFinite(parsedShiftDurationHours) &&
    parsedShiftDurationHours > 0
      ? coverageDurationHours / parsedShiftDurationHours
      : Number.NaN
  const doctorsPerCoveragePeriod =
    Number.isFinite(shiftsPerCoveragePeriod) &&
    Number.isFinite(parsedProfessionalsPerShift) &&
    parsedProfessionalsPerShift > 0
      ? shiftsPerCoveragePeriod * parsedProfessionalsPerShift
      : Number.NaN
  const shiftsPerDay =
    form.coverageMode === 'FULL_DAY'
      ? shiftsPerCoveragePeriod
      : Number.NaN
  const doctorsPerDay =
    form.coverageMode === 'FULL_DAY' &&
    Number.isFinite(doctorsPerCoveragePeriod)
      ? doctorsPerCoveragePeriod
      : Number.NaN
  const parsedGeofenceLat = Number(form.geofenceLat)
  const parsedGeofenceLng = Number(form.geofenceLng)
  const parsedGeofenceRadius = Number(form.geofenceRadiusMeters)
  const safeGeofenceRadius = clampGeofenceRadius(parsedGeofenceRadius)
  const geofencePoint =
    Number.isFinite(parsedGeofenceLat) && Number.isFinite(parsedGeofenceLng)
      ? { lat: parsedGeofenceLat, lng: parsedGeofenceLng }
      : null
  const geofenceAddressLabel =
    resolvedGeofenceAddress?.secondaryText || resolvedGeofenceAddress?.displayName || null
  const geofenceDisplayLabel =
    form.geofenceLabel.trim() ||
    resolvedGeofenceAddress?.primaryText ||
    selectedLocation?.name ||
    'Ponto da escala'

  useEffect(() => {
    if (!geofencePoint) {
      setResolvedGeofenceAddress(null)
      setIsResolvingGeofenceAddress(false)
      return
    }

    const controller = new AbortController()

    const resolveAddress = async () => {
      setIsResolvingGeofenceAddress(true)

      try {
        const response = await fetch(
          `/api/geocode?lat=${geofencePoint.lat.toFixed(6)}&lng=${geofencePoint.lng.toFixed(6)}`,
          {
            signal: controller.signal,
            cache: 'no-store',
          },
        )

        const payload = (await response.json()) as {
          message?: string
          result?: GeocodeLookupResult | null
        }

        if (!response.ok) {
          throw new Error(payload.message || 'Nao foi possivel resolver o endereco da geofence.')
        }

        if (!controller.signal.aborted) {
          setResolvedGeofenceAddress(payload.result ?? null)
        }
      } catch {
        if (!controller.signal.aborted) {
          setResolvedGeofenceAddress(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsResolvingGeofenceAddress(false)
        }
      }
    }

    void resolveAddress()

    return () => {
      controller.abort()
    }
  }, [geofencePoint?.lat, geofencePoint?.lng])

  const validateForm = () => {
    if (!hasLocations) {
      return 'Cadastre pelo menos um setor antes de criar ou editar escalas.'
    }

    if (!form.title.trim()) {
      return 'Informe o título da escala.'
    }

    if (!form.locationId) {
      return 'Selecione o local da escala.'
    }

    if (!form.startDate) {
      return 'Informe a data de início.'
    }

    if (!form.openEnded && !form.endDate) {
      return 'Informe a data final ou marque a escala como sem data final.'
    }

    if (!form.openEnded && form.startDate > form.endDate) {
      return 'A data de início não pode ser maior que a data final.'
    }

    if (!Number.isFinite(parsedShiftValue) || parsedShiftValue <= 0) {
      return 'Informe um valor por plantão válido e maior que zero.'
    }

    if (!Number.isFinite(parsedShiftDurationHours) || parsedShiftDurationHours < 1) {
      return 'Informe a duração de cada plantão (em horas).'
    }

    if (!Number.isInteger(parsedShiftDurationHours)) {
      return 'A duração do plantão deve ser um número inteiro de horas.'
    }

    if (!Number.isFinite(parsedProfessionalsPerShift) || parsedProfessionalsPerShift < 1) {
      return 'Informe a quantidade de médicos por plantão.'
    }

    if (!Number.isInteger(parsedProfessionalsPerShift)) {
      return 'A quantidade de médicos por plantão deve ser um número inteiro.'
    }

    if (form.coverageMode === 'CUSTOM_WINDOW') {
      if (!isValidTime(form.coverageStartTime)) {
        return 'Informe o horário inicial do período de cobertura.'
      }
      if (!isValidTime(form.coverageEndTime)) {
        return 'Informe o horário final do período de cobertura.'
      }
      if (form.coverageStartTime === form.coverageEndTime) {
        return 'Em período específico, início e fim não podem ser iguais.'
      }
    }

    if (!Number.isFinite(coverageDurationHours) || coverageDurationHours <= 0) {
      return 'A cobertura configurada é inválida. Revise horários e duração.'
    }

    if (parsedShiftDurationHours > coverageDurationHours) {
      return 'A duração do plantão não pode ser maior do que a cobertura definida.'
    }

    if (!Number.isFinite(shiftsPerCoveragePeriod) || !Number.isInteger(shiftsPerCoveragePeriod)) {
      return 'A duração do plantão deve dividir exatamente a cobertura (ex.: 24h com plantão de 12h).'
    }

    const hasAnyGeofenceField =
      form.geofenceLat.trim() ||
      form.geofenceLng.trim() ||
      form.geofenceLabel.trim() ||
      form.geofenceAutoCheckInEnabled

    if (hasAnyGeofenceField) {
      if (!Number.isFinite(parsedGeofenceLat) || parsedGeofenceLat < -90 || parsedGeofenceLat > 90) {
        return 'Informe uma latitude válida para a geofence.'
      }

      if (!Number.isFinite(parsedGeofenceLng) || parsedGeofenceLng < -180 || parsedGeofenceLng > 180) {
        return 'Informe uma longitude válida para a geofence.'
      }

      if (!Number.isFinite(parsedGeofenceRadius) || parsedGeofenceRadius < 30) {
        return 'Informe um raio de geofence maior ou igual a 30m.'
      }
    }

    return null
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
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
      locationName: selectedLocation?.name,
      shiftValue: parsedShiftValue,
      startDate: form.startDate,
      endDate: form.openEnded ? OPEN_ENDED_SCHEDULE_END_DATE : form.endDate,
      coverageMode: form.coverageMode,
      coverageStartTime:
        form.coverageMode === 'CUSTOM_WINDOW' ? form.coverageStartTime : undefined,
      coverageEndTime: form.coverageMode === 'CUSTOM_WINDOW' ? form.coverageEndTime : undefined,
      shiftDurationHours: Math.round(parsedShiftDurationHours),
      professionalsPerShift: Math.round(parsedProfessionalsPerShift),
      status: form.status,
      publishedAt: canEditPublishedAt ? form.publishedAt || undefined : undefined,
      requireSwapApproval: form.requireSwapApproval,
      geofence:
        Number.isFinite(parsedGeofenceLat) &&
        Number.isFinite(parsedGeofenceLng) &&
        form.geofenceLat.trim() &&
        form.geofenceLng.trim()
          ? {
              lat: parsedGeofenceLat,
              lng: parsedGeofenceLng,
              radiusMeters:
                Number.isFinite(parsedGeofenceRadius) && parsedGeofenceRadius > 0
                  ? clampGeofenceRadius(parsedGeofenceRadius)
                  : DEFAULT_GEOFENCE_RADIUS_METERS,
              label: form.geofenceLabel.trim() || selectedLocation?.name,
              autoCheckInEnabled: form.geofenceAutoCheckInEnabled,
            }
          : undefined,
    }

    try {
      const api = getApiClient()
      const apiPayload = {
        title: payload.title,
        description: payload.description,
        locationId: payload.locationId,
        startDate: payload.startDate,
        endDate: payload.endDate,
        coverageMode: payload.coverageMode,
        coverageStartTime: payload.coverageStartTime,
        coverageEndTime: payload.coverageEndTime,
        shiftDurationHours: payload.shiftDurationHours,
        professionalsPerShift: payload.professionalsPerShift,
        shiftValue: payload.shiftValue,
        requireSwapApproval: payload.requireSwapApproval,
        geofenceLat: payload.geofence?.lat,
        geofenceLng: payload.geofence?.lng,
        geofenceRadiusMeters: payload.geofence?.radiusMeters,
        geofenceAutoCheckInEnabled: payload.geofence?.autoCheckInEnabled,
        geofenceLabel: payload.geofence?.label,
      }

      if (isCreateMode) {
        const createdResponse = await api.post('schedules', { json: apiPayload }).json()
        const created = upsertSchedule(
          mapApiScheduleToManager(
            createdResponse as Parameters<typeof mapApiScheduleToManager>[0],
          ),
        )
        setSuccessMessage('Escala criada com sucesso.')
        router.replace(`/schedules/${created.id}`)
        return
      }

      if (!scheduleId) {
        setErrorMessage('ID da escala inválido.')
        return
      }

      const updatedResponse = await api.patch(`schedules/${scheduleId}`, { json: apiPayload }).json()
      upsertSchedule(
        mapApiScheduleToManager(
          updatedResponse as Parameters<typeof mapApiScheduleToManager>[0],
        ),
      )
      setSuccessMessage('Escala atualizada com sucesso.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao salvar a escala.')
    }
  }

  const applyGeofencePoint = ({
    lat,
    lng,
    fallbackLabel,
    searchLabel,
    resolvedAddress,
    success,
  }: {
    lat: number
    lng: number
    fallbackLabel?: string
    searchLabel?: string
    resolvedAddress?: GeocodeLookupResult | null
    success?: string | null
  }) => {
    setErrorMessage(null)
    setGeofenceSearchError(null)
    setGeofenceSearchResults([])

    setForm((prev) => ({
      ...prev,
      geofenceLat: lat.toFixed(6),
      geofenceLng: lng.toFixed(6),
      geofenceLabel: prev.geofenceLabel || selectedLocation?.name || fallbackLabel || 'Ponto da escala',
    }))

    if (typeof searchLabel === 'string') {
      setGeofenceSearchQuery(searchLabel)
    }

    if (typeof resolvedAddress !== 'undefined') {
      setResolvedGeofenceAddress(resolvedAddress)
    }

    setSuccessMessage(success ?? null)
  }

  const handleGeofenceSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = geofenceSearchQuery.trim()
    if (query.length < 3) {
      setGeofenceSearchError('Digite pelo menos 3 caracteres para buscar um endereco.')
      setGeofenceSearchResults([])
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)
    setGeofenceSearchError(null)
    setIsSearchingGeofence(true)

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`, {
        cache: 'no-store',
      })

      const payload = (await response.json()) as {
        message?: string
        results?: GeocodeLookupResult[]
      }

      if (!response.ok) {
        throw new Error(payload.message || 'Nao foi possivel buscar o endereco informado.')
      }

      const results = payload.results ?? []
      setGeofenceSearchResults(results)

      if (results.length === 0) {
        setGeofenceSearchError('Nenhum endereco encontrado. Tente incluir rua, numero ou bairro.')
      }
    } catch (error) {
      setGeofenceSearchResults([])
      setGeofenceSearchError(
        error instanceof Error ? error.message : 'Falha ao buscar o endereco informado.',
      )
    } finally {
      setIsSearchingGeofence(false)
    }
  }

  const handleSelectGeocodeResult = (result: GeocodeLookupResult) => {
    applyGeofencePoint({
      lat: result.lat,
      lng: result.lng,
      fallbackLabel: result.primaryText,
      searchLabel: result.displayName,
      resolvedAddress: result,
      success: 'Endereco aplicado na geofence.',
    })
  }

  const handleGeofenceRadiusChange = (value: string) => {
    if (!value) {
      setForm((prev) => ({
        ...prev,
        geofenceRadiusMeters: '',
      }))
      return
    }

    const numericValue = Number(value)
    if (!Number.isFinite(numericValue)) return

    setForm((prev) => ({
      ...prev,
      geofenceRadiusMeters: String(clampGeofenceRadius(numericValue)),
    }))
  }

  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setErrorMessage('Geolocalização indisponível neste dispositivo.')
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)
    setIsLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        applyGeofencePoint({
          lat,
          lng,
          resolvedAddress: null,
          success: 'Localizacao atual aplicada na geofence.',
        })
        setIsLocating(false)
      },
      () => {
        setErrorMessage(
          'Não foi possível obter sua localização. Verifique a permissão de geolocalização.',
        )
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    )
  }

  const handleMapPinChange = ({ lat, lng }: { lat: number; lng: number }) => {
    applyGeofencePoint({
      lat,
      lng,
      resolvedAddress: null,
    })
  }

  const handleClearGeofencePoint = () => {
    setForm((prev) => ({
      ...prev,
      geofenceLat: '',
      geofenceLng: '',
      geofenceLabel: '',
      geofenceAutoCheckInEnabled: false,
    }))
    setGeofenceSearchQuery('')
    setGeofenceSearchResults([])
    setGeofenceSearchError(null)
    setResolvedGeofenceAddress(null)
    setSuccessMessage('Ponto da geofence removido.')
  }

  const handleDelete = async () => {
    if (!scheduleId || isCreateMode) return

    const confirmed = window.confirm('Deseja excluir esta escala? Esta ação não pode ser desfeita.')
    if (!confirmed) return

    try {
      const api = getApiClient()
      await api.delete(`schedules/${scheduleId}`)
      removeSchedule(scheduleId)
      router.push('/schedules')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao excluir a escala.')
    }
  }

  const handleReset = () => {
    if (isCreateMode) {
      setForm(buildDefaultForm(defaultLocationId))
      return
    }

    if (schedule) {
      setForm(toFormValues(schedule))
    }
  }

  const refreshScheduleDetails = async () => {
    if (!scheduleId) return
    const api = getApiClient()
    const response = await api.get(`schedules/${scheduleId}`).json()
    upsertSchedule(
      mapApiScheduleToManager(response as Parameters<typeof mapApiScheduleToManager>[0]),
    )
  }

  const handleAddExtraShift = async () => {
    if (isCreateMode || !scheduleId || !schedule) {
      setErrorMessage('Salve a escala primeiro para incluir turnos extras.')
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const api = getApiClient()
      await api.post('shifts', {
        json: {
          scheduleId,
          locationId: form.locationId,
          date: extraShiftForm.date,
          startTime: extraShiftForm.startTime,
          endTime: extraShiftForm.endTime,
          requiredCount: Number(extraShiftForm.requiredCount),
          notes: extraShiftForm.notes?.trim() || undefined,
          valuePerShift: ((schedule.shiftValue ?? 0) / 100).toFixed(2),
        },
      })

      await refreshScheduleDetails()
      setExtraShiftForm(DEFAULT_EXTRA_SHIFT_FORM)
      setSuccessMessage('Turno extra adicionado à escala.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao adicionar turno extra.')
    }
  }

  const handleRemoveExtraShift = async (extraShiftId: string) => {
    if (!scheduleId) return

    try {
      const api = getApiClient()
      await api.delete(`shifts/${extraShiftId}`)
      await refreshScheduleDetails()
      setSuccessMessage('Turno extra removido.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao remover turno extra.')
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
                      disabled={!hasLocations}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          locationId: event.target.value,
                        }))
                      }
                      className="border-input bg-card text-foreground shadow-card focus-visible:ring-ring focus-visible:ring-offset-background h-10 w-full rounded-md border px-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                          {!location.isActive ? ' (inativo)' : ''}
                        </option>
                      ))}
                    </select>
                    {!hasLocations && (
                      <p className="text-muted-foreground text-xs">
                        Cadastre um setor na página de setores para habilitar a criação da escala.
                      </p>
                    )}
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

                <div className="space-y-2">
                  <Label htmlFor="schedule-shift-value">Valor por plantão (R$)</Label>
                  <Input
                    id="schedule-shift-value"
                    value={form.shiftValue}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        shiftValue: event.target.value,
                      }))
                    }
                    placeholder="1400,00"
                  />
                  <p className="text-muted-foreground text-xs">
                    Este valor alimenta os relatórios financeiros do gestor e os relatórios de
                    ganhos dos médicos vinculados à escala.
                  </p>
                </div>

                <div className="border-border bg-background space-y-3 rounded-xl border p-4">
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      Cobertura e composição dos plantões
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Defina se a escala cobre 24h ou um período específico, a duração de cada
                      plantão e quantos médicos ficam por plantão.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schedule-coverage-mode">Modelo de cobertura</Label>
                    <select
                      id="schedule-coverage-mode"
                      value={form.coverageMode}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          coverageMode: event.target.value as ScheduleCoverageMode,
                        }))
                      }
                      className="border-input bg-card text-foreground shadow-card focus-visible:ring-ring focus-visible:ring-offset-background h-10 w-full rounded-md border px-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      {COVERAGE_MODE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {form.coverageMode === 'CUSTOM_WINDOW' && (
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="schedule-coverage-start">Início da cobertura</Label>
                        <Input
                          id="schedule-coverage-start"
                          type="time"
                          value={form.coverageStartTime}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              coverageStartTime: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="schedule-coverage-end">Fim da cobertura</Label>
                        <Input
                          id="schedule-coverage-end"
                          type="time"
                          value={form.coverageEndTime}
                          onChange={(event) =>
                            setForm((prev) => ({
                              ...prev,
                              coverageEndTime: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="schedule-shift-duration-hours">Duração de cada plantão (h)</Label>
                      <Input
                        id="schedule-shift-duration-hours"
                        type="number"
                        min={1}
                        step={1}
                        value={form.shiftDurationHours}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            shiftDurationHours: event.target.value,
                          }))
                        }
                        placeholder="12"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="schedule-professionals-per-shift">Médicos por plantão</Label>
                      <Input
                        id="schedule-professionals-per-shift"
                        type="number"
                        min={1}
                        step={1}
                        value={form.professionalsPerShift}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            professionalsPerShift: event.target.value,
                          }))
                        }
                        placeholder="2"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-foreground text-sm font-medium">Prévia operacional</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {Number.isInteger(shiftsPerCoveragePeriod) &&
                      Number.isFinite(doctorsPerCoveragePeriod)
                        ? form.coverageMode === 'FULL_DAY'
                          ? `${shiftsPerDay.toFixed(0)} plantão(ões)/dia · ${doctorsPerDay.toFixed(0)} médico(s)/dia`
                          : `${shiftsPerCoveragePeriod.toFixed(0)} plantão(ões) no período · ${doctorsPerCoveragePeriod.toFixed(0)} médico(s) no período`
                        : 'Ajuste a cobertura e a duração para gerar uma divisão exata de plantões.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div>
                      <p className="text-foreground text-sm font-medium">Escala sem data final</p>
                      <p className="text-muted-foreground text-xs">
                        Mantém a escala aberta até que a gestão feche manualmente.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.openEnded}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          openEnded: event.target.checked,
                          endDate: event.target.checked ? '' : prev.endDate,
                        }))
                      }
                      className="border-border text-brand-600 focus:ring-brand-500 h-4 w-4 rounded"
                    />
                  </div>

                  <div className={form.openEnded ? 'grid gap-4 md:grid-cols-1' : 'grid gap-4 md:grid-cols-2'}>
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

                    {!form.openEnded && (
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
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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

                <div className="border-border bg-background rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-foreground text-sm font-medium">
                        Geofence do plantão (local exato)
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Busque um endereço, arraste o pin no mapa e ajuste o raio sem sair do fluxo.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-brand-200 bg-brand-50 text-brand-800">
                      {geofencePoint ? `Raio ativo: ${safeGeofenceRadius}m` : 'Sem ponto definido'}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px]">
                    <div className="space-y-4">
                      <form
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
                        onSubmit={handleGeofenceSearch}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <div className="relative flex-1">
                            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                            <Input
                              value={geofenceSearchQuery}
                              onChange={(event) => setGeofenceSearchQuery(event.target.value)}
                              placeholder="Buscar rua, hospital, bairro ou cidade"
                              className="bg-background pl-9"
                            />
                          </div>
                          <Button
                            type="submit"
                            variant="outline"
                            className="gap-2 sm:min-w-[132px]"
                            disabled={isSearchingGeofence}
                          >
                            {isSearchingGeofence ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Buscando...
                              </>
                            ) : (
                              <>
                                <Search className="h-4 w-4" />
                                Buscar
                              </>
                            )}
                          </Button>
                        </div>

                        <p className="text-muted-foreground mt-2 text-xs">
                          A busca usa OpenStreetMap e prioriza resultados no Brasil.
                        </p>

                        {geofenceSearchError ? (
                          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            {geofenceSearchError}
                          </div>
                        ) : null}

                        {geofenceSearchResults.length > 0 ? (
                          <div className="mt-3 space-y-2">
                            {geofenceSearchResults.map((result) => {
                              const resultKey = `${result.lat}-${result.lng}-${result.displayName}`

                              return (
                                <button
                                  key={resultKey}
                                  type="button"
                                  onClick={() => handleSelectGeocodeResult(result)}
                                  className="w-full rounded-xl border border-slate-200 bg-background px-3 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50/60"
                                >
                                  <p className="text-foreground text-sm font-medium">{result.primaryText}</p>
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    {result.secondaryText}
                                  </p>
                                </button>
                              )
                            })}
                          </div>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                          >
                            <LocateFixed className="h-4 w-4" />
                            {isLocating ? 'Capturando...' : 'Usar localização atual'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleClearGeofencePoint}
                            disabled={!geofencePoint}
                          >
                            <X className="h-4 w-4" />
                            Limpar pin
                          </Button>
                        </div>
                      </form>

                      <GeofencePickerMap
                        point={geofencePoint}
                        radiusMeters={safeGeofenceRadius}
                        onPointChange={handleMapPinChange}
                      />

                      <p className="text-muted-foreground text-xs">
                        Clique em qualquer ponto do mapa ou arraste o pin para refinar a geofence.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <p className="text-foreground text-sm font-medium">Raio protegido</p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          Use presets rápidos e depois ajuste fino pelo slider.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {GEOFENCE_RADIUS_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleGeofenceRadiusChange(String(preset))}
                              className={cn(
                                'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                                safeGeofenceRadius === preset
                                  ? 'border-brand-300 bg-brand-50 text-brand-800'
                                  : 'border-slate-200 bg-background text-muted-foreground hover:border-brand-200 hover:text-foreground',
                              )}
                            >
                              {preset}m
                            </button>
                          ))}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_112px]">
                          <input
                            type="range"
                            min={MIN_GEOFENCE_RADIUS_METERS}
                            max={MAX_GEOFENCE_RADIUS_METERS}
                            step={10}
                            value={safeGeofenceRadius}
                            onChange={(event) => handleGeofenceRadiusChange(event.target.value)}
                            className="accent-brand-700 h-10 w-full cursor-pointer"
                          />
                          <Input
                            type="number"
                            min={MIN_GEOFENCE_RADIUS_METERS}
                            max={MAX_GEOFENCE_RADIUS_METERS}
                            value={form.geofenceRadiusMeters}
                            onChange={(event) => handleGeofenceRadiusChange(event.target.value)}
                            onBlur={() => {
                              if (!form.geofenceRadiusMeters.trim()) {
                                setForm((prev) => ({
                                  ...prev,
                                  geofenceRadiusMeters: String(DEFAULT_GEOFENCE_RADIUS_METERS),
                                }))
                              }
                            }}
                            placeholder={String(DEFAULT_GEOFENCE_RADIUS_METERS)}
                          />
                        </div>

                        <p className="text-muted-foreground mt-2 text-xs">
                          Entre {MIN_GEOFENCE_RADIUS_METERS}m e {MAX_GEOFENCE_RADIUS_METERS}m para
                          equilibrar precisão e tolerância operacional.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-background p-4 shadow-sm">
                        <p className="text-foreground text-sm font-medium">Resumo do ponto</p>

                        <div className="mt-4 space-y-3">
                          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                            <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
                              Endereço resolvido
                            </p>
                            <p className="text-foreground mt-1 text-sm">
                              {!geofencePoint
                                ? 'Selecione um ponto no mapa para ver o endereço.'
                                : isResolvingGeofenceAddress
                                  ? 'Resolvendo endereço...'
                                  : resolvedGeofenceAddress?.displayName || 'Endereço ainda não disponível'}
                            </p>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                              <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
                                Coordenadas
                              </p>
                              <p className="text-foreground mt-1 text-sm">
                                {geofencePoint
                                  ? `${geofencePoint.lat.toFixed(6)}, ${geofencePoint.lng.toFixed(6)}`
                                  : 'Nenhum ponto selecionado'}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                              <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
                                Cobertura estimada
                              </p>
                              <p className="text-foreground mt-1 text-sm">
                                {formatGeofenceCoverage(safeGeofenceRadius)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="schedule-geofence-label">Etiqueta interna</Label>
                            <Input
                              id="schedule-geofence-label"
                              value={form.geofenceLabel}
                              onChange={(event) =>
                                setForm((prev) => ({ ...prev, geofenceLabel: event.target.value }))
                              }
                              placeholder="UTI Adulto · Bloco A"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <label className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-foreground text-sm font-medium">
                              Permitir check-in automático
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              Quando o médico autorizar no app, o sistema registra check-in ao entrar
                              na geofence durante a janela do plantão.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={form.geofenceAutoCheckInEnabled}
                            onChange={(event) =>
                              setForm((prev) => ({
                                ...prev,
                                geofenceAutoCheckInEnabled: event.target.checked,
                              }))
                            }
                            className="border-border text-brand-600 focus:ring-brand-500 mt-0.5 h-4 w-4 rounded"
                          />
                        </label>
                      </div>
                    </div>
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
                              {locationNameById.get(extraShift.locationId) || 'Local não informado'}
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
                    {form.openEnded
                      ? 'Sem data final'
                      : form.endDate
                        ? formatDate(form.endDate)
                        : '—'}
                  </p>
                </div>

                <div className="border-border bg-background rounded-xl border p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Cobertura e equipe
                  </p>
                  <p className="text-foreground mt-2 text-sm">
                    {form.coverageMode === 'FULL_DAY' ? 'Cobertura 24h' : 'Período específico'} ·{' '}
                    {formatCoverageWindow(form.coverageMode, form.coverageStartTime, form.coverageEndTime)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Plantão: {form.shiftDurationHours || '—'}h · {form.professionalsPerShift || '—'} médico(s)
                    / plantão
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {Number.isInteger(shiftsPerCoveragePeriod) &&
                    Number.isFinite(doctorsPerCoveragePeriod)
                      ? form.coverageMode === 'FULL_DAY'
                        ? `${shiftsPerDay.toFixed(0)} plantão(ões)/dia · ${doctorsPerDay.toFixed(0)} médico(s)/dia`
                        : `${shiftsPerCoveragePeriod.toFixed(0)} plantão(ões) no período · ${doctorsPerCoveragePeriod.toFixed(0)} médico(s) no período`
                      : 'Combinação inválida para divisão de plantões'}
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
                    Valor por plantão
                  </p>
                  <p className="text-foreground mt-2 font-medium">
                    {Number.isFinite(parsedShiftValue) && parsedShiftValue > 0
                      ? formatCurrency(parsedShiftValue)
                      : 'Não informado'}
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

                <div className="border-border bg-background rounded-xl border p-4">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide">
                    Geofence / auto check-in
                  </p>
                  <p className="text-foreground mt-2 text-sm">
                    {geofencePoint
                      ? `${geofenceDisplayLabel} · raio ${safeGeofenceRadius}m`
                      : 'Não configurada'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {geofencePoint
                      ? geofenceAddressLabel || `${form.geofenceLat}, ${form.geofenceLng}`
                      : 'Auto check-in ainda não configurado'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Auto check-in: {form.geofenceAutoCheckInEnabled ? 'habilitado' : 'desabilitado'}
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
