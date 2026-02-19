import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PLAN_LIMITS } from '../../shared-constants'
import type { Plan } from '@prisma/client'

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscription(organizationId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { organizationId },
    })
    if (!sub) throw new NotFoundException('Assinatura não encontrada')
    return sub
  }

  async getLimits(organizationId: string) {
    const sub = await this.getSubscription(organizationId)
    const limits = PLAN_LIMITS[sub.plan]
    const [profCount, locCount, managerCount] = await Promise.all([
      this.prisma.user.count({ where: { organizationId, role: 'PROFESSIONAL', isActive: true } }),
      this.prisma.location.count({ where: { organizationId, isActive: true } }),
      this.prisma.user.count({ where: { organizationId, role: { in: ['ADMIN', 'MANAGER'] }, isActive: true } }),
    ])

    return {
      plan: sub.plan,
      status: sub.status,
      trialEndsAt: sub.trialEndsAt,
      limits,
      usage: {
        professionals: profCount,
        locations:     locCount,
        managers:      managerCount,
      },
    }
  }

  async checkLimit(organizationId: string, resource: 'professionals' | 'locations' | 'managers') {
    const { limits, usage } = await this.getLimits(organizationId)
    if (usage[resource] >= limits[resource]) {
      throw new ForbiddenException({
        message: `Limite de ${resource} atingido para o plano atual`,
        code: 'PLAN_LIMIT_EXCEEDED',
        details: {
          current: usage[resource],
          max: limits[resource],
        },
      })
    }
  }

  async changePlan(organizationId: string, plan: Plan) {
    return this.prisma.subscription.update({
      where: { organizationId },
      data: { plan },
    })
  }
}
