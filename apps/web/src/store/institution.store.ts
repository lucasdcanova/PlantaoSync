import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/store/auth.store'

export interface InstitutionManager {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER'
  addedAt: string
}

interface InstitutionInfo {
  name: string
  cnpj: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  website: string
  logoUrl?: string
}

interface InstitutionState extends InstitutionInfo {
  managers: InstitutionManager[]
  updateInfo: (info: Partial<InstitutionInfo>) => void
  setLogo: (logoUrl: string | undefined) => void
  addManager: (manager: Omit<InstitutionManager, 'id' | 'addedAt'>) => void
  removeManager: (managerId: string) => void
  resetInstitution: () => void
  /** Populate from a real authenticated user's org (call on real login/register) */
  initFromUser: (user: AuthUser) => void
}

const EMPTY_STATE: InstitutionInfo & { managers: InstitutionManager[] } = {
  name: '',
  cnpj: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  website: '',
  logoUrl: undefined,
  managers: [],
}

export const useInstitutionStore = create<InstitutionState>()(
  persist(
    (set) => ({
      // Start empty and populate from authenticated user context.
      ...EMPTY_STATE,

      updateInfo: (info) => set((state) => ({ ...state, ...info })),

      setLogo: (logoUrl) => set({ logoUrl }),

      addManager: (manager) =>
        set((state) => ({
          managers: [
            ...state.managers,
            {
              ...manager,
              id: `mgr-${Date.now()}`,
              addedAt: new Date().toISOString(),
            },
          ],
        })),

      removeManager: (managerId) =>
        set((state) => ({
          managers: state.managers.filter((m) => m.id !== managerId),
        })),

      // Reset to blank state (for real users at logout)
      resetInstitution: () => set(EMPTY_STATE),

      // Populate from real user's org (shows org name, adds them as ADMIN)
      initFromUser: (user: AuthUser) =>
        set({
          ...EMPTY_STATE,
          name: user.organization?.name ?? '',
          managers: [
            {
              id: `mgr-${user.id}`,
              name: user.name,
              email: user.email,
              role: 'ADMIN',
              addedAt: new Date().toISOString(),
            },
          ],
        }),
    }),
    { name: 'confirma-plantao-institution' },
  ),
)
