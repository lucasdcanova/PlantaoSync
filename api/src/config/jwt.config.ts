import { ConfigService } from '@nestjs/config'

function resolveSecret(config: ConfigService, keys: string[]) {
  for (const key of keys) {
    const value = config.get<string>(key)?.trim()
    if (value) return value
  }

  throw new Error(
    `Configuração ausente: defina ${keys.join(' ou ')} nas variáveis de ambiente (Render > Environment).`,
  )
}

export function getJwtAccessSecret(config: ConfigService) {
  return resolveSecret(config, ['JWT_ACCESS_SECRET', 'JWT_SECRET'])
}

export function getJwtRefreshSecret(config: ConfigService) {
  return resolveSecret(config, ['JWT_REFRESH_SECRET', 'JWT_SECRET'])
}

