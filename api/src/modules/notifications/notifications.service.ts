import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { Platform } from '@prisma/client'

export interface PushPayload {
  title: string
  body: string
  data?: Record<string, unknown>
}

interface NotificationFilters {
  unreadOnly?: boolean
  page?: number
  limit?: number
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async findAll(userId: string, filters: NotificationFilters = {}) {
    const { unreadOnly = false, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where = {
      userId,
      ...(unreadOnly && { readAt: null }),
    }

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
    }
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    })

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada')
    }

    if (notification.readAt) {
      return notification
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    })
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })

    return { message: 'Todas as notificações foram marcadas como lidas' }
  }

  async sendPush(userId: string, payload: PushPayload) {
    await this.notificationsQueue.add('send-push', { userId, payload }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    })
  }

  async sendBulkPush(userIds: string[], payload: PushPayload) {
    await this.notificationsQueue.add(
      'batch-notify',
      { userIds, payload },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    )
  }

  async registerPushToken(userId: string, token: string, platform: Platform) {
    // Upsert: se já existir o token, atualiza; senão cria
    return this.prisma.pushToken.upsert({
      where: { token },
      create: { userId, token, platform },
      update: { userId, platform },
    })
  }

  async removePushToken(token: string, userId: string) {
    const existing = await this.prisma.pushToken.findFirst({
      where: { token, userId },
    })

    if (!existing) {
      throw new NotFoundException('Token não encontrado')
    }

    await this.prisma.pushToken.delete({ where: { token } })

    return { message: 'Token removido com sucesso' }
  }

  async createInAppNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        body,
        ...(data !== undefined && { data: data as object }),
      },
    })
  }
}
