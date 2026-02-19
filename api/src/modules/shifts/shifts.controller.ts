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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'
import { ShiftsService } from './shifts.service'
import { CreateShiftDto } from './dto/create-shift.dto'
import { CreateBulkShiftsDto } from './dto/create-bulk-shifts.dto'
import { UpdateShiftDto } from './dto/update-shift.dto'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { RolesGuard } from '../../shared/guards/roles.guard'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import { Roles } from '../../shared/decorators/roles.decorator'
import type { User } from '@prisma/client'

@ApiTags('Shifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista plantões de uma escala' })
  @ApiQuery({ name: 'scheduleId', required: true, description: 'ID da escala' })
  findBySchedule(@CurrentUser() user: User, @Query('scheduleId') scheduleId: string) {
    return this.shiftsService.findBySchedule(scheduleId, user.organizationId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um plantão' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.shiftsService.findOne(id, user.organizationId)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cria um novo plantão' })
  create(@CurrentUser() user: User, @Body() dto: CreateShiftDto) {
    return this.shiftsService.create(user.organizationId, dto)
  }

  @Post('bulk')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria múltiplos plantões de uma vez' })
  createBulk(@CurrentUser() user: User, @Body() dto: CreateBulkShiftsDto) {
    return this.shiftsService.createBulk(user.organizationId, dto)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualiza um plantão' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.shiftsService.update(id, user.organizationId, dto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove um plantão' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.shiftsService.remove(id, user.organizationId)
  }
}
