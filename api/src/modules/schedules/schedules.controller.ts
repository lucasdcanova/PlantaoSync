import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'
import { SchedulesService } from './schedules.service'
import { CreateScheduleDto } from './dto/create-schedule.dto'
import { UpdateScheduleDto } from './dto/update-schedule.dto'
import { ScheduleFiltersDto } from './dto/schedule-filters.dto'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { RolesGuard } from '../../shared/guards/roles.guard'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import { Roles } from '../../shared/decorators/roles.decorator'
import type { User } from '@prisma/client'

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista escalas com filtros' })
  findAll(@CurrentUser() user: User, @Query() filters: ScheduleFiltersDto) {
    return this.schedulesService.findAll(user.organizationId, filters)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de uma escala com seus plantões' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.schedulesService.findOne(id, user.organizationId)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cria uma nova escala em rascunho' })
  create(@CurrentUser() user: User, @Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(user.organizationId, user.id, dto)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualiza dados de uma escala' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(id, user.organizationId, dto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove uma escala (somente DRAFT)' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.schedulesService.remove(id, user.organizationId)
  }

  @Post(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publica uma escala (DRAFT -> PUBLISHED)' })
  publish(@CurrentUser() user: User, @Param('id') id: string) {
    return this.schedulesService.publish(id, user.organizationId)
  }

  @Post(':id/close')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fecha uma escala (PUBLISHED -> CLOSED)' })
  close(@CurrentUser() user: User, @Param('id') id: string) {
    return this.schedulesService.close(id, user.organizationId)
  }

  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Duplica uma escala com seus plantões' })
  duplicate(@CurrentUser() user: User, @Param('id') id: string) {
    return this.schedulesService.duplicate(id, user.organizationId)
  }
}
