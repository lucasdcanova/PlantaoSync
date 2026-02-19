import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateShiftDto } from './dto/create-shift.dto'
import { CreateBulkShiftsDto } from './dto/create-bulk-shifts.dto'
import { UpdateShiftDto } from './dto/update-shift.dto'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySchedule(scheduleId: string, organizationId: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId },
    })

    if (!schedule) {
      throw new NotFoundException('Escala não encontrada')
    }

    return this.prisma.shift.findMany({
      where: { scheduleId },
      include: {
        location: true,
        _count: { select: { confirmations: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })
  }

  async findOne(id: string, organizationId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: {
        id,
        schedule: { organizationId },
      },
      include: {
        location: true,
        schedule: true,
        _count: { select: { confirmations: true } },
      },
    })

    if (!shift) {
      throw new NotFoundException('Plantão não encontrado')
    }

    return shift
  }

  async create(organizationId: string, dto: CreateShiftDto) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id: dto.scheduleId, organizationId },
    })

    if (!schedule) {
      throw new NotFoundException('Escala não encontrada')
    }

    if (schedule.status === 'CLOSED' || schedule.status === 'ARCHIVED') {
      throw new BadRequestException('Não é possível adicionar plantões a uma escala fechada ou arquivada')
    }

    const location = await this.prisma.location.findFirst({
      where: { id: dto.locationId, organizationId, isActive: true },
    })

    if (!location) {
      throw new NotFoundException('Local não encontrado ou inativo')
    }

    return this.prisma.shift.create({
      data: {
        scheduleId: dto.scheduleId,
        locationId: dto.locationId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        specialty: dto.specialty,
        requiredCount: dto.requiredCount ?? 1,
        valuePerShift: new Decimal(dto.valuePerShift),
        notes: dto.notes,
      },
      include: {
        location: true,
        _count: { select: { confirmations: true } },
      },
    })
  }

  async createBulk(organizationId: string, dto: CreateBulkShiftsDto) {
    if (dto.shifts.length === 0) {
      throw new BadRequestException('Informe ao menos um plantão')
    }

    const scheduleId = dto.shifts[0].scheduleId
    const schedule = await this.prisma.schedule.findFirst({
      where: { id: scheduleId, organizationId },
    })

    if (!schedule) {
      throw new NotFoundException('Escala não encontrada')
    }

    if (schedule.status === 'CLOSED' || schedule.status === 'ARCHIVED') {
      throw new BadRequestException('Não é possível adicionar plantões a uma escala fechada ou arquivada')
    }

    const locationIds = [...new Set(dto.shifts.map((s) => s.locationId))]
    const locations = await this.prisma.location.findMany({
      where: { id: { in: locationIds }, organizationId, isActive: true },
    })

    if (locations.length !== locationIds.length) {
      throw new NotFoundException('Um ou mais locais não encontrados ou inativos')
    }

    const created = await this.prisma.$transaction(
      dto.shifts.map((shiftDto) =>
        this.prisma.shift.create({
          data: {
            scheduleId: shiftDto.scheduleId,
            locationId: shiftDto.locationId,
            date: new Date(shiftDto.date),
            startTime: shiftDto.startTime,
            endTime: shiftDto.endTime,
            specialty: shiftDto.specialty,
            requiredCount: shiftDto.requiredCount ?? 1,
            valuePerShift: new Decimal(shiftDto.valuePerShift),
            notes: shiftDto.notes,
          },
        }),
      ),
    )

    return {
      count: created.length,
      shifts: created,
    }
  }

  async update(id: string, organizationId: string, dto: UpdateShiftDto) {
    const shift = await this.findOne(id, organizationId)

    if (shift.schedule.status === 'CLOSED' || shift.schedule.status === 'ARCHIVED') {
      throw new BadRequestException('Não é possível editar plantões de uma escala fechada ou arquivada')
    }

    if (dto.locationId) {
      const location = await this.prisma.location.findFirst({
        where: { id: dto.locationId, organizationId, isActive: true },
      })
      if (!location) throw new NotFoundException('Local não encontrado ou inativo')
    }

    return this.prisma.shift.update({
      where: { id },
      data: {
        ...(dto.locationId !== undefined && { locationId: dto.locationId }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
        ...(dto.specialty !== undefined && { specialty: dto.specialty }),
        ...(dto.requiredCount !== undefined && { requiredCount: dto.requiredCount }),
        ...(dto.valuePerShift !== undefined && { valuePerShift: new Decimal(dto.valuePerShift) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        location: true,
        _count: { select: { confirmations: true } },
      },
    })
  }

  async remove(id: string, organizationId: string) {
    const shift = await this.findOne(id, organizationId)

    if (shift.schedule.status === 'PUBLISHED') {
      const confirmationCount = shift._count.confirmations
      if (confirmationCount > 0) {
        throw new BadRequestException('Não é possível excluir um plantão com confirmações')
      }
    }

    if (shift.schedule.status === 'CLOSED' || shift.schedule.status === 'ARCHIVED') {
      throw new BadRequestException('Não é possível excluir plantões de uma escala fechada ou arquivada')
    }

    await this.prisma.shift.delete({ where: { id } })

    return { message: 'Plantão excluído com sucesso' }
  }
}
