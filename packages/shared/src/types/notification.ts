export type NotificationType =
  | 'SHIFT_AVAILABLE'
  | 'SHIFT_CONFIRMED'
  | 'SHIFT_CANCELLED'
  | 'SCHEDULE_PUBLISHED'
  | 'SCHEDULE_UPDATED'
  | 'PAYMENT_RECEIVED'
  | 'SYSTEM'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown>
  readAt?: string
  sentAt?: string
  createdAt: string
}
