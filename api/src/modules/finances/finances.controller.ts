import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { RolesGuard } from '../../shared/guards/roles.guard'
import { Roles } from '../../shared/decorators/roles.decorator'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import { FinancesService } from './finances.service'
import type { User } from '@prisma/client'

@ApiTags('Financeiro')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get('my-summary')
  @ApiOperation({ summary: 'Resumo financeiro do profissional autenticado' })
  getSummary(@CurrentUser() user: User) {
    return this.financesService.getSummary(user.id, user.organizationId)
  }

  @Get('my-records')
  @ApiOperation({ summary: 'Histórico financeiro do profissional autenticado' })
  getMyRecords(@CurrentUser() user: User, @Query('status') status?: string) {
    return this.financesService.findByUser(user.id, user.organizationId, status as any)
  }

  @Get()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Todos os registros financeiros da organização (gestores)' })
  getAll(@CurrentUser() user: User) {
    return this.financesService.findByOrganization(user.organizationId)
  }

  @Patch(':id/paid')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Marcar pagamento como realizado' })
  markAsPaid(@Param('id') id: string, @CurrentUser() user: User) {
    return this.financesService.markAsPaid(id, user.organizationId)
  }
}
