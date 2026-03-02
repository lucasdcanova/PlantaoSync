import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ScheduleCoverageMode } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { ScheduleFiltersDto } from './dto/schedule-filters.dto'

const OPEN_ENDED_SCHEDULE_END_DATE = '9999-12-31'
const DEFAULT_SHIFT_VALUE = 140_000

function parseTimeToMinutes(value: string) {
  const [hourPart, minutePart] = value.split(':')
  const hours = Number(hourPart)
  const minutes = Number(minutePart)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return Number.NaN
  return hours * 60 + minutes
}

function getCoverageDurationHours(
  coverageMode: ScheduleCoverageMode,
  coverageStartTime?: string | null,
  coverageEndTime?: string | null,
) {
  if (coverageMode === ScheduleCoverageMode.FULL_DAY) return 24
  if (!coverageStartTime || !coverageEndTime) return Number.NaN

  const startMinutes = parseTimeToMinutes(coverageStartTime)
  const endMinutes = parseTimeToMinutes(coverageEndTime)
  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes)) return Number.NaN
  if (startMinutes === endMinutes) return Number.NaN

  let durationMinutes = endMinutes - startMinutes
  if (durationMinutes < 0) durationMinutes += 24 * 60
  return durationMinutes / 60
}

function validateCoverageRules(input: {
  coverageMode: ScheduleCoverageMode
  coverageStartTime?: string | null
  coverageEndTime?: string | null
  shiftDurationHours?: number | null
}) {
  const coverageDurationHours = getCoverageDurationHours(
    input.coverageMode,
    input.coverageStartTime,
    input.coverageEndTime,
  )

  if (!Number.isFinite(coverageDurationHours) || coverageDurationHours <= 0) {
    throw new BadRequestException('Período de cobertura inválido.')
  }

  if (input.shiftDurationHours === null || input.shiftDurationHours === undefined) return

  if (input.shiftDurationHours > coverageDurationHours) {
    throw new BadRequestException(
      'A duração do plantão não pode ser maior que a janela de cobertura.',
    )
  }

  const shiftsPerPeriod = coverageDurationHours / input.shiftDurationHours
  if (!Number.isInteger(shiftsPerPeriod)) {
    throw new BadRequestException(
      'A duração do plantão deve dividir exatamente a cobertura da escala.',
    )
  }
}

@Injectable()
export class SchedulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(organizationId: string, filters: ScheduleFiltersDto) {
    const { status, locationId, startDate, endDate, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where = {
      organizationId,
      ...(status !== undefined && { status }),
      ...(locationId !== undefined && { locationId }),
      ...(startDate !== undefined && { startDate: { gte: new Date(startDate) } }),
      ...(endDate !== undefined && { endDate: { lte: new Date(endDate) } }),
    }

    const [data, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        include: {
          location: true,
          _count: { select: { shifts: true } },
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.schedule.count({ where }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string, organizationId: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, organizationId },
      include: {
        location: true,
        shifts: {
          include: {
            _count: { select: { confirmations: true } },
          },
          orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        },
      },
    })

    if (!schedule) {
      throw new NotFoundException('Escala não encontrada')
    }

    return schedule
  }

  async create(organizationId: string, userId: string, dto: CreateScheduleDto) {
    const location = await this.prisma.location.findFirst({
      where: { id: dto.locationId, organizationId, isActive: true },
    })

    if (!location) {
      throw new NotFoundException('Local não encontrado ou inativo')
    }

    const endDate = dto.endDate ?? OPEN_ENDED_SCHEDULE_END_DATE

    if (new Date(dto.startDate) > new Date(endDate)) {
      throw new BadRequestException('Data de início não pode ser posterior à data de fim')
    }

    const coverageMode = dto.coverageMode ?? ScheduleCoverageMode.FULL_DAY
    const coverageStartTime =
      coverageMode === ScheduleCoverageMode.CUSTOM_WINDOW ? dto.coverageStartTime : null
    const coverageEndTime =
      coverageMode === ScheduleCoverageMode.CUSTOM_WINDOW ? dto.coverageEndTime : null

    validateCoverageRules({
      coverageMode,
      coverageStartTime,
      coverageEndTime,
      shiftDurationHours: dto.shiftDurationHours ?? null,
    })

    return this.prisma.schedule.create({
      data: {
        organizationId,
        locationId: dto.locationId,
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(endDate),
        coverageMode,
        coverageStartTime,
        coverageEndTime,
        shiftDurationHours: dto.shiftDurationHours,
        professionalsPerShift: dto.professionalsPerShift,
        shiftValue: dto.shiftValue ?? DEFAULT_SHIFT_VALUE,
        requireSwapApproval: dto.requireSwapApproval ?? true,
        geofenceLat: dto.geofenceLat,
        geofenceLng: dto.geofenceLng,
        geofenceRadiusMeters: dto.geofenceRadiusMeters,
        geofenceAutoCheckInEnabled: dto.geofenceAutoCheckInEnabled ?? false,
        geofenceLabel: dto.geofenceLabel,
        status: 'DRAFT',
      },
      include: { location: true },
    })
  }

  async update(id: string, organizationId: string, dto: UpdateScheduleDto) {
    const schedule = await this.findOne(id, organizationId)

    if (schedule.status === 'CLOSED' || schedule.status === 'ARCHIVED') {
      throw new BadRequestException('Não é possível editar uma escala fechada ou arquivada')
    }

    if (dto.locationId) {
      const location = await this.prisma.location.findFirst({
        where: { id: dto.locationId, organizationId, isActive: true },
      })
      if (!location) throw new NotFoundException('Local não encontrado ou inativo')
    }

    const nextStartDate = dto.startDate ?? schedule.startDate.toISOString().slice(0, 10)
    const nextEndDate = dto.endDate ?? schedule.endDate.toISOString().slice(0, 10)
    if (new Date(nextStartDate) > new Date(nextEndDate)) {
      throw new BadRequestException('Data de início não pode ser posterior à data de fim')
    }

    const nextCoverageMode = dto.coverageMode ?? schedule.coverageMode
    const nextCoverageStartTime =
      (dto.coverageMode ?? schedule.coverageMode) === ScheduleCoverageMode.CUSTOM_WINDOW
        ? (dto.coverageStartTime ?? schedule.coverageStartTime)
        : null
    const nextCoverageEndTime =
      (dto.coverageMode ?? schedule.coverageMode) === ScheduleCoverageMode.CUSTOM_WINDOW
        ? (dto.coverageEndTime ?? schedule.coverageEndTime)
        : null
    const nextShiftDurationHours = dto.shiftDurationHours ?? schedule.shiftDurationHours

    validateCoverageRules({
      coverageMode: nextCoverageMode,
      coverageStartTime: nextCoverageStartTime,
      coverageEndTime: nextCoverageEndTime,
      shiftDurationHours: nextShiftDurationHours,
    })

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        ...(dto.locationId !== undefined && { locationId: dto.locationId }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.coverageMode !== undefined && { coverageMode: dto.coverageMode }),
        ...(dto.coverageMode === ScheduleCoverageMode.FULL_DAY && {
          coverageStartTime: null,
          coverageEndTime: null,
        }),
        ...(dto.coverageStartTime !== undefined && { coverageStartTime: dto.coverageStartTime }),
        ...(dto.coverageEndTime !== undefined && { coverageEndTime: dto.coverageEndTime }),
        ...(dto.shiftDurationHours !== undefined && { shiftDurationHours: dto.shiftDurationHours }),
        ...(dto.professionalsPerShift !== undefined && {
          professionalsPerShift: dto.professionalsPerShift,
        }),
        ...(dto.shiftValue !== undefined && { shiftValue: dto.shiftValue }),
        ...(dto.requireSwapApproval !== undefined && { requireSwapApproval: dto.requireSwapApproval }),
        ...(dto.geofenceLat !== undefined && { geofenceLat: dto.geofenceLat }),
        ...(dto.geofenceLng !== undefined && { geofenceLng: dto.geofenceLng }),
        ...(dto.geofenceRadiusMeters !== undefined && {
          geofenceRadiusMeters: dto.geofenceRadiusMeters,
        }),
        ...(dto.geofenceAutoCheckInEnabled !== undefined && {
          geofenceAutoCheckInEnabled: dto.geofenceAutoCheckInEnabled,
        }),
        ...(dto.geofenceLabel !== undefined && { geofenceLabel: dto.geofenceLabel }),
      },
      include: { location: true },
    })

    this.eventEmitter.emit('schedule.updated', { scheduleId: id, organizationId })

    return updated
  }

  async publish(id: string, organizationId: string) {
    const schedule = await this.findOne(id, organizationId)

    if (schedule.status !== 'DRAFT') {
      throw new BadRequestException('Apenas escalas em rascunho podem ser publicadas')
    }

    const published = await this.prisma.schedule.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: { location: true, shifts: true },
    })

    this.eventEmitter.emit('schedule.published', {
      scheduleId: id,
      organizationId,
      schedule: published,
    })

    return published
  }

  async close(id: string, organizationId: string) {
    const schedule = await this.findOne(id, organizationId)

    if (schedule.status !== 'PUBLISHED') {
      throw new BadRequestException('Apenas escalas publicadas podem ser fechadas')
    }

    return this.prisma.schedule.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
      include: { location: true },
    })
  }

  async archive(id: string, organizationId: string) {
    const schedule = await this.findOne(id, organizationId)

    if (schedule.status !== 'CLOSED') {
      throw new BadRequestException('Apenas escalas fechadas podem ser arquivadas')
    }

    return this.prisma.schedule.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: { location: true },
    })
  }

  async remove(id: string, organizationId: string) {
    const schedule = await this.findOne(id, organizationId)

    if (schedule.status !== 'DRAFT') {
      throw new BadRequestException('Apenas escalas em rascunho podem ser excluídas')
    }

    await this.prisma.schedule.delete({ where: { id } })

    return { message: 'Escala excluída com sucesso' }
  }

  async duplicate(id: string, organizationId: string) {
    const original = await this.findOne(id, organizationId)

    const duplicated = await this.prisma.$transaction(async (tx) => {
      const newSchedule = await tx.schedule.create({
        data: {
          organizationId,
          locationId: original.locationId,
          title: `${original.title} (Cópia)`,
          description: original.description,
          startDate: original.startDate,
          endDate: original.endDate,
          coverageMode: original.coverageMode,
          coverageStartTime: original.coverageStartTime,
          coverageEndTime: original.coverageEndTime,
          shiftDurationHours: original.shiftDurationHours,
          professionalsPerShift: original.professionalsPerShift,
          shiftValue: original.shiftValue,
          requireSwapApproval: original.requireSwapApproval,
          geofenceLat: original.geofenceLat,
          geofenceLng: original.geofenceLng,
          geofenceRadiusMeters: original.geofenceRadiusMeters,
          geofenceAutoCheckInEnabled: original.geofenceAutoCheckInEnabled,
          geofenceLabel: original.geofenceLabel,
          status: 'DRAFT',
        },
      })

      if (original.shifts && original.shifts.length > 0) {
        await tx.shift.createMany({
          data: original.shifts.map((shift) => ({
            scheduleId: newSchedule.id,
            locationId: shift.locationId,
            date: shift.date,
            startTime: shift.startTime,
            endTime: shift.endTime,
            specialty: shift.specialty,
            requiredCount: shift.requiredCount,
            valuePerShift: shift.valuePerShift,
            notes: shift.notes,
          })),
        })
      }

      return tx.schedule.findUnique({
        where: { id: newSchedule.id },
        include: { location: true, shifts: true },
      })
    })

    return duplicated
  }
}
