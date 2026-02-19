import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatRelative, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(valueInCents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100)
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ptBR })
}

export function formatDateRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatRelative(d, new Date(), { locale: ptBR })
}

export function formatShiftTime(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export const SHIFT_STATUS_CONFIG = {
  DRAFT:     { label: 'Rascunho',   color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  PUBLISHED: { label: 'Publicada',  color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  CLOSED:    { label: 'Encerrada', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  ARCHIVED:  { label: 'Arquivada', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500' },
}

export const CONFIRMATION_STATUS_CONFIG = {
  PENDING:   { label: 'Pendente',   color: 'bg-amber-100 text-amber-700' },
  ACCEPTED:  { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  REJECTED:  { label: 'Recusado',   color: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancelado',  color: 'bg-slate-100 text-slate-600' },
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN:        'Administrador',
  MANAGER:      'Gestor',
  PROFESSIONAL: 'Profissional',
}
