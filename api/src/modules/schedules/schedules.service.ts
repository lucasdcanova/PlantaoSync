import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { ScheduleFiltersDto } from './dto/schedule-filters.dto'

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

    if (new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new BadRequestException('Data de início não pode ser posterior à data de fim')
    }

    return this.prisma.schedule.create({
      data: {
        organizationId,
        locationId: dto.locationId,
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
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

    if (dto.startDate && dto.endDate && new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new BadRequestException('Data de início não pode ser posterior à data de fim')
    }

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        ...(dto.locationId !== undefined && { locationId: dto.locationId }),
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
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
