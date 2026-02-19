import type { Plan, PlanLimits } from '../types/organization.js'

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  BASIC: {
    professionals: 15,
    locations: 1,
    managers: 2,
  },
  PREMIUM: {
    professionals: 30,
    locations: 2,
    managers: 3,
  },
  ENTERPRISE: {
    professionals: 100,
    locations: 8,
    managers: 10,
  },
}

export const PLAN_PRICES = {
  BASIC: {
    MONTHLY: 16990,   // R$ 169,90 in cents
    QUARTERLY: 16141, // 5% off
    ANNUAL: 14951,    // 12% off
  },
  PREMIUM: {
    MONTHLY: 27900,
    QUARTERLY: 26505,
    ANNUAL: 24552,
  },
  ENTERPRISE: {
    MONTHLY: 61900,
    QUARTERLY: 58805,
    ANNUAL: 54472,
  },
} satisfies Record<Plan, Record<string, number>>

export const TRIAL_DAYS = 7
export const MONEY_BACK_DAYS = 30
