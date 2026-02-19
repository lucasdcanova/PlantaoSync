import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import { SubscriptionsService } from './subscriptions.service'
import type { User } from '@prisma/client'

@ApiTags('Assinatura')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Assinatura atual da organização' })
  getCurrent(@CurrentUser() user: User) {
    return this.subscriptionsService.getSubscription(user.organizationId)
  }

  @Get('limits')
  @ApiOperation({ summary: 'Limites e uso atual do plano' })
  getLimits(@CurrentUser() user: User) {
    return this.subscriptionsService.getLimits(user.organizationId)
  }
}
