import { format, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ScheduleStatus } from '@agendaplantao/shared'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string | Date, dateFormat = 'dd/MM/yyyy') {
  const parsed = value instanceof Date ? value : parseISO(value)
  if (!isValid(parsed)) return 'Data inválida'
  return format(parsed, dateFormat, { locale: ptBR })
}

export function formatCurrency(valueInCents: number, currency = 'BRL') {
  if (!Number.isFinite(valueInCents)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(valueInCents / 100)
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

type StatusStyle = {
  label: string
  color: string
}

export const SHIFT_STATUS_CONFIG: Record<ScheduleStatus, StatusStyle> = {
  DRAFT: {
    label: 'Rascunho',
    color:
      'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
  },
  PUBLISHED: {
    label: 'Publicada',
    color:
      'border border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-900 dark:bg-brand-900/30 dark:text-brand-300',
  },
  CLOSED: {
    label: 'Fechada',
    color:
      'border border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30 dark:text-green-300',
  },
  ARCHIVED: {
    label: 'Arquivada',
    color:
      'border border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300',
  },
}
