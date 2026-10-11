'use client'

import { Badge, Btn, Card, PageHeader, useMutate } from './ui'
import type { NotificationRow } from '@/server/repo/notifications'

const TONE = { sent: 'good', failed: 'bad', pending: 'info', sending: 'info', skipped: 'warn', suppressed: 'warn' } as const

export function EmailsAdmin({
  rows,
  configured,
  server,
  from,
  recipient,
  recipientSource,
}: {
  rows: NotificationRow[]
  configured: boolean
  server: string | null
  from: string | null
  recipient: string
  recipientSource: 'NOTIFY_EMAIL' | 'GMAIL_USER' | 'settings'
}) {
  const { run, busy } = useMutate()
  const counts = rows.reduce<Record<string, number>>((c, r) => ((c[r.status] = (c[r.status] ?? 0) + 1), c), {})
  return (
    <>
      <PageHeader
        title="Emails"
        description="Every order, return, review, message, stock and security event is emailed to the store inbox. This is the log of the latest ones (kept for 90 days)."
        actions={
          <Btn loading={busy} onClick={() => run('POST', '/api/admin/notifications/test', undefined, configured ? 'Test email sent — check the inbox.' : 'Recorded, but mail is not set up yet.')}>
            Send test email
          </Btn>
        }
      />
      <Card title="Mail setup" className="mb-6">
        {configured ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="text-stone">Status</dt>
            <dd><Badge tone="good">Sending</Badge></dd>
            <dt className="text-stone">Notices go to</dt>
            <dd>
              {recipient}
              {recipientSource === 'settings' ? (
                <span className="mt-1 block text-xs text-stone">
                  Follows Settings → Store email. Set <code className="font-mono">NOTIFY_EMAIL</code> in the hosting environment to fix it, so a change in the panel cannot redirect these emails.
                </span>
              ) : (
                <span className="mt-1 block text-xs text-stone">
                  From <code className="font-mono">{recipientSource}</code>; the panel cannot change it.
                </span>
              )}
            </dd>
            <dt className="text-stone">Sent from</dt>
            <dd>{from}</dd>
            <dt className="text-stone">Sent through</dt>
            <dd className="font-mono text-xs">{server}</dd>
            <dt className="text-stone">Limits</dt>
            <dd className="text-xs text-stone">
              Emails visitors can trigger (messages, sign-ups, sign-ins, reviews, stock requests, tracking) are capped per hour; extra ones show here as suppressed. Orders, returns and admin events are never capped. Discount codes tried in the cart are not emailed; a code used on an order shows in its order email.
            </dd>
          </dl>
        ) : (
          <div className="space-y-2 text-sm">
            <p><Badge tone="warn">Not set up</Badge> Notices are recorded below but not emailed yet.</p>
            <p className="text-stone">
              To send from a Gmail account, add <code className="font-mono">GMAIL_USER</code>, <code className="font-mono">GMAIL_CLIENT_ID</code>, <code className="font-mono">GMAIL_CLIENT_SECRET</code> and <code className="font-mono">GMAIL_REFRESH_TOKEN</code> in the hosting environment variables, then redeploy. Any other mailbox works over SMTP with <code className="font-mono">SMTP_HOST</code>, <code className="font-mono">SMTP_PORT</code>, <code className="font-mono">SMTP_USER</code> and <code className="font-mono">SMTP_PASS</code>.
            </p>
          </div>
        )}
      </Card>
      <Card title={`Latest ${rows.length}`} actions={<span className="text-xs text-stone">{Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(' · ')}</span>} pad={false}>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-stone">
                <tr>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Subject</th>
                  <th className="px-5 py-3 font-medium">Event</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-ink/5 align-top">
                    <td className="whitespace-nowrap px-5 py-3 text-xs text-stone">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="min-w-[18rem] px-5 py-3">{r.subject}</td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-stone">{r.type}</td>
                    <td className="px-5 py-3">
                      <Badge tone={TONE[r.status]}>{r.status}</Badge>
                      {r.error ? <p className="mt-1 max-w-[16rem] text-xs text-error">{r.error}</p> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm text-stone">Nothing yet. The first order, message or sign-up will appear here.</p>
        )}
      </Card>
    </>
  )
}
