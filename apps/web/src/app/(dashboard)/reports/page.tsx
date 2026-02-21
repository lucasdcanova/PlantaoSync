'use client'

import { useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CircleDollarSign,
  Download,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Header } from '@/components/layout/header'
import { PageTransition } from '@/components/shared/page-transition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDoctorDemoStore } from '@/store/doctor-demo.store'
import { useLocationsStore } from '@/store/locations.store'
import { useProfessionalsStore } from '@/store/professionals.store'
import { useSchedulesStore } from '@/store/schedules.store'
import { createShiftValueResolver, getShiftDurationHours } from '@/lib/shift-pricing'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

type ReportWindow = 'month' | 'quarter'
type AnalysisPerspective = 'setores' | 'especialidades'

type ProfileStatus = 'ATIVO' | 'REMOVIDO' | 'SEM_VINCULO'

type MonthlyReportRow = {
  professionalId: string
  name: string
  phone: string
  specialty: string
  profileStatus: ProfileStatus
  daysWorked: number
  totalHours: number
  shiftsCount: number
  managerGrantedShifts: number
  swappedGrantedShifts: number
  grantedShiftsSwapRate: number
  totalAmount: number
  averageShiftValue: number
  lastShiftAt: string
}

type MonthlyReportAccumulator = {
  key: string
  linkedProfessionalId?: string
  name: string
  phone: string
  specialty: string
  profileStatus: ProfileStatus
  daysWorked: Set<string>
  totalHours: number
  shiftsCount: number
  totalAmount: number
  swapShiftIds: Set<string>
  lastShiftAt: string
}

type FinancialSeriesPoint = {
  label: string
  confirmed: number
  open: number
  projected: number
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function isDateInRange(dateString: string, startKey: string, endKey: string) {
  const key = dateString.slice(0, 10)
  return key >= startKey && key <= endKey
}

function daysSince(dateString: string) {
  if (!dateString) return Number.POSITIVE_INFINITY
  const from = new Date(`${dateString}T00:00:00`).getTime()
  if (Number.isNaN(from)) return Number.POSITIVE_INFINITY
  return Math.floor((Date.now() - from) / (1000 * 60 * 60 * 24))
}

function calculateSwapRate(swappedGrantedShifts: number, managerGrantedShifts: number) {
  if (!Number.isFinite(managerGrantedShifts) || managerGrantedShifts <= 0) {
    return 0
  }

  return Math.round((swappedGrantedShifts / managerGrantedShifts) * 100)
}

function buildReportCsv(rows: MonthlyReportRow[]) {
  const headers = [
    'Nome',
    'Telefone',
    'Especialidade',
    'Status no hospital',
    'Dias de plantao',
    'Horas realizadas',
    'Numero de plantoes',
    'Valor medio por plantao (R$)',
    'Total financeiro (R$)',
    'Plantoes cedidos pelo gestor',
    'Plantoes trocados',
    'Taxa de troca sobre cedidos (%)',
    'Ultimo plantao',
  ]

  const lines = rows.map((row) =>
    [
      row.name,
      row.phone,
      row.specialty,
      row.profileStatus,
      String(row.daysWorked),
      String(row.totalHours),
      String(row.shiftsCount),
      (row.averageShiftValue / 100).toFixed(2),
      (row.totalAmount / 100).toFixed(2),
      String(row.managerGrantedShifts),
      String(row.swappedGrantedShifts),
      String(row.grantedShiftsSwapRate),
      row.lastShiftAt,
    ]
      .map((value) => `"${value.replaceAll('"', '""')}"`)
      .join(','),
  )

  return [headers.join(','), ...lines].join('\n')
}

function profileStatusClassName(profileStatus: ProfileStatus) {
  if (profileStatus === 'ATIVO') {
    return 'border-green-200 bg-green-50 text-green-700'
  }

  if (profileStatus === 'REMOVIDO') {
    return 'border-zinc-200 bg-zinc-100 text-zinc-700'
  }

  return 'border-amber-200 bg-amber-50 text-amber-700'
}

function formatLastShift(lastShiftAt: string) {
  if (!lastShiftAt) return 'Sem registro'
  return formatDate(lastShiftAt)
}

export default function ReportsPage() {
  const schedules = useSchedulesStore((state) => state.schedules)
  const locations = useLocationsStore((state) => state.locations)
  const professionals = useProfessionalsStore((state) => state.professionals)

  const myShifts = useDoctorDemoStore((state) => state.myShifts)
  const availableShifts = useDoctorDemoStore((state) => state.availableShifts)
  const swapRequests = useDoctorDemoStore((state) => state.swapRequests)
  const sectors = useDoctorDemoStore((state) => state.sectors)

  const [reportWindow, setReportWindow] = useState<ReportWindow>('month')
  const [analysisPerspective, setAnalysisPerspective] = useState<AnalysisPerspective>('setores')
  const [activeSwapSlice, setActiveSwapSlice] = useState(0)
  const [doctorSearch, setDoctorSearch] = useState('')

  const dateRange = useMemo(() => {
    const now = new Date()
    const end = toDateKey(now)

    if (reportWindow === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        startKey: toDateKey(monthStart),
        endKey: end,
        label: now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      }
    }

    const quarterStart = new Date(now)
    quarterStart.setDate(quarterStart.getDate() - 89)

    return {
      startKey: toDateKey(quarterStart),
      endKey: end,
      label: 'ultimos 90 dias',
    }
  }, [reportWindow])

  const resolveShiftValue = useMemo(
    () => createShiftValueResolver(schedules, locations),
    [locations, schedules],
  )

  const shiftsInRange = useMemo(
    () =>
      myShifts.filter(
        (shift) =>
          shift.status !== 'CANCELADO' &&
          isDateInRange(shift.date, dateRange.startKey, dateRange.endKey),
      ),
    [dateRange.endKey, dateRange.startKey, myShifts],
  )

  const opportunitiesInRange = useMemo(
    () =>
      availableShifts.filter((shift) =>
        isDateInRange(shift.date, dateRange.startKey, dateRange.endKey),
      ),
    [availableShifts, dateRange.endKey, dateRange.startKey],
  )

  const swapRequestsInRange = useMemo(
    () =>
      swapRequests.filter((request) => {
        const referenceDate = request.shiftDate?.slice(0, 10) || request.createdAt.slice(0, 10)
        return isDateInRange(referenceDate, dateRange.startKey, dateRange.endKey)
      }),
    [dateRange.endKey, dateRange.startKey, swapRequests],
  )

  const schedulesInRange = useMemo(
    () =>
      schedules.filter(
        (schedule) =>
          schedule.endDate.slice(0, 10) >= dateRange.startKey &&
          schedule.startDate <= dateRange.endKey,
      ),
    [dateRange.endKey, dateRange.startKey, schedules],
  )

  const monthlyRows = useMemo(() => {
    const professionalsById = new Map(
      professionals.map((professional) => [professional.id, professional]),
    )
    const professionalsByUserId = new Map(
      professionals.map((professional) => [professional.userId, professional]),
    )

    const rowsMap = new Map<string, MonthlyReportAccumulator>()
    const shiftRowKeyById = new Map<string, string>()

    shiftsInRange.forEach((shift) => {
      const linkedProfessional =
        professionalsById.get(shift.professionalId) ??
        professionalsByUserId.get(shift.professionalUserId)

      const rowKey =
        linkedProfessional?.id || shift.professionalId || shift.professionalUserId || shift.id

      const current = rowsMap.get(rowKey) ?? {
        key: rowKey,
        linkedProfessionalId: linkedProfessional?.id,
        name: linkedProfessional?.name ?? 'Profissional sem cadastro',
        phone: linkedProfessional?.phone ?? 'Nao informado',
        specialty: linkedProfessional?.specialty ?? shift.specialty,
        profileStatus: linkedProfessional?.hospitalStatus ?? 'SEM_VINCULO',
        daysWorked: new Set<string>(),
        totalHours: 0,
        shiftsCount: 0,
        totalAmount: 0,
        swapShiftIds: new Set<string>(),
        lastShiftAt: linkedProfessional?.lastShiftAt ?? '',
      }

      const shiftValue = resolveShiftValue({
        date: shift.date,
        sectorName: shift.sectorName,
        fallbackValue: shift.value,
      })

      current.daysWorked.add(shift.date.slice(0, 10))
      current.totalHours += getShiftDurationHours(shift.date, shift.startTime, shift.endTime)
      current.shiftsCount += 1
      current.totalAmount += shiftValue
      if (shift.status === 'TROCA_SOLICITADA') {
        current.swapShiftIds.add(shift.id)
      }
      if (!current.lastShiftAt || shift.date > current.lastShiftAt) {
        current.lastShiftAt = shift.date
      }

      rowsMap.set(rowKey, current)
      shiftRowKeyById.set(shift.id, rowKey)
    })

    swapRequestsInRange.forEach((request) => {
      if (request.direction !== 'saida' || request.status === 'RECUSADA') return

      const rowKey = shiftRowKeyById.get(request.shiftId)
      if (!rowKey) return

      const current = rowsMap.get(rowKey)
      if (!current) return

      current.swapShiftIds.add(request.shiftId)
      rowsMap.set(rowKey, current)
    })

    const rows = Array.from(rowsMap.values()).map((row) => {
      const swappedGrantedShifts = Math.min(row.swapShiftIds.size, row.shiftsCount)
      const managerGrantedShifts = row.shiftsCount

      return {
        professionalId: row.linkedProfessionalId ?? row.key,
        name: row.name,
        phone: row.phone,
        specialty: row.specialty,
        profileStatus: row.profileStatus,
        daysWorked: row.daysWorked.size,
        totalHours: Number(row.totalHours.toFixed(1)),
        shiftsCount: row.shiftsCount,
        managerGrantedShifts,
        swappedGrantedShifts,
        grantedShiftsSwapRate: calculateSwapRate(swappedGrantedShifts, managerGrantedShifts),
        totalAmount: Math.round(row.totalAmount),
        averageShiftValue: row.shiftsCount > 0 ? Math.round(row.totalAmount / row.shiftsCount) : 0,
        lastShiftAt: row.lastShiftAt,
      } satisfies MonthlyReportRow
    })

    const trackedProfessionalIds = new Set(rows.map((row) => row.professionalId).filter(Boolean))

    professionals.forEach((professional) => {
      if (trackedProfessionalIds.has(professional.id)) return

      rows.push({
        professionalId: professional.id,
        name: professional.name,
        phone: professional.phone ?? 'Nao informado',
        specialty: professional.specialty,
        profileStatus: professional.hospitalStatus,
        daysWorked: 0,
        totalHours: 0,
        shiftsCount: 0,
        managerGrantedShifts: 0,
        swappedGrantedShifts: 0,
        grantedShiftsSwapRate: 0,
        totalAmount: 0,
        averageShiftValue: 0,
        lastShiftAt: professional.lastShiftAt ?? '',
      })
    })

    return rows.sort(
      (a, b) =>
        b.totalAmount - a.totalAmount ||
        b.shiftsCount - a.shiftsCount ||
        a.name.localeCompare(b.name, 'pt-BR'),
    )
  }, [professionals, resolveShiftValue, shiftsInRange, swapRequestsInRange])

  const filteredRows = useMemo(() => {
    const term = doctorSearch.trim().toLowerCase()
    if (!term) return monthlyRows

    return monthlyRows.filter((row) =>
      [row.name, row.phone, row.specialty, row.profileStatus]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [doctorSearch, monthlyRows])

  const totals = useMemo(() => {
    const totalHours = monthlyRows.reduce((sum, row) => sum + row.totalHours, 0)
    const totalShifts = monthlyRows.reduce((sum, row) => sum + row.shiftsCount, 0)
    const confirmedAmount = monthlyRows.reduce((sum, row) => sum + row.totalAmount, 0)

    const openAmount = opportunitiesInRange.reduce((sum, shift) => {
      const value = resolveShiftValue({
        date: shift.date,
        sectorName: shift.sectorName,
        fallbackValue: shift.value,
      })
      return sum + value * Math.max(shift.slotsLeft, 1)
    }, 0)

    const openSlots = opportunitiesInRange.reduce((sum, shift) => sum + shift.slotsLeft, 0)
    const projectedAmount = confirmedAmount + openAmount
    const averageShiftValue = totalShifts > 0 ? Math.round(confirmedAmount / totalShifts) : 0

    const activeProfessionals = professionals.filter(
      (professional) => professional.hospitalStatus === 'ATIVO',
    ).length
    const professionalsWithCoverage = monthlyRows.filter((row) => row.shiftsCount > 0).length

    const activeLocations = locations.filter((location) => location.isActive)
    const averageOccupancy =
      activeLocations.length > 0
        ? Math.round(
            activeLocations.reduce((sum, location) => sum + location.occupancyRate, 0) /
              activeLocations.length,
          )
        : 0

    const pendingByLocation = activeLocations.reduce(
      (sum, location) => sum + location.pendingShifts,
      0,
    )

    const extraShiftDemand = schedulesInRange.reduce(
      (sum, schedule) =>
        sum +
        schedule.extraShifts
          .filter((extraShift) =>
            isDateInRange(extraShift.date, dateRange.startKey, dateRange.endKey),
          )
          .reduce((extraSum, extraShift) => extraSum + extraShift.requiredCount, 0),
      0,
    )

    const swapsPending = swapRequestsInRange.filter((item) => item.status === 'PENDENTE').length
    const swapsAccepted = swapRequestsInRange.filter((item) => item.status === 'ACEITA').length
    const swapsRejected = swapRequestsInRange.filter((item) => item.status === 'RECUSADA').length
    const swapPressure = calculateSwapRate(swapsPending, swapRequestsInRange.length)

    return {
      totalHours: Number(totalHours.toFixed(1)),
      totalShifts,
      confirmedAmount,
      openAmount,
      projectedAmount,
      averageShiftValue,
      activeProfessionals,
      professionalsWithCoverage,
      averageOccupancy,
      pendingByLocation,
      openSlots,
      extraShiftDemand,
      swapsPending,
      swapsAccepted,
      swapsRejected,
      swapPressure,
    }
  }, [
    dateRange.endKey,
    dateRange.startKey,
    locations,
    monthlyRows,
    opportunitiesInRange,
    professionals,
    resolveShiftValue,
    schedulesInRange,
    swapRequestsInRange,
  ])

  const financialSeries = useMemo<FinancialSeriesPoint[]>(() => {
    if (reportWindow === 'month') {
      const buckets = Array.from({ length: 5 }, (_, index) => ({
        label: `S${index + 1}`,
        confirmed: 0,
        open: 0,
        projected: 0,
      }))

      shiftsInRange.forEach((shift) => {
        const day = Number(shift.date.slice(8, 10))
        const weekIndex = Math.min(4, Math.max(0, Math.ceil(day / 7) - 1))
        buckets[weekIndex].confirmed += resolveShiftValue({
          date: shift.date,
          sectorName: shift.sectorName,
          fallbackValue: shift.value,
        })
      })

      opportunitiesInRange.forEach((shift) => {
        const day = Number(shift.date.slice(8, 10))
        const weekIndex = Math.min(4, Math.max(0, Math.ceil(day / 7) - 1))
        buckets[weekIndex].open +=
          resolveShiftValue({
            date: shift.date,
            sectorName: shift.sectorName,
            fallbackValue: shift.value,
          }) * Math.max(shift.slotsLeft, 1)
      })

      return buckets.map((bucket) => ({
        ...bucket,
        projected: bucket.confirmed + bucket.open,
      }))
    }

    const now = new Date()
    const monthBuckets = Array.from({ length: 3 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (2 - index), 1)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date
        .toLocaleDateString('pt-BR', { month: 'short' })
        .replace('.', '')
        .toUpperCase()

      return {
        key,
        label,
        confirmed: 0,
        open: 0,
        projected: 0,
      }
    })

    const bucketByKey = new Map(monthBuckets.map((bucket) => [bucket.key, bucket]))

    shiftsInRange.forEach((shift) => {
      const key = shift.date.slice(0, 7)
      const bucket = bucketByKey.get(key)
      if (!bucket) return
      bucket.confirmed += resolveShiftValue({
        date: shift.date,
        sectorName: shift.sectorName,
        fallbackValue: shift.value,
      })
    })

    opportunitiesInRange.forEach((shift) => {
      const key = shift.date.slice(0, 7)
      const bucket = bucketByKey.get(key)
      if (!bucket) return
      bucket.open +=
        resolveShiftValue({
          date: shift.date,
          sectorName: shift.sectorName,
          fallbackValue: shift.value,
        }) * Math.max(shift.slotsLeft, 1)
    })

    return monthBuckets.map((bucket) => ({
      label: bucket.label,
      confirmed: bucket.confirmed,
      open: bucket.open,
      projected: bucket.confirmed + bucket.open,
    }))
  }, [opportunitiesInRange, reportWindow, resolveShiftValue, shiftsInRange])

  const sectorSeries = useMemo(() => {
    const openBySector = new Map<string, number>()

    opportunitiesInRange.forEach((shift) => {
      const key = normalizeName(shift.sectorName)
      openBySector.set(key, (openBySector.get(key) ?? 0) + shift.slotsLeft)
    })

    const activeLocations = locations.filter((location) => location.isActive)
    if (activeLocations.length > 0) {
      return activeLocations
        .map((location) => {
          const pendingFromOpportunities = openBySector.get(normalizeName(location.name)) ?? 0
          return {
            name: location.name,
            coverage: location.occupancyRate,
            pending: location.pendingShifts + pendingFromOpportunities,
            monthlyCost: location.monthlyCost,
            professionals: location.activeProfessionals,
          }
        })
        .sort((a, b) => b.pending - a.pending)
    }

    return sectors.map((sector) => ({
      name: sector.name,
      coverage: 0,
      pending: sector.openShifts,
      monthlyCost: 0,
      professionals: 0,
    }))
  }, [locations, opportunitiesInRange, sectors])

  const specialtySeries = useMemo(() => {
    const grouped = new Map<
      string,
      { name: string; completed: number; acceptanceSum: number; members: number }
    >()

    professionals.forEach((professional) => {
      const current = grouped.get(professional.specialty)
      if (current) {
        current.completed += professional.completedShifts
        current.acceptanceSum += professional.acceptanceRate
        current.members += 1
        return
      }

      grouped.set(professional.specialty, {
        name: professional.specialty,
        completed: professional.completedShifts,
        acceptanceSum: professional.acceptanceRate,
        members: 1,
      })
    })

    if (grouped.size === 0) {
      const byShiftSpecialty = new Map<string, number>()

      shiftsInRange.forEach((shift) => {
        byShiftSpecialty.set(shift.specialty, (byShiftSpecialty.get(shift.specialty) ?? 0) + 1)
      })

      return Array.from(byShiftSpecialty.entries()).map(([name, completed]) => ({
        name,
        completed,
        acceptance: 0,
      }))
    }

    return Array.from(grouped.values())
      .map((item) => ({
        name: item.name,
        completed: item.completed,
        acceptance: Math.round(item.acceptanceSum / item.members),
      }))
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 6)
  }, [professionals, shiftsInRange])

  const swapSeries = useMemo(
    () => [
      {
        name: 'Pendentes',
        value: totals.swapsPending,
        color: '#f59e0b',
      },
      {
        name: 'Aceitas',
        value: totals.swapsAccepted,
        color: '#22c55e',
      },
      {
        name: 'Recusadas',
        value: totals.swapsRejected,
        color: '#ef4444',
      },
    ],
    [totals.swapsAccepted, totals.swapsPending, totals.swapsRejected],
  )

  const activeSwapStatus = swapSeries[activeSwapSlice] ?? swapSeries[0]

  const doctorsWithHighSwapRate = useMemo(
    () =>
      monthlyRows.filter((row) => row.managerGrantedShifts > 0 && row.grantedShiftsSwapRate > 70),
    [monthlyRows],
  )

  const inactiveOverThreeMonths = useMemo(
    () => monthlyRows.filter((row) => daysSince(row.lastShiftAt) > 90),
    [monthlyRows],
  )

  const schedulesRequiringSwapApproval = useMemo(
    () => schedules.filter((schedule) => schedule.requireSwapApproval),
    [schedules],
  )

  const highlights = useMemo(() => {
    const topDoctor = monthlyRows.find((row) => row.shiftsCount > 0)
    const highestPendingSector = [...sectorSeries].sort((a, b) => b.pending - a.pending)[0]
    const bestSpecialty = [...specialtySeries].sort((a, b) => b.acceptance - a.acceptance)[0]
    const lowestCoverageSector = [...sectorSeries].sort((a, b) => a.coverage - b.coverage)[0]

    const insights: string[] = []

    if (topDoctor) {
      insights.push(
        `${topDoctor.name} lidera o custo assistencial no periodo com ${formatCurrency(topDoctor.totalAmount)}.`,
      )
    }

    if (highestPendingSector) {
      insights.push(
        `${highestPendingSector.name} concentra ${highestPendingSector.pending} pendencias abertas e exige prioridade de cobertura.`,
      )
    }

    if (bestSpecialty) {
      insights.push(
        `${bestSpecialty.name} apresenta melhor aderencia media (${bestSpecialty.acceptance}%) entre as especialidades ativas.`,
      )
    }

    if (lowestCoverageSector) {
      insights.push(
        `${lowestCoverageSector.name} esta com menor ocupacao (${lowestCoverageSector.coverage}%) e deve receber reforco imediato.`,
      )
    }

    if (insights.length === 0) {
      insights.push(
        'Sem dados consolidados suficientes para gerar recomendacoes automaticas no periodo.',
      )
    }

    return insights.slice(0, 4)
  }, [monthlyRows, sectorSeries, specialtySeries])

  const handleDownloadMonthlyReport = () => {
    const csv = buildReportCsv(monthlyRows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `relatorio-final-plantoes-${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()

    window.URL.revokeObjectURL(url)
  }

  const analysisData = analysisPerspective === 'setores' ? sectorSeries : specialtySeries

  return (
    <>
      <Header
        title="Relatórios do Gestor"
        subtitle="Analytics operacional em dados reais do aplicativo"
      />

      <PageTransition>
        <div className="space-y-6 p-4 sm:p-6">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="border-brand-200/60 from-brand-50 via-card to-brand-100/50 shadow-brand relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 sm:p-6"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/45 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-blue-200/30 blur-3xl" />

            <div className="relative grid gap-6 xl:grid-cols-[1.05fr_1fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-brand-300 bg-brand-100 text-brand-800">
                    Relatorio vivo
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    {reportWindow === 'month' ? 'Mes atual' : 'Ultimos 90 dias'}
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    Fontes conectadas: escalas, medicos, setores e trocas
                  </Badge>
                </div>

                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                    Janela analisada: {dateRange.label}
                  </p>
                  <h2 className="font-display text-foreground mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                    {formatCurrency(totals.confirmedAmount)}
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Custo confirmado com potencial de {formatCurrency(totals.projectedAmount)} no
                    mesmo periodo.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <article className="border-border/70 bg-card/80 rounded-xl border p-3">
                    <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
                      Plantoes
                    </p>
                    <p className="text-foreground mt-1 text-sm font-semibold">
                      {totals.totalShifts}
                    </p>
                    <p className="text-muted-foreground text-xs">{totals.totalHours}h realizadas</p>
                  </article>
                  <article className="border-border/70 bg-card/80 rounded-xl border p-3">
                    <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
                      Cobertura media
                    </p>
                    <p className="text-foreground mt-1 text-sm font-semibold">
                      {totals.averageOccupancy}%
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {totals.pendingByLocation} pendencias em setores
                    </p>
                  </article>
                  <article className="border-border/70 bg-card/80 rounded-xl border p-3">
                    <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
                      Pressao de trocas
                    </p>
                    <p className="text-foreground mt-1 text-sm font-semibold">
                      {totals.swapPressure}%
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {totals.swapsPending} pendentes agora
                    </p>
                  </article>
                </div>
              </div>

              <div className="border-border/60 bg-card/85 rounded-xl border p-4 backdrop-blur">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-foreground text-xs font-medium">Fluxo financeiro</p>
                  <div className="border-border bg-background inline-flex rounded-full border p-1">
                    <button
                      type="button"
                      onClick={() => setReportWindow('month')}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                        reportWindow === 'month'
                          ? 'bg-brand-500 shadow-brand text-white'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      Mes
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportWindow('quarter')}
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                        reportWindow === 'quarter'
                          ? 'bg-brand-500 shadow-brand text-white'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      90d
                    </button>
                  </div>
                </div>

                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialSeries}>
                      <defs>
                        <linearGradient id="reportsProjected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.38} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="reportsConfirmed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.22} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '10px',
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="projected"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#reportsProjected)"
                        name="Projetado"
                      />
                      <Area
                        type="monotone"
                        dataKey="confirmed"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#reportsConfirmed)"
                        name="Confirmado"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: 'Custo confirmado',
                value: formatCurrency(totals.confirmedAmount),
                context: `${totals.totalShifts} plantoes no periodo`,
                icon: CircleDollarSign,
              },
              {
                label: 'Projecao total',
                value: formatCurrency(totals.projectedAmount),
                context: `${formatCurrency(totals.openAmount)} em aberto`,
                icon: Activity,
              },
              {
                label: 'Medicos cobertos',
                value: `${totals.professionalsWithCoverage}/${totals.activeProfessionals}`,
                context: `${totals.openSlots} vagas abertas`,
                icon: Users,
              },
              {
                label: 'Trocas pendentes',
                value: String(totals.swapsPending),
                context: `${totals.swapPressure}% de pressao`,
                icon: AlertTriangle,
              },
            ].map((metric) => (
              <article
                key={metric.label}
                className="card-base group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,23,42,0.14)]"
              >
                <div className="bg-brand-200/30 absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl transition-transform duration-500 group-hover:scale-110" />
                <div className="relative">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      {metric.label}
                    </p>
                    <metric.icon className="text-brand-600 h-4 w-4" />
                  </div>
                  <p className="font-display text-foreground text-2xl font-bold">{metric.value}</p>
                  <p className="text-muted-foreground mt-1 text-xs">{metric.context}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-5">
            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 280, damping: 26 }}
              className="card-base p-5 xl:col-span-3"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-foreground text-base font-semibold">
                    {analysisPerspective === 'setores'
                      ? 'Mapa de cobertura por setor'
                      : 'Pulso por especialidade medica'}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {analysisPerspective === 'setores'
                      ? 'Cobertura, pendencias e capacidade ativa por setor.'
                      : 'Volume de entregas e aderencia media por especialidade.'}
                  </p>
                </div>

                <div className="border-border bg-background inline-flex rounded-full border p-1">
                  <button
                    type="button"
                    onClick={() => setAnalysisPerspective('setores')}
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                      analysisPerspective === 'setores'
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Setores
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalysisPerspective('especialidades')}
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-medium transition-all',
                      analysisPerspective === 'especialidades'
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Especialidades
                  </button>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisData} barGap={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={52}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'Custo mensal') return formatCurrency(value)
                        if (name.includes('%')) return `${value}%`
                        return value
                      }}
                    />

                    {analysisPerspective === 'setores' ? (
                      <>
                        <Bar
                          dataKey="coverage"
                          name="Cobertura %"
                          fill="#0ea5e9"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar
                          dataKey="pending"
                          name="Pendencias"
                          fill="#f59e0b"
                          radius={[8, 8, 0, 0]}
                        />
                      </>
                    ) : (
                      <>
                        <Bar
                          dataKey="completed"
                          name="Plantoes concluidos"
                          fill="#10b981"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar
                          dataKey="acceptance"
                          name="Aderencia %"
                          fill="#3b82f6"
                          radius={[8, 8, 0, 0]}
                        />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 26 }}
              className="card-base p-5 xl:col-span-2"
            >
              <div className="mb-5 flex items-center justify-between gap-2">
                <h3 className="font-display text-foreground text-base font-semibold">
                  Estado das trocas
                </h3>
                <Badge variant="outline" className="text-[11px]">
                  Interativo
                </Badge>
              </div>

              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      formatter={(value: number) => `${value} solicitacoes`}
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid rgba(148, 163, 184, 0.3)',
                        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
                      }}
                    />
                    <Pie
                      data={swapSeries}
                      dataKey="value"
                      innerRadius={54}
                      outerRadius={90}
                      paddingAngle={3}
                      onMouseEnter={(_, index) => setActiveSwapSlice(index)}
                    >
                      {swapSeries.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          opacity={activeSwapSlice === index ? 1 : 0.68}
                          stroke={activeSwapSlice === index ? '#ffffff' : 'transparent'}
                          strokeWidth={activeSwapSlice === index ? 2 : 0}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="border-border/70 bg-muted/25 rounded-xl border p-3">
                <p className="text-muted-foreground text-[11px] uppercase tracking-wide">
                  Destaque atual
                </p>
                <p className="text-foreground mt-1 text-sm font-semibold">
                  {activeSwapStatus?.name}
                </p>
                <p className="text-muted-foreground text-xs">
                  {activeSwapStatus?.value} casos no status selecionado.
                </p>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground inline-flex items-center gap-1.5">
                    <CalendarDays className="text-brand-600 h-3.5 w-3.5" />
                    Demanda de turnos extras
                  </span>
                  <span className="text-foreground font-semibold">{totals.extraShiftDemand}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground inline-flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5 text-emerald-600" />
                    Valor medio por plantao
                  </span>
                  <span className="text-foreground font-semibold">
                    {formatCurrency(totals.averageShiftValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                    Escalas com trava
                  </span>
                  <span className="text-foreground font-semibold">
                    {schedulesRequiringSwapApproval.length}
                  </span>
                </div>
              </div>
            </motion.article>
          </section>

          <section className="card-base p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-foreground text-lg font-bold">
                  Relatorio final por medico
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Dados consolidados de escala, trocas e custos integrados em tempo real.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    value={doctorSearch}
                    onChange={(event) => setDoctorSearch(event.target.value)}
                    placeholder="Buscar medico, telefone ou especialidade"
                    className="pl-9 sm:w-80"
                  />
                </div>

                <Button type="button" className="gap-2" onClick={handleDownloadMonthlyReport}>
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                      Medico
                    </th>
                    <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                      Especialidade
                    </th>
                    <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                      Status
                    </th>
                    <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                      Dias/Horas
                    </th>
                    <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                      Plantoes
                    </th>
                    <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                      Valor medio
                    </th>
                    <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                      Total financeiro
                    </th>
                    <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                      Trocas
                    </th>
                    <th className="border-border bg-background text-muted-foreground border-b px-3 py-2 text-left text-[11px] uppercase tracking-wide">
                      Ultimo plantao
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.professionalId}>
                      <td className="border-border/70 border-b px-3 py-2">
                        <p className="text-foreground text-sm font-medium">{row.name}</p>
                        <p className="text-muted-foreground text-xs">{row.phone}</p>
                      </td>
                      <td className="border-border/70 text-foreground border-b px-3 py-2 text-sm">
                        {row.specialty}
                      </td>
                      <td className="border-border/70 border-b px-3 py-2 text-sm">
                        <Badge className={profileStatusClassName(row.profileStatus)}>
                          {row.profileStatus === 'SEM_VINCULO' ? 'SEM VINCULO' : row.profileStatus}
                        </Badge>
                      </td>
                      <td className="border-border/70 text-foreground border-b px-3 py-2 text-sm">
                        {row.daysWorked}d / {row.totalHours}h
                      </td>
                      <td className="border-border/70 text-foreground border-b px-3 py-2 text-sm">
                        {row.shiftsCount}
                      </td>
                      <td className="border-border/70 text-foreground border-b px-3 py-2 text-sm">
                        {formatCurrency(row.averageShiftValue)}
                      </td>
                      <td className="border-border/70 text-foreground border-b px-3 py-2 text-sm">
                        {formatCurrency(row.totalAmount)}
                      </td>
                      <td className="border-border/70 border-b px-3 py-2 text-sm">
                        <Badge
                          className={
                            row.grantedShiftsSwapRate > 70
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-green-200 bg-green-50 text-green-700'
                          }
                        >
                          {row.grantedShiftsSwapRate}% ({row.swappedGrantedShifts}/
                          {row.managerGrantedShifts})
                        </Badge>
                      </td>
                      <td className="border-border/70 text-foreground border-b px-3 py-2 text-sm">
                        {formatLastShift(row.lastShiftAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRows.length === 0 && (
                <p className="text-muted-foreground bg-background mt-3 rounded-xl border border-dashed px-4 py-3 text-sm">
                  Nenhum profissional encontrado para os filtros aplicados.
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <article className="card-base p-5">
              <h3 className="font-display text-foreground text-base font-semibold">
                Alerta de trocas acima de 70%
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Profissionais com risco de instabilidade por excesso de trocas.
              </p>

              <div className="mt-4 space-y-2">
                {doctorsWithHighSwapRate.length > 0 ? (
                  doctorsWithHighSwapRate.map((doctor) => (
                    <div
                      key={doctor.professionalId}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-amber-800">{doctor.name}</p>
                      <p className="text-xs text-amber-700">
                        {doctor.grantedShiftsSwapRate}% dos plantoes cedidos (
                        {doctor.swappedGrantedShifts}/{doctor.managerGrantedShifts})
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    Nenhum medico com troca acima de 70% nesta janela.
                  </p>
                )}
              </div>
            </article>

            <article className="card-base p-5">
              <h3 className="font-display text-foreground text-base font-semibold">
                Inatividade {'>'} 3 meses
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Apoio para higienizacao de cadastros e previsao de cobertura.
              </p>

              <div className="mt-4 space-y-2">
                {inactiveOverThreeMonths.length > 0 ? (
                  inactiveOverThreeMonths.map((doctor) => (
                    <div
                      key={doctor.professionalId}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-red-800">{doctor.name}</p>
                      <p className="text-xs text-red-700">
                        Ultimo plantao: {formatLastShift(doctor.lastShiftAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                    Todos os profissionais com atividade recente.
                  </p>
                )}
              </div>
            </article>

            <article className="card-base p-5">
              <h3 className="font-display text-foreground text-base font-semibold">
                Trocas com trava da gestao
              </h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Escalas sob confirmacao obrigatoria do gestor.
              </p>

              <div className="mt-4 space-y-2">
                {schedulesRequiringSwapApproval.length > 0 ? (
                  schedulesRequiringSwapApproval.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="border-brand-200 bg-brand-50 rounded-lg border px-3 py-2"
                    >
                      <p className="text-brand-800 text-sm font-medium">{schedule.title}</p>
                      <p className="text-brand-700 text-xs">
                        {schedule.location?.name ?? 'Local nao informado'} -{' '}
                        {formatDate(schedule.startDate)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    Nenhuma escala com trava de troca ativa.
                  </p>
                )}
              </div>
            </article>
          </section>

          <section className="card-base p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-foreground text-lg font-bold">
                  Insights operacionais automatizados
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Diagnosticos gerados a partir dos dados reais consolidados nesta pagina.
                </p>
              </div>
              <Badge variant="outline" className="text-[11px]">
                Atualizacao continua
              </Badge>
            </div>

            <div className="mt-5 grid gap-3">
              {highlights.map((highlight, index) => (
                <article
                  key={`${highlight}-${index}`}
                  className="border-border bg-background flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
                >
                  <span className="border-brand-200 bg-brand-50 text-brand-700 mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border">
                    {index + 1}
                  </span>
                  <p className="text-foreground">{highlight}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </PageTransition>
    </>
  )
}
