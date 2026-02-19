export type Plan = 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'

export interface Organization {
  id: string
  name: string
  slug: string
  logoUrl?: string
  cnpj?: string
  phone?: string
  createdAt: string
  subscription?: Subscription
}

export interface Subscription {
  id: string
  organizationId: string
  plan: Plan
  billingCycle: BillingCycle
  status: SubscriptionStatus
  trialEndsAt?: string
  currentPeriodEnd?: string
}

export interface Location {
  id: string
  organizationId: string
  name: string
  address?: string
  city?: string
  state?: string
  isActive: boolean
  createdAt: string
}

export interface PlanLimits {
  professionals: number
  locations: number
  managers: number
}
