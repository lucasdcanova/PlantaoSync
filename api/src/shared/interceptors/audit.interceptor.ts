import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { PrismaService } from '../../prisma/prisma.service'
import { Reflector } from '@nestjs/core'
import { AUDIT_ACTION_KEY } from '../decorators/audit.decorator'

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const auditAction = this.reflector.get<string>(AUDIT_ACTION_KEY, context.getHandler())
    if (!auditAction) return next.handle()

    const req = context.switchToHttp().getRequest()
    const user = req.user

    return next.handle().pipe(
      tap(async (result) => {
        if (user) {
          await this.prisma.auditLog.create({
            data: {
              userId: user.id,
              action: auditAction,
              entityType: auditAction.split('.')[0] ?? 'unknown',
              entityId: (result as { id?: string })?.id ?? req.params?.id ?? '',
              after: result as object,
              ip: req.ip,
              userAgent: req.headers['user-agent'],
            },
          })
        }
      }),
    )
  }
}
