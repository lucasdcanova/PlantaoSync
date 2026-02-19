import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateOrganizationDto } from './dto/update-organization.dto'
import { PLAN_PRICES } from '../../../packages/shared/src/constants/plans'
import { BillingCycle } from '@prisma/client'

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrganization(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    })

    if (!org) {
      throw new NotFoundException('Organização não encontrada')
    }

    return org
  }

  async updateOrganization(organizationId: string, dto: UpdateOrganizationDto) {
    await this.getOrganization(organizationId)

    return this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.cnpj !== undefined && { cnpj: dto.cnpj }),
      },
      include: { subscription: true },
    })
  }

  async getStats(organizationId: string) {
    await this.getOrganization(organizationId)

    const [
      totalProfessionals,
      totalLocations,
      activeSchedules,
      pendingConfirmations,
      subscription,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          organizationId,
          role: 'PROFESSIONAL',
          isActive: true,
          deletedAt: null,
        },
      }),
      this.prisma.location.count({
        where: { organizationId, isActive: true },
      }),
      this.prisma.schedule.count({
        where: { organizationId, status: 'PUBLISHED' },
      }),
      this.prisma.shiftConfirmation.count({
        where: {
          status: 'PENDING',
          shift: {
            schedule: { organizationId },
          },
        },
      }),
      this.prisma.subscription.findUnique({
        where: { organizationId },
      }),
    ])

    let monthlyCost = 0
    if (subscription) {
      const planPrices = PLAN_PRICES[subscription.plan]
      const cycleKey = subscription.billingCycle as BillingCycle
      monthlyCost = planPrices[cycleKey] ?? planPrices['MONTHLY']
    }

    return {
      totalProfessionals,
      totalLocations,
      activeSchedules,
      pendingConfirmations,
      monthlyCost,
      subscription,
    }
  }
}
