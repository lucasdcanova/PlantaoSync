import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  organizationId: string
  avatarUrl?: string
  organization?: {
    id: string
    name: string
    slug: string
    subscription?: {
      plan: string
      status: string
      trialEndsAt?: string
    }
  }
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  /** true only when logged in with demo credentials (gestor@demo.com / medico@demo.com) */
  isDemoMode: boolean
  setUser: (user: AuthUser, isDemoMode?: boolean) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isDemoMode: false,

      setUser: (user, isDemoMode = false) =>
        set({ user, isAuthenticated: true, isDemoMode }),

      setAccessToken: (token) => set({ accessToken: token }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isDemoMode: false,
        }),
    }),
    {
      name: 'confirma-plantao-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode,
      }),
    },
  ),
)
