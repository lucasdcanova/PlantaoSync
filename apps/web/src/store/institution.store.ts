import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/store/auth.store'

export interface DemoManager {
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
  managers: DemoManager[]
  updateInfo: (info: Partial<InstitutionInfo>) => void
  setLogo: (logoUrl: string | undefined) => void
  addManager: (manager: Omit<DemoManager, 'id' | 'addedAt'>) => void
  removeManager: (managerId: string) => void
  resetInstitution: () => void
  /** Populate with demo hospital data (call on demo login only) */
  initDemoData: () => void
  /** Populate from a real authenticated user's org (call on real login/register) */
  initFromUser: (user: AuthUser) => void
}

const EMPTY_STATE: InstitutionInfo & { managers: DemoManager[] } = {
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
      // Start EMPTY — populated via initDemoData() or initFromUser()
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

      // Populate with demo hospital data
      initDemoData: () =>
        set({
          name: 'Hospital São Gabriel',
          cnpj: '12.345.678/0001-99',
          phone: '(11) 3456-7890',
          email: 'contato@hospitalsaogabriel.com.br',
          address: 'Av. Paulista, 1000',
          city: 'São Paulo',
          state: 'SP',
          website: 'www.hospitalsaogabriel.com.br',
          logoUrl: undefined,
          managers: [
            {
              id: 'mgr-1',
              name: 'Gestor Demo',
              email: 'gestor@demo.com',
              role: 'ADMIN',
              addedAt: '2026-01-15T09:00:00Z',
            },
          ],
        }),

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
