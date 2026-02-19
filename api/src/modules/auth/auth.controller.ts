import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { Public } from '../../shared/decorators/public.decorator'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import type { User } from '@prisma/client'

const REFRESH_COOKIE = 'refresh_token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
  path: '/',
}

@ApiTags('Auth')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Autenticar usuário' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto, req.ip, req.headers['user-agent'])
    res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS)
    return { user: result.user, accessToken: result.accessToken }
  }

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Cadastrar nova organização e administrador' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto)
    res.cookie(REFRESH_COOKIE, result.refreshToken, COOKIE_OPTIONS)
    return { user: result.user, accessToken: result.accessToken }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token via refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Refresh token não encontrado' })
    }
    const tokens = await this.authService.refreshTokens(token, req.ip)
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS)
    return { accessToken: tokens.accessToken }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Encerrar sessão' })
  async logout(@CurrentUser() user: User, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string
    await this.authService.logout(user.id, token)
    res.clearCookie(REFRESH_COOKIE, { path: '/' })
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  async me(@CurrentUser() user: User) {
    return this.authService.me(user.id)
  }
}
