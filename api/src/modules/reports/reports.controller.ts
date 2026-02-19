import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { RolesGuard } from '../../shared/guards/roles.guard'
import { Roles } from '../../shared/decorators/roles.decorator'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import { ReportsService } from './reports.service'
import type { User } from '@prisma/client'

@ApiTags('Relatórios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MANAGER')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('occupancy')
  @ApiOperation({ summary: 'Relatório de ocupação de vagas' })
  getOccupancy(@CurrentUser() user: User, @Query('month') month?: string) {
    return this.reportsService.getOccupancyReport(
      user.organizationId,
      month ? new Date(month) : undefined,
    )
  }

  @Get('hours')
  @ApiOperation({ summary: 'Relatório de horas por profissional' })
  getHours(@CurrentUser() user: User, @Query('month') month?: string) {
    return this.reportsService.getHoursReport(
      user.organizationId,
      month ? new Date(month) : undefined,
    )
  }

  @Get('costs')
  @ApiOperation({ summary: 'Relatório de custos dos últimos 6 meses' })
  getCosts(@CurrentUser() user: User) {
    return this.reportsService.getCostReport(user.organizationId)
  }
}
