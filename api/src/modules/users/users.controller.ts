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
import { UsersService } from './users.service'
import { InviteUserDto } from './dto/invite-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserFiltersDto } from './dto/user-filters.dto'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { RolesGuard } from '../../shared/guards/roles.guard'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import { Roles } from '../../shared/decorators/roles.decorator'
import type { User } from '@prisma/client'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista usuários da organização com filtros' })
  findAll(@CurrentUser() user: User, @Query() filters: UserFiltersDto) {
    return this.usersService.findAll(user.organizationId, filters)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um usuário' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.findOne(id, user.organizationId)
  }

  @Post('invite')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Convida um novo profissional (ADMIN/MANAGER)' })
  invite(@CurrentUser() user: User, @Body() dto: InviteUserDto) {
    return this.usersService.invite(user.organizationId, dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de um usuário' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, user.organizationId, dto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativa (soft delete) um usuário' })
  deactivate(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.deactivate(id, user.organizationId)
  }
}
