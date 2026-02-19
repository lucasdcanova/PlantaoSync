import { Module } from '@nestjs/common'
import { SchedulesController } from './schedules.controller'
import { SchedulesService } from './schedules.service'
import { SchedulesGateway } from './schedules.gateway'

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService, SchedulesGateway],
  exports: [SchedulesService, SchedulesGateway],
})
export class SchedulesModule {}
