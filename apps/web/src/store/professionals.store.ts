import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DEMO_PROFESSIONALS, type DemoProfessional } from '@/lib/demo-data'

interface AddProfessionalInput {
  name: string
  email: string
  crm: string
  specialty: string
  phone?: string
}

interface ProfessionalsState {
  professionals: DemoProfessional[]
  addProfessional: (input: AddProfessionalInput) => DemoProfessional
  removeProfessional: (professionalId: string) => void
  restoreProfessional: (professionalId: string) => void
  resetProfessionals: () => void
  initDemoData: () => void
}

export const useProfessionalsStore = create<ProfessionalsState>()(
  persist(
    (set) => ({
      // Start EMPTY — populated via initDemoData() on demo login
      professionals: [],

      addProfessional: (input) => {
        const newPro: DemoProfessional = {
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
      resetProfessionals: () => set({ professionals: [] }),

      // Populate with demo data (call on demo login only)
      initDemoData: () => set({ professionals: DEMO_PROFESSIONALS }),
    }),
    {
      name: 'confirma-plantao-professionals',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ professionals: state.professionals }),
    },
  ),
)
