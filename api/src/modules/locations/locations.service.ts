import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { PLAN_LIMITS } from '../../../packages/shared/src/constants/plans'
import { Plan } from '@prisma/client'

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.location.findMany({
      where: { organizationId, isActive: true },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string, organizationId: string) {
    const location = await this.prisma.location.findFirst({
      where: { id, organizationId, isActive: true },
    })

    if (!location) {
      throw new NotFoundException('Local não encontrado')
    }

    return location
  }

  async create(organizationId: string, dto: CreateLocationDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    })

    if (!org) throw new NotFoundException('Organização não encontrada')

    const plan = (org.subscription?.plan ?? 'BASIC') as Plan
    await this.checkPlanLimit(organizationId, plan)

    return this.prisma.location.create({
      data: {
        organizationId,
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
      },
    })
  }

  async update(id: string, organizationId: string, dto: UpdateLocationDto) {
    await this.findOne(id, organizationId)

    return this.prisma.location.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.zipCode !== undefined && { zipCode: dto.zipCode }),
      },
    })
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId)

    return this.prisma.location.update({
      where: { id },
      data: { isActive: false },
    })
  }

  private async checkPlanLimit(organizationId: string, plan: Plan) {
    const limits = PLAN_LIMITS[plan]
    const currentCount = await this.prisma.location.count({
      where: { organizationId, isActive: true },
    })

    if (currentCount >= limits.locations) {
      throw new ForbiddenException(
        `Limite de locais atingido para o plano ${plan} (máximo: ${limits.locations})`,
      )
    }
  }
}
