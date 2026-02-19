import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'
import * as admin from 'firebase-admin'

interface SendPushJobData {
  userId: string
  payload: {
    title: string
    body: string
    data?: Record<string, unknown>
  }
}

interface BatchNotifyJobData {
  userIds: string[]
  payload: {
    title: string
    body: string
    data?: Record<string, unknown>
  }
}

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name)
  private firebaseApp: admin.app.App | null = null

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super()
    this.initFirebase()
  }

  private initFirebase() {
    try {
      const serviceAccountJson = this.config.get<string>('FIREBASE_SERVICE_ACCOUNT')
      if (!serviceAccountJson) {
        this.logger.warn('FIREBASE_SERVICE_ACCOUNT não configurado — push notifications desabilitadas')
        return
      }

      if (!admin.apps.length) {
        const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        })
      } else {
        this.firebaseApp = admin.app()
      }
    } catch (error) {
      this.logger.error('Erro ao inicializar Firebase:', error)
    }
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing job: ${job.name} [${job.id}]`)

    switch (job.name) {
      case 'send-push':
        await this.processSendPush(job as Job<SendPushJobData>)
        break
      case 'batch-notify':
        await this.processBatchNotify(job as Job<BatchNotifyJobData>)
        break
      default:
        this.logger.warn(`Unknown job type: ${job.name}`)
    }
  }

  private async processSendPush(job: Job<SendPushJobData>) {
    const { userId, payload } = job.data

    const tokens = await this.prisma.pushToken.findMany({
      where: { userId },
      select: { token: true, platform: true },
    })

    if (tokens.length === 0) {
      this.logger.debug(`No push tokens for user ${userId}`)
      return
    }

    // Salvar notificação in-app
    await this.prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: payload.title,
        body: payload.body,
        data: payload.data ?? undefined,
        sentAt: new Date(),
      },
    })

    if (!this.firebaseApp) {
      this.logger.warn('Firebase não inicializado — notificação in-app salva mas push não enviado')
      return
    }

    const messaging = admin.messaging(this.firebaseApp)
    const fcmTokens = tokens.map((t) => t.token)

    try {
      const response = await messaging.sendEachForMulticast({
        tokens: fcmTokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data
          ? Object.fromEntries(
              Object.entries(payload.data).map(([k, v]) => [k, String(v)]),
            )
          : undefined,
      })

      this.logger.log(
        `Push sent to ${userId}: ${response.successCount} success, ${response.failureCount} failed`,
      )

      // Remover tokens inválidos
      const invalidTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (
          !resp.success &&
          (resp.error?.code === 'messaging/registration-token-not-registered' ||
            resp.error?.code === 'messaging/invalid-registration-token')
        ) {
          invalidTokens.push(fcmTokens[idx])
        }
      })

      if (invalidTokens.length > 0) {
        await this.prisma.pushToken.deleteMany({
          where: { token: { in: invalidTokens } },
        })
        this.logger.log(`Removed ${invalidTokens.length} invalid push tokens`)
      }
    } catch (error) {
      this.logger.error(`Error sending push to ${userId}:`, error)
      throw error
    }
  }

  private async processBatchNotify(job: Job<BatchNotifyJobData>) {
    const { userIds, payload } = job.data
    this.logger.log(`Batch notify: ${userIds.length} users`)

    const CHUNK_SIZE = 50
    for (let i = 0; i < userIds.length; i += CHUNK_SIZE) {
      const chunk = userIds.slice(i, i + CHUNK_SIZE)

      const tokensMap = await this.prisma.pushToken.findMany({
        where: { userId: { in: chunk } },
        select: { userId: true, token: true },
      })

      // Salvar notificações in-app em batch
      await this.prisma.notification.createMany({
        data: chunk.map((uid) => ({
          userId: uid,
          type: 'SYSTEM' as const,
          title: payload.title,
          body: payload.body,
          data: payload.data ?? undefined,
          sentAt: new Date(),
        })),
        skipDuplicates: true,
      })

      if (!this.firebaseApp || tokensMap.length === 0) continue

      const tokens = tokensMap.map((t) => t.token)
      const messaging = admin.messaging(this.firebaseApp)

      try {
        const response = await messaging.sendEachForMulticast({
          tokens,
          notification: { title: payload.title, body: payload.body },
          data: payload.data
            ? Object.fromEntries(
                Object.entries(payload.data).map(([k, v]) => [k, String(v)]),
              )
            : undefined,
        })

        this.logger.log(
          `Batch chunk ${i / CHUNK_SIZE + 1}: ${response.successCount}/${tokens.length} success`,
        )
      } catch (error) {
        this.logger.error(`Error in batch chunk ${i / CHUNK_SIZE + 1}:`, error)
      }
    }
  }
}
