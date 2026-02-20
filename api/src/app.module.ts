import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { EventEmitterModule } from '@nestjs/event-emitter'
import './load-root-env'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { TenantsModule } from './modules/tenants/tenants.module'
import { LocationsModule } from './modules/locations/locations.module'
import { SchedulesModule } from './modules/schedules/schedules.module'
import { ShiftsModule } from './modules/shifts/shifts.module'
import { ConfirmationsModule } from './modules/confirmations/confirmations.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { ReportsModule } from './modules/reports/reports.module'
import { FinancesModule } from './modules/finances/finances.module'
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module'
import { StorageModule } from './modules/storage/storage.module'
import { UploadsModule } from './modules/uploads/uploads.module'

const shouldEnableNotifications =
  Boolean(process.env.REDIS_URL?.trim()) || Boolean(process.env.REDIS_HOST?.trim())

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [{ ttl: 60000, limit: 100 }],
      }),
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    LocationsModule,
    SchedulesModule,
    ShiftsModule,
    ConfirmationsModule,
    ...(shouldEnableNotifications ? [NotificationsModule] : []),
    ReportsModule,
    FinancesModule,
    SubscriptionsModule,
    StorageModule,
    UploadsModule,
  ],
})
export class AppModule { }
