import type { Schedule } from '@agendaplantao/shared'
import type { AuthUser } from '@/store/auth.store'

export const DEMO_MANAGER_EMAIL = 'gestor@demo.com'
export const DEMO_MANAGER_PASSWORD = 'Senha@123'
export const DEMO_MANAGER_ACCESS_TOKEN = 'demo-manager-access-token'

export const DEMO_MANAGER_USER: AuthUser = {
  id: 'demo-user-1',
  name: 'Gestor Demo',
  email: DEMO_MANAGER_EMAIL,
  role: 'ADMIN',
  organizationId: 'org-demo',
  organization: {
    id: 'org-demo',
    name: 'Hospital São Gabriel',
    slug: 'hospital-sao-gabriel',
    subscription: {
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      trialEndsAt: '2026-12-31',
    },
  },
}

export const DEMO_DOCTOR_EMAIL = 'medico@demo.com'
export const DEMO_DOCTOR_PASSWORD = 'Senha@123'
export const DEMO_DOCTOR_ACCESS_TOKEN = 'demo-doctor-access-token'

export const DEMO_DOCTOR_USER: AuthUser = {
  id: 'demo-doctor-1',
  name: 'Dra. Ana Costa',
  email: DEMO_DOCTOR_EMAIL,
  role: 'PROFESSIONAL',
  organizationId: 'org-demo',
  organization: {
    id: 'org-demo',
    name: 'Hospital São Gabriel',
    slug: 'hospital-sao-gabriel',
    subscription: {
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      trialEndsAt: '2026-12-31',
    },
  },
}

export const DEMO_EMAIL = DEMO_MANAGER_EMAIL
export const DEMO_PASSWORD = DEMO_MANAGER_PASSWORD
export const DEMO_ACCESS_TOKEN = DEMO_MANAGER_ACCESS_TOKEN
export const DEMO_USER = DEMO_MANAGER_USER

export function isManagerDemoCredential(email: string, password: string) {
  return email.trim().toLowerCase() === DEMO_MANAGER_EMAIL && password === DEMO_MANAGER_PASSWORD
}

export function isDoctorDemoCredential(email: string, password: string) {
  return email.trim().toLowerCase() === DEMO_DOCTOR_EMAIL && password === DEMO_DOCTOR_PASSWORD
}

export function isDemoCredential(email: string, password: string) {
  return isManagerDemoCredential(email, password) || isDoctorDemoCredential(email, password)
}

export const DEMO_SCHEDULES: Schedule[] = [
  {
    id: '1',
    organizationId: 'org-demo',
    locationId: 'loc-uti',
    title: 'Cobertura UTI Adulto - Fevereiro 2026',
    description: 'Cobertura crítica com reforço em fins de semana e troca rápida de plantonistas.',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'PUBLISHED',
    publishedAt: '2026-01-28',
    createdAt: '2026-01-24',
    updatedAt: '2026-01-30',
    location: { id: 'loc-uti', name: 'UTI Adulto' },
  },
  {
    id: '2',
    organizationId: 'org-demo',
    locationId: 'loc-ps',
    title: 'Cobertura Pronto-Socorro - Fevereiro 2026',
    description: 'Escala com janela de resposta rápida para picos de demanda no período noturno.',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'PUBLISHED',
    publishedAt: '2026-01-30',
    createdAt: '2026-01-26',
    updatedAt: '2026-01-30',
    location: { id: 'loc-ps', name: 'Pronto-Socorro' },
  },
  {
    id: '3',
    organizationId: 'org-demo',
    locationId: 'loc-uti',
    title: 'Cobertura UTI Adulto - Planejamento Março 2026',
    description: 'Planejamento antecipado com parâmetros de risco para evitar descoberturas.',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'DRAFT',
    createdAt: '2026-02-10',
    updatedAt: '2026-02-10',
    location: { id: 'loc-uti', name: 'UTI Adulto' },
  },
  {
    id: '4',
    organizationId: 'org-demo',
    locationId: 'loc-clinica',
    title: 'Cobertura Clínica Médica - Janeiro 2026',
    description: 'Mês concluído com aderência de cobertura acima da meta contratual.',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    status: 'CLOSED',
    publishedAt: '2025-12-27',
    createdAt: '2025-12-20',
    updatedAt: '2026-02-02',
    location: { id: 'loc-clinica', name: 'Clínica Médica' },
  },
]

export function getDemoScheduleById(id: string) {
  return DEMO_SCHEDULES.find((schedule) => schedule.id === id) ?? null
}

export interface DemoDashboardStats {
  totalProfessionals: number
  activeSchedules: number
  confirmedThisWeek: number
  pendingConfirmations: number
  monthlyCost: number
  occupancyRate: number
}

export const DEMO_DASHBOARD_STATS: DemoDashboardStats = {
  totalProfessionals: 38,
  activeSchedules: 4,
  confirmedThisWeek: 31,
  pendingConfirmations: 7,
  monthlyCost: 148_920_00,
  occupancyRate: 91,
}

export interface DemoActivityItem {
  id: string
  type: 'confirmation' | 'schedule' | 'alert'
  message: string
  time: Date
}

export const DEMO_RECENT_ACTIVITY: DemoActivityItem[] = [
  {
    id: '1',
    type: 'confirmation',
    message: 'Dra. Ana Costa confirmou cobertura na UTI Adulto (turno da noite).',
    time: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    id: '2',
    type: 'schedule',
    message: 'Escala mensal da Clínica Médica foi publicada para validação final.',
    time: new Date(Date.now() - 28 * 60 * 1000),
  },
  {
    id: '3',
    type: 'confirmation',
    message: 'Dr. Carlos Mendes assumiu plantão de reforço no Pronto-Socorro.',
    time: new Date(Date.now() - 80 * 60 * 1000),
  },
  {
    id: '4',
    type: 'alert',
    message: 'Turno de 22/02 em UTI Neonatal ainda exige uma confirmação crítica.',
    time: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
  },
]

export interface DemoProfessional {
  id: string
  userId: string
  name: string
  email: string
  phone?: string
  crm: string
  specialty: string
  status: 'Ativo' | 'Em cobertura' | 'Indisponível'
  hospitalStatus: 'ATIVO' | 'REMOVIDO'
  acceptanceRate: number
  completedShifts: number
  nextAvailability: string
  lastShiftAt?: string
  locations: string[]
}

export const DEMO_PROFESSIONALS: DemoProfessional[] = [
  {
    id: 'pro-1',
    userId: 'demo-doctor-1',
    name: 'Dra. Ana Costa',
    email: DEMO_DOCTOR_EMAIL,
    phone: '(11) 99123-4567',
    crm: 'CRM-SP 123456',
    specialty: 'Intensivista',
    status: 'Em cobertura',
    hospitalStatus: 'ATIVO',
    acceptanceRate: 96,
    completedShifts: 28,
    nextAvailability: '20/02/2026 19:00',
    lastShiftAt: '2026-02-19',
    locations: ['UTI Adulto', 'UTI Cardiológica'],
  },
  {
    id: 'pro-2',
    userId: 'doctor-demo-2',
    name: 'Dr. Carlos Mendes',
    email: 'carlos.mendes@hospital.demo',
    phone: '(11) 98876-1200',
    crm: 'CRM-SP 224411',
    specialty: 'Clínica Médica',
    status: 'Ativo',
    hospitalStatus: 'ATIVO',
    acceptanceRate: 91,
    completedShifts: 24,
    nextAvailability: '20/02/2026 07:00',
    lastShiftAt: '2026-02-17',
    locations: ['Clínica Médica', 'Pronto-Socorro'],
  },
  {
    id: 'pro-3',
    userId: 'doctor-demo-3',
    name: 'Dra. Bianca Farias',
    email: 'bianca.farias@hospital.demo',
    phone: '(11) 99711-9880',
    crm: 'CRM-SP 778899',
    specialty: 'Emergência',
    status: 'Ativo',
    hospitalStatus: 'ATIVO',
    acceptanceRate: 94,
    completedShifts: 31,
    nextAvailability: '20/02/2026 13:00',
    lastShiftAt: '2026-02-20',
    locations: ['Pronto-Socorro'],
  },
  {
    id: 'pro-4',
    userId: 'doctor-demo-4',
    name: 'Dr. Felipe Rocha',
    email: 'felipe.rocha@hospital.demo',
    phone: '(11) 99643-2211',
    crm: 'CRM-SP 332211',
    specialty: 'Anestesiologia',
    status: 'Indisponível',
    hospitalStatus: 'ATIVO',
    acceptanceRate: 88,
    completedShifts: 19,
    nextAvailability: '21/02/2026 07:00',
    lastShiftAt: '2025-10-28',
    locations: ['Centro Cirúrgico', 'UTI Adulto'],
  },
]

export interface DemoLocation {
  id: string
  name: string
  criticality: 'Alta' | 'Média' | 'Baixa'
  occupancyRate: number
  pendingShifts: number
  activeProfessionals: number
  monthlyCost: number
}

export const DEMO_LOCATIONS: DemoLocation[] = [
  {
    id: 'loc-uti',
    name: 'UTI Adulto',
    criticality: 'Alta',
    occupancyRate: 94,
    pendingShifts: 2,
    activeProfessionals: 12,
    monthlyCost: 58_400_00,
  },
  {
    id: 'loc-ps',
    name: 'Pronto-Socorro',
    criticality: 'Alta',
    occupancyRate: 89,
    pendingShifts: 3,
    activeProfessionals: 10,
    monthlyCost: 46_780_00,
  },
  {
    id: 'loc-clinica',
    name: 'Clínica Médica',
    criticality: 'Média',
    occupancyRate: 93,
    pendingShifts: 1,
    activeProfessionals: 9,
    monthlyCost: 31_120_00,
  },
  {
    id: 'loc-centro-cir',
    name: 'Centro Cirúrgico',
    criticality: 'Média',
    occupancyRate: 86,
    pendingShifts: 1,
    activeProfessionals: 7,
    monthlyCost: 28_600_00,
  },
]

export interface DemoReportMetric {
  label: string
  value: string
  context: string
}

export const DEMO_REPORT_METRICS: DemoReportMetric[] = [
  {
    label: 'Cobertura Média',
    value: '91%',
    context: 'Últimos 30 dias',
  },
  {
    label: 'Tempo Médio de Confirmação',
    value: '14 min',
    context: 'Convocação até aceite',
  },
  {
    label: 'Risco Crítico Aberto',
    value: '3 turnos',
    context: 'Monitoramento ativo',
  },
  {
    label: 'Custo por Plantão',
    value: 'R$ 1.248',
    context: 'Média consolidada',
  },
]

export const DEMO_REPORT_HIGHLIGHTS = [
  'UTI Adulto mantém cobertura acima de 93% em todos os turnos críticos.',
  'Pronto-Socorro reduziu tempo de confirmação em 18% no comparativo mensal.',
  'Escala de Clínica Médica fechou o mês com zero ruptura assistencial.',
  'Meses com alerta antecipado tiveram 27% menos cancelamentos de última hora.',
]

export interface DemoMonthlyDoctorReportRow {
  professionalId: string
  name: string
  phone: string
  daysWorked: number
  totalHours: number
  shiftsCount: number
  fixedCoverageRate: number
  lastShiftAt: string
}

export const DEMO_MONTHLY_DOCTOR_REPORT: DemoMonthlyDoctorReportRow[] = [
  {
    professionalId: 'pro-1',
    name: 'Dra. Ana Costa',
    phone: '(11) 99123-4567',
    daysWorked: 18,
    totalHours: 192,
    shiftsCount: 16,
    fixedCoverageRate: 74,
    lastShiftAt: '2026-02-19',
  },
  {
    professionalId: 'pro-2',
    name: 'Dr. Carlos Mendes',
    phone: '(11) 98876-1200',
    daysWorked: 14,
    totalHours: 144,
    shiftsCount: 12,
    fixedCoverageRate: 58,
    lastShiftAt: '2026-02-17',
  },
  {
    professionalId: 'pro-3',
    name: 'Dra. Bianca Farias',
    phone: '(11) 99711-9880',
    daysWorked: 16,
    totalHours: 168,
    shiftsCount: 14,
    fixedCoverageRate: 67,
    lastShiftAt: '2026-02-20',
  },
  {
    professionalId: 'pro-4',
    name: 'Dr. Felipe Rocha',
    phone: '(11) 99643-2211',
    daysWorked: 2,
    totalHours: 24,
    shiftsCount: 2,
    fixedCoverageRate: 11,
    lastShiftAt: '2025-10-28',
  },
]

export interface DemoFinancialMonth {
  id: string
  month: string
  projectedCost: number
  confirmedCost: number
  paidCost: number
  variance: number
  status: 'Em fechamento' | 'Fechado' | 'Em análise'
}

export const DEMO_FINANCIAL_MONTHS: DemoFinancialMonth[] = [
  {
    id: 'fin-1',
    month: 'Fevereiro/2026',
    projectedCost: 148_920_00,
    confirmedCost: 143_600_00,
    paidCost: 126_200_00,
    variance: -5_320_00,
    status: 'Em fechamento',
  },
  {
    id: 'fin-2',
    month: 'Janeiro/2026',
    projectedCost: 139_450_00,
    confirmedCost: 141_180_00,
    paidCost: 141_180_00,
    variance: 1_730_00,
    status: 'Fechado',
  },
  {
    id: 'fin-3',
    month: 'Dezembro/2025',
    projectedCost: 133_870_00,
    confirmedCost: 132_910_00,
    paidCost: 132_910_00,
    variance: -960_00,
    status: 'Fechado',
  },
]

export const DEMO_NOTIFICATION_RULES = [
  { id: 'notif-1', name: 'Alerta de risco crítico', channel: 'Push + E-mail', status: 'Ativo' },
  {
    id: 'notif-2',
    name: 'Convocação sem resposta (15 min)',
    channel: 'Push + SMS',
    status: 'Ativo',
  },
  { id: 'notif-3', name: 'Resumo diário da cobertura', channel: 'E-mail', status: 'Ativo' },
  { id: 'notif-4', name: 'Lembrete de fechamento financeiro', channel: 'E-mail', status: 'Ativo' },
]

export const DEMO_ACCESS_PROFILES = [
  { id: 'profile-1', role: 'Direção Clínica', members: 4, scope: 'Todas as unidades' },
  { id: 'profile-2', role: 'Coordenação de Escala', members: 9, scope: 'UTI + Pronto-Socorro' },
  { id: 'profile-3', role: 'Financeiro', members: 3, scope: 'Relatórios e fechamento' },
  { id: 'profile-4', role: 'Compliance', members: 2, scope: 'Trilha de auditoria' },
]

export const DEMO_SUBSCRIPTION = {
  planName: 'Enterprise Assistencial',
  status: 'Ativo',
  renewalDate: '31/03/2026',
  limits: {
    professionals: 60,
    locations: 20,
    managers: 18,
  },
  usage: {
    professionals: 38,
    locations: 8,
    managers: 12,
  },
  support: 'Suporte prioritário 24/7 + especialista dedicado',
}

export interface DemoDoctorSector {
  id: string
  name: string
  floor: string
  openShifts: number
  nextCriticalWindow: string
  skills: string[]
}

export const DEMO_DOCTOR_SECTORS: DemoDoctorSector[] = [
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

export interface DemoDoctorShiftOpportunity {
  id: string
  sectorId: string
  sectorName: string
  date: string
  startTime: string
  endTime: string
  specialty: string
  value: number
  slotsLeft: number
  issuedBy: string
}

export const DEMO_DOCTOR_AVAILABLE_SHIFTS: DemoDoctorShiftOpportunity[] = [
  {
    id: 'op-1',
    sectorId: 'sec-uti-adulto',
    sectorName: 'UTI Adulto',
    date: '2026-02-20',
    startTime: '19:00',
    endTime: '07:00',
    specialty: 'Medicina Intensiva',
    value: 145_000,
    slotsLeft: 1,
    issuedBy: 'Coordenação UTI',
  },
  {
    id: 'op-2',
    sectorId: 'sec-ps',
    sectorName: 'Pronto-Socorro',
    date: '2026-02-21',
    startTime: '07:00',
    endTime: '19:00',
    specialty: 'Emergência',
    value: 135_000,
    slotsLeft: 2,
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
    value: 92_000,
    slotsLeft: 1,
    issuedBy: 'Coordenação Clínica',
  },
  {
    id: 'op-4',
    sectorId: 'sec-uti-adulto',
    sectorName: 'UTI Adulto',
    date: '2026-02-24',
    startTime: '07:00',
    endTime: '19:00',
    specialty: 'Medicina Intensiva',
    value: 140_000,
    slotsLeft: 1,
    issuedBy: 'Coordenação UTI',
  },
  {
    id: 'op-5',
    sectorId: 'sec-neonatal',
    sectorName: 'UTI Neonatal',
    date: '2026-02-23',
    startTime: '19:00',
    endTime: '07:00',
    specialty: 'Neonatologia',
    value: 155_000,
    slotsLeft: 1,
    issuedBy: 'Coordenação Neo',
  },
]

export interface DemoDoctorMyShift {
  id: string
  professionalId: string
  professionalUserId: string
  sectorId: string
  date: string
  startTime: string
  endTime: string
  sectorName: string
  specialty: string
  status: 'CONFIRMADO' | 'CONCLUIDO' | 'TROCA_SOLICITADA' | 'CANCELADO'
  value: number
  patientLoad: 'Baixa' | 'Moderada' | 'Alta'
  notes?: string
}

export const DEMO_DOCTOR_MY_SHIFTS: DemoDoctorMyShift[] = [
  {
    id: 'my-1',
    professionalId: 'pro-1',
    professionalUserId: 'demo-doctor-1',
    sectorId: 'sec-uti-adulto',
    date: '2026-02-18',
    startTime: '07:00',
    endTime: '19:00',
    sectorName: 'UTI Adulto',
    specialty: 'Medicina Intensiva',
    status: 'CONCLUIDO',
    value: 140_000,
    patientLoad: 'Alta',
    notes: 'Passagem de plantão concluída sem intercorrências críticas.',
  },
  {
    id: 'my-2',
    professionalId: 'pro-1',
    professionalUserId: 'demo-doctor-1',
    sectorId: 'sec-ps',
    date: '2026-02-19',
    startTime: '19:00',
    endTime: '07:00',
    sectorName: 'Pronto-Socorro',
    specialty: 'Emergência',
    status: 'CONCLUIDO',
    value: 150_000,
    patientLoad: 'Alta',
  },
  {
    id: 'my-3',
    professionalId: 'pro-1',
    professionalUserId: 'demo-doctor-1',
    sectorId: 'sec-uti-adulto',
    date: '2026-02-21',
    startTime: '19:00',
    endTime: '07:00',
    sectorName: 'UTI Adulto',
    specialty: 'Medicina Intensiva',
    status: 'CONFIRMADO',
    value: 145_000,
    patientLoad: 'Moderada',
  },
  {
    id: 'my-4',
    professionalId: 'pro-1',
    professionalUserId: 'demo-doctor-1',
    sectorId: 'sec-clinica',
    date: '2026-02-25',
    startTime: '07:00',
    endTime: '19:00',
    sectorName: 'Clínica Médica',
    specialty: 'Clínica Médica',
    status: 'TROCA_SOLICITADA',
    value: 95_000,
    patientLoad: 'Baixa',
  },
]

export interface DemoDoctorSwapRequest {
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

export const DEMO_DOCTOR_SWAP_REQUESTS: DemoDoctorSwapRequest[] = [
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
  {
    id: 'swap-3',
    direction: 'entrada',
    shiftId: 'my-2',
    shiftDate: '2026-02-19',
    shiftTime: '19:00 - 07:00',
    sectorName: 'Pronto-Socorro',
    counterpartName: 'Dr. Felipe Rocha',
    reason: 'Troca confirmada pela coordenação.',
    status: 'ACEITA',
    createdAt: '2026-02-15T10:10:00.000Z',
  },
]

export interface DemoDoctorInviteCode {
  id: string
  code: string
  sectorName: string
  expiresAt: string
  issuedBy: string
  status: 'ATIVO' | 'UTILIZADO'
}

export const DEMO_DOCTOR_INVITE_CODES: DemoDoctorInviteCode[] = [
  {
    id: 'inv-1',
    code: 'SG-UTI-2026-ALFA',
    sectorName: 'UTI Adulto',
    expiresAt: '2026-03-10',
    issuedBy: 'Gestor Demo',
    status: 'ATIVO',
  },
  {
    id: 'inv-2',
    code: 'SG-PS-2026-BETA',
    sectorName: 'Pronto-Socorro',
    expiresAt: '2026-03-05',
    issuedBy: 'Gestor Demo',
    status: 'ATIVO',
  },
  {
    id: 'inv-3',
    code: 'SG-CLINICA-2026-GAMMA',
    sectorName: 'Clínica Médica',
    expiresAt: '2026-02-28',
    issuedBy: 'Gestor Demo',
    status: 'UTILIZADO',
  },
]
