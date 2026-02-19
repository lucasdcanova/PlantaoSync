import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { TRIAL_DAYS, addDays } from '../../shared-constants'
import { getJwtAccessSecret, getJwtRefreshSecret } from '../../config/jwt.config'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { organization: { include: { subscription: true } } },
    })

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('E-mail ou senha incorretos')
    }

    if (!user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Conta desativada. Entre em contato com o suporte.')
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordValid) {
      throw new UnauthorizedException('E-mail ou senha incorretos')
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const tokens = await this.generateTokens(user.id, user.email, user.organizationId, user.role)
    await this.saveRefreshToken(user.id, tokens.refreshToken, ipAddress, userAgent)

    const { passwordHash, twoFactorSecret, ...safeUser } = user
    return { user: safeUser, ...tokens }
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    })
    if (existingUser) {
      throw new ConflictException('E-mail já cadastrado')
    }

    const slug =
      dto.organizationSlug ||
      dto.organizationName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)

    const existingOrg = await this.prisma.organization.findUnique({ where: { slug } })
    if (existingOrg) {
      throw new ConflictException('Slug da organização já utilizado')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const trialEndsAt = addDays(new Date(), TRIAL_DAYS)

    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.organizationName,
          slug,
          phone: dto.phone,
          subscription: {
            create: {
              plan: 'BASIC',
              billingCycle: 'MONTHLY',
              status: 'TRIAL',
              trialEndsAt,
            },
          },
        },
        include: { subscription: true },
      })

      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          name: dto.name,
          email: dto.email.toLowerCase(),
          passwordHash,
          phone: dto.phone,
          role: 'ADMIN',
        },
        include: { organization: { include: { subscription: true } } },
      })

      return { org, user }
    })

    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.user.organizationId,
      result.user.role,
    )
    await this.saveRefreshToken(result.user.id, tokens.refreshToken)

    const { passwordHash: _, twoFactorSecret: __, ...safeUser } = result.user
    return { user: safeUser, ...tokens }
  }

  async refreshTokens(token: string, ipAddress?: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado')
    }

    if (!stored.user.isActive) {
      throw new UnauthorizedException('Conta desativada')
    }

    // Rotate: revogar o atual e emitir novo
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    })

    const tokens = await this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.organizationId,
      stored.user.role,
    )
    await this.saveRefreshToken(stored.user.id, tokens.refreshToken, ipAddress)

    return tokens
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, token: refreshToken },
        data: { revokedAt: new Date() },
      })
    } else {
      // Revogar todos os tokens do usuário
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      })
    }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: { include: { subscription: true } } },
    })
    if (!user) throw new UnauthorizedException('Usuário não encontrado')
    const { passwordHash, twoFactorSecret, ...safeUser } = user
    return safeUser
  }

  private async generateTokens(
    userId: string,
    email: string,
    organizationId: string,
    role: string,
  ) {
    const payload = { sub: userId, email, organizationId, role }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: getJwtAccessSecret(this.config),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(
        { sub: userId, jti: uuidv4() },
        {
          secret: getJwtRefreshSecret(this.config),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
        },
      ),
    ])

    return { accessToken, refreshToken }
  }

  private async saveRefreshToken(
    userId: string,
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const expiresAt = addDays(new Date(), 30)
    await this.prisma.refreshToken.create({
      data: { userId, token, expiresAt, ipAddress, userAgent },
    })
  }
}
