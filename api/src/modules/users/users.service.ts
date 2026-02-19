import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { InviteUserDto } from './dto/invite-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserFiltersDto } from './dto/user-filters.dto'
import { PLAN_LIMITS } from '../../../packages/shared/src/constants/plans'
import { Plan, UserRole } from '@prisma/client'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, filters: UserFiltersDto) {
    const { role, isActive, search, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where = {
      organizationId,
      deletedAt: null,
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { specialty: { contains: search, mode: 'insensitive' as const } },
          { crm: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          organizationId: true,
          name: true,
          email: true,
          role: true,
          crm: true,
          specialty: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
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
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        role: true,
        crm: true,
        specialty: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return user
  }

  async invite(organizationId: string, dto: InviteUserDto) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    })

    if (!org) throw new NotFoundException('Organização não encontrada')

    const plan = (org.subscription?.plan ?? 'BASIC') as Plan
    await this.checkPlanLimit(organizationId, plan)

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    })

    if (existing) {
      throw new ConflictException('E-mail já cadastrado')
    }

    const user = await this.prisma.user.create({
      data: {
        organizationId,
        name: dto.name,
        email: dto.email.toLowerCase(),
        role: dto.role,
        specialty: dto.specialty,
        crm: dto.crm,
        phone: dto.phone,
        passwordHash: null,
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        role: true,
        crm: true,
        specialty: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // TODO: enviar e-mail de convite com link para definir senha

    return user
  }

  async update(id: string, organizationId: string, dto: UpdateUserDto) {
    await this.findOne(id, organizationId)

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email.toLowerCase(), NOT: { id } },
      })
      if (existing) throw new ConflictException('E-mail já em uso')
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email.toLowerCase() }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.specialty !== undefined && { specialty: dto.specialty }),
        ...(dto.crm !== undefined && { crm: dto.crm }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        role: true,
        crm: true,
        specialty: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async deactivate(id: string, organizationId: string) {
    await this.findOne(id, organizationId)

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        deletedAt: true,
      },
    })
  }

  async checkPlanLimit(organizationId: string, plan: Plan) {
    const limits = PLAN_LIMITS[plan]
    const currentCount = await this.prisma.user.count({
      where: {
        organizationId,
        role: UserRole.PROFESSIONAL,
        isActive: true,
        deletedAt: null,
      },
    })

    if (currentCount >= limits.professionals) {
      throw new ForbiddenException(
        `Limite de profissionais atingido para o plano ${plan} (máximo: ${limits.professionals})`,
      )
    }
  }
}
