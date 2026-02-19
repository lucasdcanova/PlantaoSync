import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PrismaService } from '../../prisma/prisma.service'

interface ConfirmationFilters {
  status?: string
  page?: number
  limit?: number
}

@Injectable()
export class ConfirmationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findByShift(shiftId: string, organizationId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId, schedule: { organizationId } },
    })

    if (!shift) {
      throw new NotFoundException('Plantão não encontrado')
    }

    return this.prisma.shiftConfirmation.findMany({
      where: { shiftId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            crm: true,
            specialty: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async findByUser(userId: string, organizationId: string, filters: ConfirmationFilters = {}) {
    const { status, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where = {
      userId,
      shift: { schedule: { organizationId } },
      ...(status !== undefined && { status: status as any }),
    }

    const [data, total] = await Promise.all([
      this.prisma.shiftConfirmation.findMany({
        where,
        include: {
          shift: {
            include: { location: true, schedule: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.shiftConfirmation.count({ where }),
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

  async confirm(shiftId: string, userId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId },
      include: {
        schedule: true,
        _count: {
          select: {
            confirmations: { where: { status: 'ACCEPTED' } },
          },
        },
      },
    })

    if (!shift) {
      throw new NotFoundException('Plantão não encontrado')
    }

    if (shift.schedule.status !== 'PUBLISHED') {
      throw new BadRequestException('Plantão não está disponível para confirmação')
    }

    const acceptedCount = shift._count.confirmations
    if (acceptedCount >= shift.requiredCount) {
      throw new BadRequestException('Plantão já está com vagas preenchidas')
    }

    // Verificar conflito de horário para o mesmo usuário
    const existingConflict = await this.prisma.shiftConfirmation.findFirst({
      where: {
        userId,
        status: 'ACCEPTED',
        shift: {
          date: shift.date,
          schedule: { status: 'PUBLISHED' },
          AND: [
            { startTime: { lt: shift.endTime } },
            { endTime: { gt: shift.startTime } },
          ],
        },
      },
    })

    if (existingConflict) {
      throw new ConflictException('Você já possui um plantão confirmado neste horário')
    }

    const existing = await this.prisma.shiftConfirmation.findUnique({
      where: { shiftId_userId: { shiftId, userId } },
    })

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new ConflictException('Você já confirmou este plantão')
      }
      // Reativar confirmação cancelada
      const updated = await this.prisma.shiftConfirmation.update({
        where: { id: existing.id },
        data: {
          status: 'ACCEPTED',
          confirmedAt: new Date(),
          cancelledAt: null,
        },
        include: {
          shift: { include: { location: true, schedule: true } },
        },
      })

      await this.createFinancialRecord(updated.id, userId, shift.valuePerShift)
      this.emitConfirmedEvent(shift, userId, updated.id)
      return updated
    }

    const confirmation = await this.prisma.shiftConfirmation.create({
      data: {
        shiftId,
        userId,
        status: 'ACCEPTED',
        confirmedAt: new Date(),
      },
      include: {
        shift: { include: { location: true, schedule: true } },
      },
    })

    await this.createFinancialRecord(confirmation.id, userId, shift.valuePerShift)
    this.emitConfirmedEvent(shift, userId, confirmation.id)

    return confirmation
  }

  async cancel(confirmationId: string, userId: string) {
    const confirmation = await this.prisma.shiftConfirmation.findFirst({
      where: { id: confirmationId, userId },
      include: { shift: { include: { schedule: true } } },
    })

    if (!confirmation) {
      throw new NotFoundException('Confirmação não encontrada')
    }

    if (confirmation.status === 'CANCELLED') {
      throw new BadRequestException('Confirmação já está cancelada')
    }

    if (confirmation.shift.schedule.status === 'CLOSED' || confirmation.shift.schedule.status === 'ARCHIVED') {
      throw new ForbiddenException('Não é possível cancelar confirmações de escalas fechadas')
    }

    const updated = await this.prisma.shiftConfirmation.update({
      where: { id: confirmationId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        shift: { include: { location: true, schedule: true } },
      },
    })

    // Cancelar registro financeiro associado
    await this.prisma.financialRecord.updateMany({
      where: { confirmationId, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    })

    return updated
  }

  async getAvailableShifts(userId: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId },
      select: { specialty: true },
    })

    if (!user) throw new NotFoundException('Usuário não encontrado')

    // Buscar IDs de plantões já confirmados pelo usuário
    const confirmedShiftIds = await this.prisma.shiftConfirmation
      .findMany({
        where: { userId, status: 'ACCEPTED' },
        select: { shiftId: true },
      })
      .then((list) => list.map((c) => c.shiftId))

    const shifts = await this.prisma.shift.findMany({
      where: {
        id: { notIn: confirmedShiftIds.length > 0 ? confirmedShiftIds : ['__none__'] },
        schedule: {
          organizationId,
          status: 'PUBLISHED',
        },
        date: { gte: new Date() },
      },
      include: {
        location: true,
        schedule: true,
        _count: {
          select: {
            confirmations: { where: { status: 'ACCEPTED' } },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    // Filtrar plantões que ainda têm vagas
    const available = shifts.filter(
      (shift) => shift._count.confirmations < shift.requiredCount,
    )

    return available
  }

  private async createFinancialRecord(
    confirmationId: string,
    userId: string,
    amount: any,
  ) {
    const existing = await this.prisma.financialRecord.findUnique({
      where: { confirmationId },
    })

    if (!existing) {
      await this.prisma.financialRecord.create({
        data: {
          userId,
          confirmationId,
          amount,
          status: 'PENDING',
        },
      })
    }
  }

  private emitConfirmedEvent(
    shift: { id: string; schedule: { organizationId: string } },
    userId: string,
    confirmationId: string,
  ) {
    this.eventEmitter.emit('shift.confirmed', {
      shiftId: shift.id,
      organizationId: shift.schedule.organizationId,
      userId,
      confirmationId,
    })
  }
}
