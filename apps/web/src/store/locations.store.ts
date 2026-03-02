import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type LocationCriticality = 'Alta' | 'Média' | 'Baixa'

export interface ManagerLocation {
  id: string
  name: string
  criticality: LocationCriticality
  occupancyRate: number
  pendingShifts: number
  activeProfessionals: number
  monthlyCost: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LocationEditorInput {
  name: string
  criticality: LocationCriticality
  occupancyRate: number
  pendingShifts: number
  activeProfessionals: number
  monthlyCost: number
}

interface LocationsState {
  locations: ManagerLocation[]
  addLocation: (input: LocationEditorInput) => ManagerLocation
  updateLocation: (id: string, input: LocationEditorInput) => ManagerLocation
  deleteLocation: (id: string) => void
  toggleLocationActive: (id: string) => void
  setLocations: (locations: ManagerLocation[]) => void
  resetLocations: () => void
}

function nowIso() {
  return new Date().toISOString()
}

function clampInt(value: number, min: number, max?: number) {
  if (!Number.isFinite(value)) return min
  const normalized = Math.trunc(value)
  if (typeof max === 'number') return Math.min(max, Math.max(min, normalized))
  return Math.max(min, normalized)
}

function normalizeMoney(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0
  return Math.round(value)
}

function validateLocationInput(input: LocationEditorInput) {
  if (!input.name.trim()) {
    throw new Error('Informe o nome do setor.')
  }
}

function normalizeLocationInput(input: LocationEditorInput) {
  validateLocationInput(input)

  return {
    name: input.name.trim(),
    criticality: input.criticality,
    occupancyRate: clampInt(input.occupancyRate, 0, 100),
    pendingShifts: clampInt(input.pendingShifts, 0),
    activeProfessionals: clampInt(input.activeProfessionals, 0),
    monthlyCost: normalizeMoney(input.monthlyCost),
  }
}

function sortLocations(locations: ManagerLocation[]) {
  return [...locations].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    return a.name.localeCompare(b.name, 'pt-BR')
  })
}

export const useLocationsStore = create<LocationsState>()(
  persist(
    (set, get) => ({
      // Start empty and hydrate from backend.
      locations: [],

      addLocation: (input) => {
        const normalized = normalizeLocationInput(input)
        const timestamp = nowIso()

        const newLocation: ManagerLocation = {
          id: `loc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
          ...normalized,
          isActive: true,
          createdAt: timestamp,
          updatedAt: timestamp,
        }

        set((state) => ({
          locations: sortLocations([...state.locations, newLocation]),
        }))

        return newLocation
      },

      updateLocation: (id, input) => {
        const normalized = normalizeLocationInput(input)
        const current = get().locations.find((location) => location.id === id)
        if (!current) {
          throw new Error('Setor não encontrado.')
        }

        const updated: ManagerLocation = {
          ...current,
          ...normalized,
          updatedAt: nowIso(),
        }

        set((state) => ({
          locations: sortLocations(
            state.locations.map((location) => (location.id === id ? updated : location)),
          ),
        }))

        return updated
      },

      deleteLocation: (id) =>
        set((state) => ({
          locations: state.locations.filter((location) => location.id !== id),
        })),

      toggleLocationActive: (id) =>
        set((state) => ({
          locations: sortLocations(
            state.locations.map((location) =>
              location.id === id
                ? { ...location, isActive: !location.isActive, updatedAt: nowIso() }
                : location,
            ),
          ),
        })),

      setLocations: (locations) =>
        set({
          locations: sortLocations(locations),
        }),

      resetLocations: () => set({ locations: [] }),
    }),
    {
      name: 'confirma-plantao-locations',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ locations: state.locations }),
    },
  ),
)
