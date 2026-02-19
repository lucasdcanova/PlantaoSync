import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import type { User } from '@prisma/client'

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const user = req.user as User

    if (!user) return false

    // Admin SaaS pode acessar qualquer tenant
    if ((user as any).isSuperAdmin) return true

    // Verificar se o recurso pertence ao tenant do usuário
    const organizationIdFromParam = req.params?.organizationId
    const organizationIdFromBody = req.body?.organizationId

    if (organizationIdFromParam && organizationIdFromParam !== user.organizationId) {
      throw new ForbiddenException('Acesso negado a este recurso')
    }
    if (organizationIdFromBody && organizationIdFromBody !== user.organizationId) {
      throw new ForbiddenException('Acesso negado a este recurso')
    }

    return true
  }
}
