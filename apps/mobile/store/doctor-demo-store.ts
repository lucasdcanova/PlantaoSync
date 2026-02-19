import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  MOBILE_DOCTOR_AVAILABLE_SHIFTS,
  MOBILE_DOCTOR_INVITE_CODES,
  MOBILE_DOCTOR_MY_SHIFTS,
  MOBILE_DOCTOR_SECTORS,
  MOBILE_DOCTOR_SWAP_REQUESTS,
  type MobileDoctorAvailableShift,
  type MobileDoctorInviteCode,
  type MobileDoctorMyShift,
  type MobileDoctorSector,
  type MobileDoctorSwapRequest,
} from '../lib/doctor-demo-data'

export interface MobileDoctorRegistration {
  id: string
  inviteCode: string
  fullName: string
  email: string
  password: string
  crm: string
  specialty: string
  createdAt: string
}

interface RegisterDoctorPayload {
  inviteCode: string
  fullName: string
  email: string
  password: string
  crm: string
  specialty: string
}

interface RequestSwapPayload {
  shiftId: string
  counterpartName: string
  reason: string
}

interface MobileDoctorDemoState {
  sectors: MobileDoctorSector[]
  availableShifts: MobileDoctorAvailableShift[]
  myShifts: MobileDoctorMyShift[]
  swapRequests: MobileDoctorSwapRequest[]
  inviteCodes: MobileDoctorInviteCode[]
  registrations: MobileDoctorRegistration[]
  claimShift: (shiftId: string) => void
  requestSwap: (payload: RequestSwapPayload) => void
  respondSwapRequest: (requestId: string, decision: 'ACEITA' | 'RECUSADA') => void
  registerDoctorByInvite: (payload: RegisterDoctorPayload) => {
    ok: boolean
    message: string
  }
  validateRegisteredCredential: (email: string, password: string) => MobileDoctorRegistration | null
  resetDoctorDemoData: () => void
}

function buildInitialState() {
  return {
    sectors: MOBILE_DOCTOR_SECTORS.map((sector) => ({ ...sector })),
    availableShifts: MOBILE_DOCTOR_AVAILABLE_SHIFTS.map((shift) => ({ ...shift })),
    myShifts: MOBILE_DOCTOR_MY_SHIFTS.map((shift) => ({ ...shift })),
    swapRequests: MOBILE_DOCTOR_SWAP_REQUESTS.map((swap) => ({ ...swap })),
    inviteCodes: MOBILE_DOCTOR_INVITE_CODES.map((invite) => ({ ...invite })),
    registrations: [] as MobileDoctorRegistration[],
  }
}

export const useMobileDoctorDemoStore = create<MobileDoctorDemoState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),

      claimShift: (shiftId) =>
        set((state) => {
          const shift = state.availableShifts.find((item) => item.id === shiftId)
          if (!shift) return state

          const claimedShift: MobileDoctorMyShift = {
            id: `my-${shift.id}`,
            date: shift.date,
            startTime: shift.startTime,
            endTime: shift.endTime,
            sectorName: shift.sectorName,
            value: shift.valuePerShift,
            status: 'CONFIRMADO',
            patientLoad: 'Moderada',
            notes: `Plantão confirmado no aplicativo (${shift.issuedBy}).`,
          }

          return {
            sectors: state.sectors.map((sector) =>
              sector.id === shift.sectorId && sector.openShifts > 0
                ? { ...sector, openShifts: sector.openShifts - 1 }
                : sector,
            ),
            availableShifts: state.availableShifts.filter((item) => item.id !== shiftId),
            myShifts: [claimedShift, ...state.myShifts],
          }
        }),

      requestSwap: ({ shiftId, counterpartName, reason }) =>
        set((state) => {
          const shift = state.myShifts.find((item) => item.id === shiftId)
          if (!shift) return state
          if (shift.status !== 'CONFIRMADO' && shift.status !== 'TROCA_SOLICITADA') return state
          const hasPendingSwap = state.swapRequests.some(
            (item) => item.direction === 'saida' && item.shiftId === shift.id && item.status === 'PENDENTE',
          )
          if (hasPendingSwap) return state

          const swap: MobileDoctorSwapRequest = {
            id: `swap-out-${Date.now()}`,
            direction: 'saida',
            shiftId: shift.id,
            shiftDate: shift.date,
            shiftTime: `${shift.startTime} - ${shift.endTime}`,
            sectorName: shift.sectorName,
            counterpartName,
            reason,
            status: 'PENDENTE',
            createdAt: new Date().toISOString(),
          }

          return {
            myShifts: state.myShifts.map((item) =>
              item.id === shift.id ? { ...item, status: 'TROCA_SOLICITADA' } : item,
            ),
            swapRequests: [swap, ...state.swapRequests],
          }
        }),

      respondSwapRequest: (requestId, decision) =>
        set((state) => {
          const request = state.swapRequests.find((item) => item.id === requestId)
          if (!request || request.status !== 'PENDENTE') return state

          const updatedRequests = state.swapRequests.map((item) =>
            item.id === requestId ? { ...item, status: decision } : item,
          )

          if (request.direction !== 'entrada') {
            return { swapRequests: updatedRequests }
          }

          return {
            swapRequests: updatedRequests,
            myShifts: state.myShifts.map((shift) =>
              shift.id === request.shiftId
                ? {
                    ...shift,
                    status: decision === 'ACEITA' ? 'CONFIRMADO' : shift.status,
                    notes:
                      decision === 'ACEITA'
                        ? `Troca aceita com ${request.counterpartName}.`
                        : shift.notes,
                  }
                : shift,
            ),
          }
        }),

      registerDoctorByInvite: ({ inviteCode, fullName, email, password, crm, specialty }) => {
        const normalizedCode = inviteCode.trim().toUpperCase()
        const normalizedEmail = email.trim().toLowerCase()
        const state = get()

        if (!normalizedCode || !normalizedEmail || !fullName.trim() || !password || !crm.trim() || !specialty.trim()) {
          return { ok: false, message: 'Preencha todos os campos obrigatórios.' }
        }

        const invite = state.inviteCodes.find((item) => item.code === normalizedCode)
        if (!invite) {
          return { ok: false, message: 'Código de convite inválido.' }
        }
        if (invite.status !== 'ATIVO') {
          return { ok: false, message: 'Este convite já foi utilizado.' }
        }
        if (state.registrations.some((registration) => registration.email === normalizedEmail)) {
          return { ok: false, message: 'Este e-mail já foi cadastrado neste dispositivo.' }
        }

        const registration: MobileDoctorRegistration = {
          id: `reg-${Date.now()}`,
          inviteCode: normalizedCode,
          fullName: fullName.trim(),
          email: normalizedEmail,
          password,
          crm: crm.trim(),
          specialty: specialty.trim(),
          createdAt: new Date().toISOString(),
        }

        set((current) => ({
          registrations: [registration, ...current.registrations],
          inviteCodes: current.inviteCodes.map((item) =>
            item.code === normalizedCode ? { ...item, status: 'UTILIZADO' } : item,
          ),
        }))

        return { ok: true, message: 'Cadastro via convite concluído.' }
      },

      validateRegisteredCredential: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase()
        return (
          get().registrations.find(
            (registration) => registration.email === normalizedEmail && registration.password === password,
          ) ?? null
        )
      },

      resetDoctorDemoData: () => set(() => ({ ...buildInitialState() })),
    }),
    {
      name: 'confirma-plantao-mobile-doctor-demo',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sectors: state.sectors,
        availableShifts: state.availableShifts,
        myShifts: state.myShifts,
        swapRequests: state.swapRequests,
        inviteCodes: state.inviteCodes,
        registrations: state.registrations,
      }),
    },
  ),
)
