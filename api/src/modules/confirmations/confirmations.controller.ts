import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { ConfirmationsService } from './confirmations.service'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import type { User } from '@prisma/client'

@ApiTags('Confirmations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('confirmations')
export class ConfirmationsController {
  constructor(private readonly confirmationsService: ConfirmationsService) {}

  @Get('available')
  @ApiOperation({ summary: 'Lista plantões disponíveis para o profissional autenticado' })
  getAvailableShifts(@CurrentUser() user: User) {
    return this.confirmationsService.getAvailableShifts(user.id, user.organizationId)
  }

  @Get('mine')
  @ApiOperation({ summary: 'Lista confirmações do profissional autenticado' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findMine(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.confirmationsService.findByUser(user.id, user.organizationId, {
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    })
  }

  @Get()
  @ApiOperation({ summary: 'Lista confirmações de um plantão (gestor)' })
  @ApiQuery({ name: 'shiftId', required: true, description: 'ID do plantão' })
  findByShift(@CurrentUser() user: User, @Query('shiftId') shiftId: string) {
    return this.confirmationsService.findByShift(shiftId, user.organizationId)
  }

  @Post('confirm/:shiftId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Confirmar participação em um plantão' })
  confirm(@CurrentUser() user: User, @Param('shiftId') shiftId: string) {
    return this.confirmationsService.confirm(shiftId, user.id)
  }

  @Post('cancel/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar confirmação de um plantão' })
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.confirmationsService.cancel(id, user.id)
  }
}
