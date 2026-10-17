'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useMoney } from '@/components/providers/SettingsProvider'
import { Stars } from '@/components/kit/Stars'
import { Badge, Btn, Card, Empty, Input, PageHeader, Select, STATUS_TONE, Textarea, Toggle, confirmAction, useMutate } from './ui'
import { cn, formatDate, TIER_LABEL } from '@/lib/format'
import type { ReviewSource, ReviewStatus } from '@/types/commerce'
import { SOURCE_LABEL } from '@/lib/review-source'

type AdminReview = {
  id: string
  productTitle: string
  productHandle: string
  author: string
  email: string | null
  rating: number
  title: string
  body: string
  fit: string | null
  verified: boolean
  status: ReviewStatus
  source: ReviewSource
  helpful: number
  adminReply: string | null
  createdAt: string
}

function ReviewCard({ r }: { r: AdminReview }) {
  const { run, busy } = useMutate()
  const [reply, setReply] = useState(r.adminReply ?? '')
  const [replying, setReplying] = useState(false)
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Stars value={r.rating} size={14} />
            <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
            {r.verified ? <Badge tone="good">verified buyer</Badge> : null}
            {r.source !== 'site' ? <Badge tone="info">received {SOURCE_LABEL[r.source]}</Badge> : null}
          </div>
          <p className="mt-2 font-medium">{r.title}</p>
          <p className="mt-1 max-w-3xl whitespace-pre-line text-sm text-ink/80">{r.body}</p>
          <p className="mt-2 text-xs text-stone">
            {r.author}
            {r.email ? ` · ${r.email}` : ''} · {formatDate(r.createdAt)} on{' '}
            <a href={`/product/${r.productHandle}#reviews`} target="_blank" rel="noreferrer" className="underline">
              {r.productTitle}
            </a>
            {r.fit ? ` · fit: ${r.fit === 'true' ? 'true to size' : `runs ${r.fit}`}` : ''} · {r.helpful} helpful
          </p>
          {r.adminReply && !replying ? <p className="mt-3 rounded-lg border-l-2 border-gold bg-gold/10 p-2 text-sm">Reply: {r.adminReply}</p> : null}
        </div>
      </div>
      {replying ? (
        <div className="mt-4">
          <Textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="A public reply from the shop" />
          <div className="mt-2 flex gap-2">
            <Btn size="sm" loading={busy} onClick={async () => (await run('PATCH', `/api/admin/reviews/${r.id}`, { adminReply: reply.trim() || null }, reply.trim() ? 'Reply published.' : 'Reply removed.')) && setReplying(false)}>
              Save reply
            </Btn>
            <Btn size="sm" variant="ghost" onClick={() => setReplying(false)}>
              Cancel
            </Btn>
          </div>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
        {r.status !== 'approved' ? (
          <Btn size="sm" loading={busy} onClick={() => run('PATCH', `/api/admin/reviews/${r.id}`, { status: 'approved' }, 'Review approved — it is now live.')}>
            Approve
          </Btn>
        ) : null}
        {r.status !== 'rejected' ? (
          <Btn size="sm" variant="outline" loading={busy} onClick={() => run('PATCH', `/api/admin/reviews/${r.id}`, { status: 'rejected' }, r.status === 'approved' ? 'Review hidden.' : 'Review rejected.')}>
            {r.status === 'approved' ? 'Hide' : 'Reject'}
          </Btn>
        ) : null}
        <Btn size="sm" variant="ghost" onClick={() => setReplying(true)}>
          {r.adminReply ? 'Edit reply' : 'Reply'}
        </Btn>
        <Btn size="sm" variant="danger" className="ml-auto" loading={busy} onClick={() => confirmAction('Delete this review permanently?') && run('DELETE', `/api/admin/reviews/${r.id}`, undefined, 'Review deleted.')}>
          Delete
        </Btn>
      </div>
    </Card>
  )
}

const today = () => new Date().toISOString().slice(0, 10)

/**
 * Add a review you received: real feedback a customer gave off the site (a WhatsApp message, an
 * Instagram comment, a marketplace review), shown with where it came from and never as a verified
 * buyer. Needs the customer's agreement before it can be saved.
 */
function AddReceivedReview({ products }: { products: { id: string; title: string }[] }) {
  const { run, busy, fieldErrors } = useMutate()
  const blank = { productId: products[0]?.id ?? '', author: '', rating: 5, title: '', body: '', fit: '' as '' | 'small' | 'true' | 'large', source: 'whatsapp' as Exclude<ReviewSource, 'site'>, receivedOn: today(), consent: false }
  const [d, setD] = useState(blank)
  const [open, setOpen] = useState(false)
  const set = (patch: Partial<typeof d>) => setD({ ...d, ...patch })
  const save = async () => {
    const res = await run('POST', '/api/admin/reviews', { ...d, fit: d.fit || null, receivedOn: d.receivedOn || null }, 'Review added: it is live on the store')
    if (res) {
      setD(blank)
      setOpen(false)
    }
  }
  if (!open) {
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-ink/20 p-4">
        <p className="text-sm text-stone">Got kind words on WhatsApp, Instagram or a marketplace? Add them here with the customer&apos;s agreement.</p>
        <Btn onClick={() => setOpen(true)} disabled={!products.length}>
          Add a review you received
        </Btn>
      </div>
    )
  }
  return (
    <Card title="Add a review you received" className="mb-6">
      <div className="space-y-4">
        <p className="text-sm text-stone">
          Use the customer&apos;s own words, as they sent them. It goes live straight away, marked with where it came from (for example &ldquo;via WhatsApp&rdquo;), and never shows the Verified buyer badge, which is only for
          orders delivered through the site.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Piece" value={d.productId} error={fieldErrors.productId} onChange={(e) => set({ productId: e.target.value })}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </Select>
          <Input label="Customer's name" value={d.author} maxLength={60} error={fieldErrors.author} onChange={(e) => set({ author: e.target.value })} placeholder="Priya S." hint="First name and an initial is enough." />
          <Select label="Stars" value={String(d.rating)} error={fieldErrors.rating} onChange={(e) => set({ rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {'★'.repeat(n)}
                {'☆'.repeat(5 - n)} ({n})
              </option>
            ))}
          </Select>
          <Select label="Where it came from" value={d.source} error={fieldErrors.source} onChange={(e) => set({ source: e.target.value as typeof d.source })}>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="marketplace">A marketplace (Amazon, Myntra …)</option>
            <option value="email">Email</option>
            <option value="in-person">In person</option>
          </Select>
          <Input label="Date they sent it" type="date" max={today()} value={d.receivedOn} error={fieldErrors.receivedOn} onChange={(e) => set({ receivedOn: e.target.value })} />
          <Select label="Fit (optional)" value={d.fit} onChange={(e) => set({ fit: e.target.value as typeof d.fit })}>
            <option value="">Not mentioned</option>
            <option value="small">Runs small</option>
            <option value="true">True to size</option>
            <option value="large">Runs large</option>
          </Select>
        </div>
        <Input label="Title (optional)" value={d.title} maxLength={120} error={fieldErrors.title} onChange={(e) => set({ title: e.target.value })} placeholder="Perfect fit" />
        <Textarea label="What they said" rows={4} value={d.body} error={fieldErrors.body} onChange={(e) => set({ body: e.target.value })} placeholder="Paste the customer's message" />
        <Toggle checked={d.consent} onChange={(v) => set({ consent: v })} label="The customer agreed to have this shown on the store" description={fieldErrors.consent ?? 'Ask them first, for example in the same WhatsApp chat.'} />
        <div className="flex flex-wrap gap-2">
          <Btn onClick={save} loading={busy} disabled={!d.consent || !d.author.trim() || d.body.trim().length < 10}>
            Add the review
          </Btn>
          <Btn variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Btn>
        </div>
      </div>
    </Card>
  )
}

export function ReviewsAdmin({ reviews, moderation, products = [] }: { reviews: AdminReview[]; moderation: 'manual' | 'auto'; products?: { id: string; title: string }[] }) {
  const [tab, setTab] = useState<ReviewStatus | 'all'>(reviews.some((r) => r.status === 'pending') ? 'pending' : 'all')
  const rows = reviews.filter((r) => tab === 'all' || r.status === tab)
  const count = (s: ReviewStatus | 'all') => (s === 'all' ? reviews.length : reviews.filter((r) => r.status === s).length)
  return (
    <>
      <PageHeader
        title="Reviews"
        description={
          <>
            Only approved reviews count towards ratings and appear on the store. Moderation is currently <strong>{moderation === 'manual' ? 'manual — new reviews wait for approval' : 'automatic — new reviews publish immediately'}</strong>.{' '}
            <Link href="/admin/settings?tab=reviews" className="underline">
              Change
            </Link>
          </>
        }
      />
      <AddReceivedReview products={products} />
      <div className="mb-4 flex w-fit rounded-full border border-ink/10 bg-white/70 p-1">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
          <button key={s} type="button" onClick={() => setTab(s)} className={cn('rounded-full px-3.5 py-1.5 text-sm capitalize', tab === s ? 'bg-ink text-ivory' : 'text-ink/70 hover:text-ink')}>
            {s} <span className="ml-1 text-xs opacity-60">{count(s)}</span>
          </button>
        ))}
      </div>
      {rows.length ? (
        <div className="space-y-3">
          {rows.map((r) => (
            <ReviewCard key={r.id + r.status + (r.adminReply ?? '')} r={r} />
          ))}
        </div>
      ) : (
        <Empty title={tab === 'pending' ? 'Nothing waiting' : 'No reviews here'}>Reviews written by signed-in customers appear here, and the ones you add from WhatsApp, Instagram and the rest.</Empty>
      )}
    </>
  )
}

type Customer = { id: string; email: string; name: string; role: 'customer' | 'admin'; points: number; orders: number; spent: { currency: string; amount: number }[]; createdAt: string; lastLoginAt: string | null }

function tierFor(points: number) {
  return points >= 3000 ? 'tapestry' : points >= 1500 ? 'weave' : points >= 500 ? 'stitch' : 'thread'
}

export function CustomersAdmin({ customers, selfId }: { customers: Customer[]; selfId: string }) {
  const money = useMoney()
  const { run, busy } = useMutate()
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [points, setPoints] = useState('')
  const rows = customers.filter((c) => !q.trim() || `${c.name} ${c.email}`.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <>
      <PageHeader title="Customers" description="Everyone with an account. Grant admin access to staff, or adjust loyalty points." />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" className="mb-4 h-10 w-full max-w-sm rounded-full border border-ink/15 bg-white px-4 text-sm outline-none focus:border-ink/50" />
      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-ink/10 text-left text-xs text-stone">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Joined</th>
                <th className="px-3 py-3 font-medium">Orders</th>
                <th className="px-3 py-3 font-medium">Spent</th>
                <th className="px-3 py-3 font-medium">Points</th>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <span className="block">{c.name}</span>
                    <a href={`mailto:${c.email}`} className="text-xs text-stone hover:text-burgundy">
                      {c.email}
                    </a>
                  </td>
                  <td className="px-3 py-3 text-stone">{formatDate(c.createdAt)}</td>
                  <td className="px-3 py-3 tabular-nums">{c.orders}</td>
                  <td className="px-3 py-3 tabular-nums">{c.spent.length ? c.spent.map((s) => money(s.amount, { currency: s.currency })).join(' + ') : money(0)}</td>
                  <td className="px-3 py-3">
                    {editing === c.id ? (
                      <span className="flex items-center gap-1">
                        <input type="number" min={0} value={points} onChange={(e) => setPoints(e.target.value)} className="h-8 w-24 rounded-lg border border-ink/15 px-2 text-sm" aria-label="Points" />
                        <Btn size="sm" loading={busy} onClick={async () => (await run('PATCH', `/api/admin/customers/${c.id}`, { points: Number(points) }, 'Points updated.')) && setEditing(null)}>
                          Save
                        </Btn>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(c.id)
                          setPoints(String(c.points))
                        }}
                        className="tabular-nums hover:text-burgundy"
                        title="Edit points"
                      >
                        {c.points.toLocaleString()} <span className="text-xs text-stone">· {TIER_LABEL[tierFor(c.points)]}</span>
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={c.role === 'admin' ? 'info' : 'neutral'}>{c.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.id !== selfId ? (
                      <Btn
                        size="sm"
                        variant="outline"
                        loading={busy}
                        onClick={() =>
                          confirmAction(c.role === 'admin' ? `Remove admin access from ${c.name}?` : `Give ${c.name} full admin access?`) &&
                          run('PATCH', `/api/admin/customers/${c.id}`, { role: c.role === 'admin' ? 'customer' : 'admin' }, 'Role updated.')
                        }
                      >
                        {c.role === 'admin' ? 'Remove admin' : 'Make admin'}
                      </Btn>
                    ) : (
                      <span className="text-xs text-stone">You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No customers yet">People who create an account appear here.</Empty>
      )}
    </>
  )
}

type Message = { id: string; name: string; email: string; subject: string; body: string; status: 'new' | 'read' | 'archived'; createdAt: string }
type Subscriber = { email: string; source: string; createdAt: string }
type Alert = { id: string; email: string; productTitle: string; variantTitle: string | null; inventory: number; createdAt: string }

export function InboxAdmin({ messages, subscribers, alerts, initialTab = 'messages' }: { messages: Message[]; subscribers: Subscriber[]; alerts: Alert[]; initialTab?: 'messages' | 'subscribers' | 'alerts' }) {
  const { run, busy } = useMutate()
  const [tab, setTab] = useState<'messages' | 'subscribers' | 'alerts'>(initialTab)
  const [showArchived, setShowArchived] = useState(false)
  const visible = messages.filter((m) => showArchived || m.status !== 'archived')
  return (
    <>
      <PageHeader title="Inbox" description="Messages from the contact form, newsletter sign-ups and back-in-stock requests." />
      <div className="mb-4 flex w-fit rounded-full border border-ink/10 bg-white/70 p-1">
        {(
          [
            ['messages', `Messages ${messages.filter((m) => m.status === 'new').length ? `(${messages.filter((m) => m.status === 'new').length} new)` : ''}`],
            ['subscribers', `Subscribers (${subscribers.length})`],
            ['alerts', `Stock alerts (${alerts.length})`],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cn('rounded-full px-3.5 py-1.5 text-sm', tab === id ? 'bg-ink text-ivory' : 'text-ink/70 hover:text-ink')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'messages' ? (
        <>
          <label className="mb-3 flex items-center gap-2 text-sm text-stone">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Show archived
          </label>
          {visible.length ? (
            <div className="space-y-3">
              {visible.map((m) => (
                <Card key={m.id} className={m.status === 'new' ? 'border-gold/60' : undefined}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {m.subject || 'No subject'} <Badge tone={STATUS_TONE[m.status]}>{m.status}</Badge>
                      </p>
                      <p className="text-xs text-stone">
                        {m.name} · {m.email} · {formatDate(m.createdAt, 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      <p className="mt-3 whitespace-pre-line text-sm">{m.body}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your message'}`)}`} onClick={() => m.status === 'new' && run('PATCH', `/api/admin/messages/${m.id}`, { status: 'read' })} className="inline-flex h-8 items-center rounded-full bg-ink px-3.5 text-xs font-medium text-ivory hover:bg-burgundy">
                      Reply by email
                    </a>
                    {m.status === 'new' ? (
                      <Btn size="sm" variant="outline" loading={busy} onClick={() => run('PATCH', `/api/admin/messages/${m.id}`, { status: 'read' }, 'Marked as read.')}>
                        Mark read
                      </Btn>
                    ) : null}
                    {m.status !== 'archived' ? (
                      <Btn size="sm" variant="ghost" loading={busy} onClick={() => run('PATCH', `/api/admin/messages/${m.id}`, { status: 'archived' }, 'Archived.')}>
                        Archive
                      </Btn>
                    ) : null}
                    <Btn size="sm" variant="danger" className="ml-auto" loading={busy} onClick={() => confirmAction('Delete this message?') && run('DELETE', `/api/admin/messages/${m.id}`, undefined, 'Message deleted.')}>
                      Delete
                    </Btn>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty title="Inbox zero">Messages sent from the contact page arrive here.</Empty>
          )}
        </>
      ) : null}

      {tab === 'subscribers' ? (
        <Card title={`${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`} actions={subscribers.length ? <a href="/api/admin/subscribers?format=csv" className="text-xs underline">Download CSV</a> : undefined} pad={false}>
          {subscribers.length ? (
            <ul className="divide-y divide-ink/5">
              {subscribers.map((s) => (
                <li key={s.email} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                  <span>{s.email}</span>
                  <span className="flex items-center gap-3 text-xs text-stone">
                    {s.source} · {formatDate(s.createdAt)}
                    <Btn size="sm" variant="ghost" className="text-error" loading={busy} onClick={() => confirmAction(`Remove ${s.email}?`) && run('DELETE', `/api/admin/subscribers?email=${encodeURIComponent(s.email)}`, undefined, 'Subscriber removed.')}>
                      Remove
                    </Btn>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-stone">No subscribers yet.</p>
          )}
        </Card>
      ) : null}

      {tab === 'alerts' ? (
        <Card title="Back-in-stock requests" pad={false}>
          {alerts.length ? (
            <ul className="divide-y divide-ink/5">
              {alerts.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 text-sm">
                  <span>
                    <a href={`mailto:${a.email}?subject=${encodeURIComponent(`${a.productTitle} is back in stock`)}`} className="underline">
                      {a.email}
                    </a>{' '}
                    wants {a.productTitle}
                    {a.variantTitle ? ` (${a.variantTitle})` : ''}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-stone">
                    {a.inventory > 0 ? <Badge tone="good">back in stock ({a.inventory})</Badge> : <Badge tone="warn">still sold out</Badge>}
                    {formatDate(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-stone">No requests yet.</p>
          )}
        </Card>
      ) : null}
    </>
  )
}
