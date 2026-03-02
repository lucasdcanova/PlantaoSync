import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { InviteUserDto } from './dto/invite-user.dto'
import { CreateInviteCodeDto } from './dto/create-invite-code.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserFiltersDto } from './dto/user-filters.dto'
import { PLAN_LIMITS } from '../../shared-constants'
import { Plan, ProfessionalInviteStatus, UserRole } from '@prisma/client'

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10)
}

function normalizeInviteSectorToken(sectorName: string) {
  const token = sectorName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 18)

  return token || 'GERAL'
}

function randomInviteToken(length = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''

  for (let i = 0; i < length; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }

  return result
}

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

  async listInviteCodes(organizationId: string) {
    await this.expirePastInviteCodes(organizationId)

    return this.prisma.professionalInvite.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        sectorName: true,
        issuedByName: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        usedByUserId: true,
        usedByEmail: true,
        createdAt: true,
      },
    })
  }

  async createInviteCode(organizationId: string, issuedByName: string, dto: CreateInviteCodeDto) {
    const normalizedSectorName = dto.sectorName.trim()
    const clampedDays = Number.isFinite(dto.expirationDays)
      ? Math.min(90, Math.max(1, Math.round(Number(dto.expirationDays))))
      : 14

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + clampedDays)

    const newInvite = await this.prisma.professionalInvite.create({
      data: {
        organizationId,
        code: await this.generateUniqueInviteCode(normalizedSectorName),
        sectorName: normalizedSectorName,
        issuedByName: issuedByName.trim() || 'Gestor',
        expiresAt: new Date(toDateOnly(expiresAt)),
      },
      select: {
        id: true,
        code: true,
        sectorName: true,
        issuedByName: true,
        status: true,
        expiresAt: true,
        usedAt: true,
        usedByUserId: true,
        usedByEmail: true,
        createdAt: true,
      },
    })

    return newInvite
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

  async reactivate(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, organizationId },
      select: { id: true },
    })
    if (!user) {
      throw new NotFoundException('Usuário não encontrado')
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
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

  private async expirePastInviteCodes(organizationId: string) {
    const today = new Date(toDateOnly(new Date()))
    await this.prisma.professionalInvite.updateMany({
      where: {
        organizationId,
        status: ProfessionalInviteStatus.ACTIVE,
        expiresAt: { lt: today },
      },
      data: { status: ProfessionalInviteStatus.EXPIRED },
    })
  }

  private async generateUniqueInviteCode(sectorName: string) {
    const year = new Date().getFullYear()
    const sectorToken = normalizeInviteSectorToken(sectorName)

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const candidate = `SG-${sectorToken}-${year}-${randomInviteToken(4)}`
      const existing = await this.prisma.professionalInvite.findUnique({
        where: { code: candidate },
        select: { id: true },
      })
      if (!existing) return candidate
    }

    return `SG-${sectorToken}-${year}-${Date.now().toString(36).toUpperCase().slice(-5)}`
  }
}
