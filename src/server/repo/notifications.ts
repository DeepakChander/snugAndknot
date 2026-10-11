import 'server-only'
import { query } from '@/server/db/client'
import { iso } from './util'

export interface NotificationRow {
  id: string
  type: string
  subject: string
  toEmail: string
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'skipped' | 'suppressed'
  attempts: number
  error: string | null
  createdAt: string
  sentAt: string | null
}

/** The most recent store notifications, newest first, for the admin's email log. */
export async function listNotifications(limit = 100): Promise<NotificationRow[]> {
  const rows = await query(
    `SELECT id, type, subject, to_email, status, attempts, error, created_at, sent_at FROM notifications ORDER BY created_at DESC LIMIT $1`,
    [limit]
  )
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    subject: r.subject,
    toEmail: r.to_email,
    status: r.status,
    attempts: Number(r.attempts),
    error: r.error ?? null,
    createdAt: iso(r.created_at),
    sentAt: r.sent_at ? iso(r.sent_at) : null,
  }))
}
