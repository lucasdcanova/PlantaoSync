import type { Plan } from '@prisma/client'

// ─── Planos ───────────────────────────────────────────────────────────────────

export interface PlanLimits {
  professionals: number
  locations: number
  managers: number
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  BASIC:      { professionals: 15, locations: 1, managers: 2 },
  PREMIUM:    { professionals: 30, locations: 2, managers: 3 },
  ENTERPRISE: { professionals: 100, locations: 8, managers: 10 },
}

export const PLAN_PRICES: Record<Plan, Record<string, number>> = {
  BASIC:      { MONTHLY: 16990, QUARTERLY: 16141, ANNUAL: 14951 },
  PREMIUM:    { MONTHLY: 27900, QUARTERLY: 26505, ANNUAL: 24552 },
  ENTERPRISE: { MONTHLY: 61900, QUARTERLY: 58805, ANNUAL: 54472 },
}

export const TRIAL_DAYS = 7
export const MONEY_BACK_DAYS = 30

// ─── Data helpers ─────────────────────────────────────────────────────────────

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function subMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() - months)
  return d
}
