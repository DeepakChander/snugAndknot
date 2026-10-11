import { EmailsAdmin } from '@/components/admin/EmailsAdmin'
import { listNotifications } from '@/server/repo/notifications'
import { getSettings } from '@/server/repo/settings'
import { mailConfig } from '@/server/mail'
import { notifyRecipient } from '@/server/notify'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Emails' }

export default async function AdminEmails() {
  await requireAdminPage()
  const [rows, settings] = await Promise.all([listNotifications(), getSettings()])
  const cfg = mailConfig()
  // Where the inbox address comes from: an environment variable cannot be changed from the panel.
  const source = process.env.NOTIFY_EMAIL?.trim() ? 'NOTIFY_EMAIL' : cfg?.inbox ? 'GMAIL_USER' : 'settings'
  return (
    <EmailsAdmin
      rows={rows}
      configured={cfg !== null}
      server={cfg?.label ?? null}
      from={cfg?.from ?? null}
      recipient={notifyRecipient(settings.store.email)}
      recipientSource={source}
    />
  )
}
