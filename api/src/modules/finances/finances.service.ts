import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { FinancialStatus } from '@prisma/client'

@Injectable()
export class FinancesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string, organizationId: string, filters?: { status?: FinancialStatus }) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, organizationId } })
    if (!user) throw new NotFoundException('Usuário não encontrado')

    return this.prisma.financialRecord.findMany({
      where: {
        userId,
        ...(filters?.status ? { status: filters.status } : {}),
      },
      include: {
        confirmation: {
          include: { shift: { include: { location: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getSummary(userId: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, organizationId } })
    if (!user) throw new NotFoundException('Usuário não encontrado')

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [total, monthly, pending, paid] = await Promise.all([
      this.prisma.financialRecord.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      this.prisma.financialRecord.aggregate({
        where: { userId, createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.financialRecord.aggregate({
        where: { userId, status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.financialRecord.aggregate({
        where: { userId, status: 'PAID' },
        _sum: { amount: true },
      }),
    ])

    return {
      total:   Number(total._sum.amount ?? 0),
      monthly: Number(monthly._sum.amount ?? 0),
      pending: Number(pending._sum.amount ?? 0),
      paid:    Number(paid._sum.amount ?? 0),
    }
  }

  async findByOrganization(organizationId: string) {
    return this.prisma.financialRecord.findMany({
      where: { user: { organizationId } },
      include: {
        user: { select: { id: true, name: true, specialty: true } },
        confirmation: {
          include: { shift: { include: { location: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async markAsPaid(id: string, organizationId: string) {
    const record = await this.prisma.financialRecord.findFirst({
      where: { id, user: { organizationId } },
    })
    if (!record) throw new NotFoundException('Registro financeiro não encontrado')

    return this.prisma.financialRecord.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
    })
  }
}
