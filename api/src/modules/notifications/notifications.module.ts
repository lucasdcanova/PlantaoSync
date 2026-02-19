import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { NotificationsProcessor } from './queues/notifications.processor'

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: (() => {
          const redisUrl = config.get<string>('REDIS_URL')?.trim()

          if (redisUrl) {
            const parsed = new URL(redisUrl)
            return {
              host: parsed.hostname,
              port: parsed.port ? Number(parsed.port) : 6379,
              username: parsed.username || undefined,
              password: parsed.password || undefined,
              tls: parsed.protocol === 'rediss:' ? {} : undefined,
            }
          }

          return {
            host: config.get('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
            password: config.get('REDIS_PASSWORD'),
            tls: config.get('REDIS_TLS') === 'true' ? {} : undefined,
          }
        })(),
      }),
    }),
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
