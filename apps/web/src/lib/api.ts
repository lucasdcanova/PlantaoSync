import ky, { type KyInstance, type Options } from 'ky'
import { useAuthStore } from '@/store/auth.store'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function createApiClient(token?: string): KyInstance {
  return ky.create({
    prefixUrl: `${BASE_URL}/api/v1`,
    credentials: 'include',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    hooks: {
      beforeError: [
        async (error) => {
          const { response } = error
          if (response) {
            try {
              const body = (await response.clone().json()) as { message?: string }
              ;(error as any).message = body.message ?? error.message
            } catch {}
          }
          return error
        },
      ],
      afterResponse: [
        async (request, _options, response) => {
          if (response.status === 401) {
            // Tentar refresh automático
            try {
              const refreshed = await ky
                .post(`${BASE_URL}/api/v1/auth/refresh`, { credentials: 'include' })
                .json<{ accessToken: string }>()

              useAuthStore.getState().setAccessToken(refreshed.accessToken)

              // Repetir request original com novo token
              request.headers.set('Authorization', `Bearer ${refreshed.accessToken}`)
              return ky(request)
            } catch {
              useAuthStore.getState().logout()
              window.location.href = '/login'
            }
          }
          return response
        },
      ],
    },
  })
}

// Client padrão — pega token do store automaticamente
export function getApiClient(options?: Options): KyInstance {
  const token = useAuthStore.getState().accessToken
  return createApiClient(token ?? undefined)
}

// Para uso em Server Components / sem store
export const api = createApiClient()
