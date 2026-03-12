import { create } from 'zustand'

export type ProfessionalStatus = 'Em cobertura' | 'Ativo' | 'Indisponível'
export type ProfessionalHospitalStatus = 'ATIVO' | 'REMOVIDO'

export interface ProfessionalProfile {
  id: string
  userId: string
  name: string
  email: string
  crm: string
  specialty: string
  phone?: string
  status: ProfessionalStatus
  hospitalStatus: ProfessionalHospitalStatus
  acceptanceRate: number
  completedShifts: number
  nextAvailability: string
  locations: string[]
}

interface AddProfessionalInput {
  name: string
  email: string
  crm: string
  specialty: string
  phone?: string
}

interface ProfessionalsState {
  professionals: ProfessionalProfile[]
  /** True once the first successful fetch from the backend has completed. */
  hasFetched: boolean
  addProfessional: (input: AddProfessionalInput) => ProfessionalProfile
  setProfessionals: (professionals: ProfessionalProfile[]) => void
  removeProfessional: (professionalId: string) => void
  restoreProfessional: (professionalId: string) => void
  resetProfessionals: () => void
}

export const useProfessionalsStore = create<ProfessionalsState>()(
  (set) => ({
    // Start empty and hydrate from backend when available.
    professionals: [],
    hasFetched: false,

    addProfessional: (input) => {
      const newPro: ProfessionalProfile = {
        id: `pro-${Date.now()}`,
        userId: `user-${Date.now()}`,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        crm: input.crm.trim(),
        specialty: input.specialty.trim(),
        phone: input.phone?.trim(),
        status: 'Ativo',
        hospitalStatus: 'ATIVO',
        acceptanceRate: 0,
        completedShifts: 0,
        nextAvailability: '—',
        locations: [],
      }
      set((state) => ({ professionals: [...state.professionals, newPro] }))
      return newPro
    },

    setProfessionals: (professionals) =>
      set({
        hasFetched: true,
        professionals: professionals.map((professional) => ({ ...professional })),
      }),

    removeProfessional: (professionalId) =>
      set((state) => ({
        professionals: state.professionals.map((p) =>
          p.id === professionalId ? { ...p, hospitalStatus: 'REMOVIDO' } : p,
        ),
      })),

    restoreProfessional: (professionalId) =>
      set((state) => ({
        professionals: state.professionals.map((p) =>
          p.id === professionalId ? { ...p, hospitalStatus: 'ATIVO' } : p,
        ),
      })),

    // Reset to empty (real users)
    resetProfessionals: () => set({ professionals: [], hasFetched: false }),
  }),
)
