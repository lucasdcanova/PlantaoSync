export const MOBILE_DOCTOR_EMAIL = 'medico@demo.com'
export const MOBILE_DOCTOR_PASSWORD = 'Senha@123'

export interface MobileDoctorUser {
  id: string
  name: string
  email: string
  role: 'PROFESSIONAL'
  crm: string
  specialty: string
  organizationName: string
}

export const MOBILE_DOCTOR_USER: MobileDoctorUser = {
  id: 'mobile-doc-1',
  name: 'Dra. Ana Costa',
  email: MOBILE_DOCTOR_EMAIL,
  role: 'PROFESSIONAL',
  crm: 'CRM-SP 123456',
  specialty: 'Medicina Intensiva',
  organizationName: 'Hospital São Gabriel',
}

export interface MobileDoctorSector {
  id: string
  name: string
  floor: string
  openShifts: number
  nextCriticalWindow: string
  skills: string[]
}

export const MOBILE_DOCTOR_SECTORS: MobileDoctorSector[] = [
  {
    id: 'sec-uti-adulto',
    name: 'UTI Adulto',
    floor: '4º andar',
    openShifts: 3,
    nextCriticalWindow: '20/02 · 19:00',
    skills: ['Intensivista', 'Clínica Médica'],
  },
  {
    id: 'sec-ps',
    name: 'Pronto-Socorro',
    floor: 'Térreo',
    openShifts: 2,
    nextCriticalWindow: '21/02 · 07:00',
    skills: ['Emergência', 'Clínica Médica'],
  },
  {
    id: 'sec-clinica',
    name: 'Clínica Médica',
    floor: '3º andar',
    openShifts: 2,
    nextCriticalWindow: '22/02 · 13:00',
    skills: ['Clínica Médica'],
  },
  {
    id: 'sec-neonatal',
    name: 'UTI Neonatal',
    floor: '5º andar',
    openShifts: 1,
    nextCriticalWindow: '23/02 · 19:00',
    skills: ['Neonatologia', 'Pediatria'],
  },
]

export interface MobileDoctorAvailableShift {
  id: string
  sectorId: string
  sectorName: string
  date: string
  startTime: string
  endTime: string
  specialty: string
  valuePerShift: number
  spotsLeft: number
  issuedBy: string
  notes?: string
}

export const MOBILE_DOCTOR_AVAILABLE_SHIFTS: MobileDoctorAvailableShift[] = [
  {
    id: 'op-1',
    sectorId: 'sec-uti-adulto',
    sectorName: 'UTI Adulto',
    date: '2026-02-20',
    startTime: '19:00',
    endTime: '07:00',
    specialty: 'Medicina Intensiva',
    valuePerShift: 145000,
    spotsLeft: 1,
    issuedBy: 'Coordenação UTI',
    notes: 'Chegada com 20 min de antecedência para passagem de caso crítico.',
  },
  {
    id: 'op-2',
    sectorId: 'sec-ps',
    sectorName: 'Pronto-Socorro',
    date: '2026-02-21',
    startTime: '07:00',
    endTime: '19:00',
    specialty: 'Emergência',
    valuePerShift: 135000,
    spotsLeft: 2,
    issuedBy: 'Coordenação PS',
  },
  {
    id: 'op-3',
    sectorId: 'sec-clinica',
    sectorName: 'Clínica Médica',
    date: '2026-02-22',
    startTime: '13:00',
    endTime: '19:00',
    specialty: 'Clínica Médica',
    valuePerShift: 92000,
    spotsLeft: 1,
    issuedBy: 'Coordenação Clínica',
  },
  {
    id: 'op-4',
    sectorId: 'sec-neonatal',
    sectorName: 'UTI Neonatal',
    date: '2026-02-23',
    startTime: '19:00',
    endTime: '07:00',
    specialty: 'Neonatologia',
    valuePerShift: 155000,
    spotsLeft: 1,
    issuedBy: 'Coordenação Neo',
  },
]

export interface MobileDoctorMyShift {
  id: string
  date: string
  startTime: string
  endTime: string
  sectorName: string
  value: number
  status: 'CONFIRMADO' | 'CONCLUIDO' | 'TROCA_SOLICITADA' | 'CANCELADO'
  patientLoad: 'Baixa' | 'Moderada' | 'Alta'
  notes?: string
}

export const MOBILE_DOCTOR_MY_SHIFTS: MobileDoctorMyShift[] = [
  {
    id: 'my-1',
    date: '2026-02-18',
    startTime: '07:00',
    endTime: '19:00',
    sectorName: 'UTI Adulto',
    value: 140000,
    status: 'CONCLUIDO',
    patientLoad: 'Alta',
  },
  {
    id: 'my-2',
    date: '2026-02-19',
    startTime: '19:00',
    endTime: '07:00',
    sectorName: 'Pronto-Socorro',
    value: 150000,
    status: 'CONCLUIDO',
    patientLoad: 'Alta',
  },
  {
    id: 'my-3',
    date: '2026-02-21',
    startTime: '19:00',
    endTime: '07:00',
    sectorName: 'UTI Adulto',
    value: 145000,
    status: 'CONFIRMADO',
    patientLoad: 'Moderada',
  },
  {
    id: 'my-4',
    date: '2026-02-25',
    startTime: '07:00',
    endTime: '19:00',
    sectorName: 'Clínica Médica',
    value: 95000,
    status: 'TROCA_SOLICITADA',
    patientLoad: 'Baixa',
  },
]

export interface MobileDoctorSwapRequest {
  id: string
  direction: 'entrada' | 'saida'
  shiftId: string
  shiftDate: string
  shiftTime: string
  sectorName: string
  counterpartName: string
  reason: string
  status: 'PENDENTE' | 'ACEITA' | 'RECUSADA'
  createdAt: string
}

export const MOBILE_DOCTOR_SWAP_REQUESTS: MobileDoctorSwapRequest[] = [
  {
    id: 'swap-1',
    direction: 'entrada',
    shiftId: 'my-3',
    shiftDate: '2026-02-21',
    shiftTime: '19:00 - 07:00',
    sectorName: 'UTI Adulto',
    counterpartName: 'Dr. Carlos Mendes',
    reason: 'Solicitou troca por sobreposição com congresso.',
    status: 'PENDENTE',
    createdAt: '2026-02-19T14:00:00.000Z',
  },
  {
    id: 'swap-2',
    direction: 'saida',
    shiftId: 'my-4',
    shiftDate: '2026-02-25',
    shiftTime: '07:00 - 19:00',
    sectorName: 'Clínica Médica',
    counterpartName: 'Dra. Bianca Farias',
    reason: 'Solicitação enviada por ajuste pessoal.',
    status: 'PENDENTE',
    createdAt: '2026-02-19T09:30:00.000Z',
  },
]

export interface MobileDoctorInviteCode {
  id: string
  code: string
  sectorName: string
  expiresAt: string
  status: 'ATIVO' | 'UTILIZADO'
}

export const MOBILE_DOCTOR_INVITE_CODES: MobileDoctorInviteCode[] = [
  {
    id: 'inv-1',
    code: 'SG-UTI-2026-ALFA',
    sectorName: 'UTI Adulto',
    expiresAt: '2026-03-10',
    status: 'ATIVO',
  },
  {
    id: 'inv-2',
    code: 'SG-PS-2026-BETA',
    sectorName: 'Pronto-Socorro',
    expiresAt: '2026-03-05',
    status: 'ATIVO',
  },
]
