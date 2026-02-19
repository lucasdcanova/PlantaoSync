import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { MobileDoctorUser } from '../lib/doctor-demo-data'

interface MobileAuthState {
  user: MobileDoctorUser | null
  isAuthenticated: boolean
  login: (user: MobileDoctorUser) => void
  logout: () => void
}

export const useMobileAuthStore = create<MobileAuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'confirma-plantao-mobile-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
