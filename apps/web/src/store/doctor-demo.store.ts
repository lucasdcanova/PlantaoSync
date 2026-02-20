import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEMO_DOCTOR_AVAILABLE_SHIFTS,
  DEMO_DOCTOR_INVITE_CODES,
  DEMO_DOCTOR_MY_SHIFTS,
  DEMO_DOCTOR_SECTORS,
  DEMO_DOCTOR_SWAP_REQUESTS,
  type DemoDoctorInviteCode,
  type DemoDoctorMyShift,
  type DemoDoctorSector,
  type DemoDoctorShiftOpportunity,
  type DemoDoctorSwapRequest,
} from '@/lib/demo-data'

export interface DemoDoctorRegistration {
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

interface DoctorDemoState {
  sectors: DemoDoctorSector[]
  availableShifts: DemoDoctorShiftOpportunity[]
  myShifts: DemoDoctorMyShift[]
  swapRequests: DemoDoctorSwapRequest[]
  inviteCodes: DemoDoctorInviteCode[]
  registrations: DemoDoctorRegistration[]
  claimShift: (shiftId: string) => void
  requestSwap: (payload: RequestSwapPayload) => void
  respondSwapRequest: (requestId: string, decision: 'ACEITA' | 'RECUSADA') => void
  registerDoctorByInvite: (payload: RegisterDoctorPayload) => {
    ok: boolean
    message: string
  }
  validateRegisteredCredential: (email: string, password: string) => DemoDoctorRegistration | null
  resetDoctorDemoData: () => void
}

function buildInitialDoctorState() {
  return {
    sectors: DEMO_DOCTOR_SECTORS.map((sector) => ({ ...sector })),
    availableShifts: DEMO_DOCTOR_AVAILABLE_SHIFTS.map((shift) => ({ ...shift })),
    myShifts: DEMO_DOCTOR_MY_SHIFTS.map((shift) => ({ ...shift })),
    swapRequests: DEMO_DOCTOR_SWAP_REQUESTS.map((swap) => ({ ...swap })),
    inviteCodes: DEMO_DOCTOR_INVITE_CODES.map((invite) => ({ ...invite })),
    registrations: [] as DemoDoctorRegistration[],
  }
}

export const useDoctorDemoStore = create<DoctorDemoState>()(
  persist(
    (set, get) => ({
      ...buildInitialDoctorState(),

      claimShift: (shiftId) =>
        set((state) => {
          const shift = state.availableShifts.find((item) => item.id === shiftId)
          if (!shift) return state

          const updatedSectors = state.sectors.map((sector) =>
            sector.id === shift.sectorId && sector.openShifts > 0
              ? { ...sector, openShifts: sector.openShifts - 1 }
              : sector,
          )

          const claimedShift: DemoDoctorMyShift = {
            id: `my-${shift.id}`,
            professionalId: 'demo-professional',
            professionalUserId: 'demo-doctor-1',
            sectorId: shift.sectorId,
            date: shift.date,
            startTime: shift.startTime,
            endTime: shift.endTime,
            sectorName: shift.sectorName,
            specialty: shift.specialty,
            status: 'CONFIRMADO',
            value: shift.value,
            patientLoad: 'Moderada',
            notes: `Plantão assumido via painel do médico (${shift.issuedBy}).`,
          }

          return {
            sectors: updatedSectors,
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

          const newSwap: DemoDoctorSwapRequest = {
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
            swapRequests: [newSwap, ...state.swapRequests],
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

          const updatedShifts = state.myShifts.map((shift) =>
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
          )

          return {
            myShifts: updatedShifts,
            swapRequests: updatedRequests,
          }
        }),

      registerDoctorByInvite: ({ inviteCode, fullName, email, password, crm, specialty }) => {
        const normalizedEmail = email.trim().toLowerCase()
        const normalizedCode = inviteCode.trim().toUpperCase()
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
          return { ok: false, message: 'Este e-mail já foi cadastrado via convite.' }
        }

        const registration: DemoDoctorRegistration = {
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

        return { ok: true, message: 'Cadastro realizado com sucesso. Faça login para acessar o ambiente médico.' }
      },

      validateRegisteredCredential: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase()
        return (
          get().registrations.find(
            (registration) => registration.email === normalizedEmail && registration.password === password,
          ) ?? null
        )
      },

      resetDoctorDemoData: () => set(() => ({ ...buildInitialDoctorState() })),
    }),
    {
      name: 'confirma-plantao-doctor-demo',
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
