import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
}

const INITIAL_MANAGERS: DemoManager[] = [
  {
    id: 'mgr-1',
    name: 'Gestor Demo',
    email: 'gestor@demo.com',
    role: 'ADMIN',
    addedAt: '2026-01-15T09:00:00Z',
  },
]

export const useInstitutionStore = create<InstitutionState>()(
  persist(
    (set) => ({
      name: 'Hospital São Gabriel',
      cnpj: '12.345.678/0001-99',
      phone: '(11) 3456-7890',
      email: 'contato@hospitalsaogabriel.com.br',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      website: 'www.hospitalsaogabriel.com.br',
      logoUrl: undefined,
      managers: INITIAL_MANAGERS,

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
    }),
    { name: 'confirma-plantao-institution' },
  ),
)
