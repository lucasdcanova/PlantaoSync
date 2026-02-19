import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { TenantsService } from './tenants.service'
import { UpdateOrganizationDto } from './dto/update-organization.dto'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import type { User } from '@prisma/client'

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna a organização do usuário autenticado' })
  async getMyOrganization(@CurrentUser() user: User) {
    return this.tenantsService.getOrganization(user.organizationId)
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza dados da organização' })
  async updateMyOrganization(
    @CurrentUser() user: User,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.tenantsService.updateOrganization(user.organizationId, dto)
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Retorna estatísticas do dashboard da organização' })
  async getStats(@CurrentUser() user: User) {
    return this.tenantsService.getStats(user.organizationId)
  }
}
