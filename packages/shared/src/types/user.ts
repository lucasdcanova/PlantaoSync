export type UserRole = 'ADMIN' | 'MANAGER' | 'PROFESSIONAL'

export interface User {
  id: string
  organizationId: string
  name: string
  email: string
  role: UserRole
  crm?: string
  specialty?: string
  phone?: string
  avatarUrl?: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

export interface AuthTokens {
  accessToken: string
  expiresIn: number
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  organizationName: string
  organizationSlug?: string
  phone?: string
}
