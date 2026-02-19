const PROD_URL = 'https://agendaplantao.com.br'

export function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!rawUrl) return PROD_URL

  const normalized = rawUrl.trim()
  const isLocal = normalized.includes('localhost') || normalized.includes('127.0.0.1')

  return isLocal ? PROD_URL : normalized
}
