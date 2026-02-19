import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'
import { LocationsService } from './locations.service'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { RolesGuard } from '../../shared/guards/roles.guard'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import { Roles } from '../../shared/decorators/roles.decorator'
import type { User } from '@prisma/client'

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os locais ativos da organização' })
  findAll(@CurrentUser() user: User) {
    return this.locationsService.findAll(user.organizationId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um local' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.locationsService.findOne(id, user.organizationId)
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Cria um novo local (ADMIN/MANAGER)' })
  create(@CurrentUser() user: User, @Body() dto: CreateLocationDto) {
    return this.locationsService.create(user.organizationId, dto)
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Atualiza um local' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.update(id, user.organizationId, dto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativa (soft delete) um local' })
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.locationsService.remove(id, user.organizationId)
  }
}
