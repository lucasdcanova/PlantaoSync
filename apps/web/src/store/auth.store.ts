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
  hasHydrated: boolean
  setUser: (user: AuthUser) => void
  setAccessToken: (token: string) => void
  setHasHydrated: (hydrated: boolean) => void
  syncSession: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      setUser: (user) => set({ user, isAuthenticated: Boolean(user && get().accessToken) }),

      setAccessToken: (token) => set({ accessToken: token, isAuthenticated: Boolean(token && get().user) }),

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      syncSession: () =>
        set((state) => ({
          isAuthenticated: Boolean(state.user && state.accessToken),
        })),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'confirma-plantao-auth',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.syncSession()
        state.setHasHydrated(true)
      },
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
)
