'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useCurrency, useMoney, useSettings } from '@/components/providers/SettingsProvider'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { useHydrated } from '@/hooks/use-hydrated'
import { Button, ButtonLink } from '@/components/kit/Button'
import { Field, Select, TextArea } from '@/components/kit/Field'
import ProductCard from '@/components/store/ProductCard'
import MemberCard from './MemberCard'
import { AddressBlock, OrderLines, OrderTimeline, OrderTotals, StatusPill } from './OrderBits'
import { api, ApiError } from '@/lib/api'
import { cn, formatDate, TIERS } from '@/lib/format'
import type { Order, Product, PublicUser, ReturnReason, ReturnRequest } from '@/types/commerce'

const EASE = [0.16, 1, 0.3, 1] as const

function Panel({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className={cn('rounded-[1.75rem] bg-bone/70 p-6 md:p-8', className)}>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-3xl">{title}</h2>
        {action}
      </div>
      {children}
    </motion.section>
  )
}

function OrderRow({ order }: { order: Order }) {
  const money = useMoney(order.currency)
  return (
    <Link href={`/account/orders/${order.id}`} className="group flex flex-wrap items-center gap-4 rounded-2xl border border-ink/10 bg-ivory/60 p-4 transition-colors hover:border-ink/30 md:flex-nowrap">
      <div className="flex -space-x-3">
        {order.items.slice(0, 3).map((it) => (
          <span key={it.id} className="relative h-14 w-11 overflow-hidden rounded-lg bg-parchment ring-2 ring-ivory">
            {it.image ? <Image src={it.image} alt="" fill sizes="44px" className="object-cover" /> : null}
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm">{order.orderNumber}</p>
        <p className="text-xs text-stone">
          {formatDate(order.placedAt)} · {order.items.reduce((s, i) => s + i.quantity, 0)} piece(s)
        </p>
      </div>
      <StatusPill status={order.status} />
      <span className="w-24 text-right font-mono text-sm">{money(order.total)}</span>
    </Link>
  )
}

export function Overview({ user, orders, openReturns }: { user: PublicUser; orders: Order[]; openReturns: number }) {
  const hydrated = useHydrated()
  const wish = useWishlistStore((s) => s.items)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return (
    <div className="space-y-8">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-lead text-stone" suppressHydrationWarning>
            {greeting}, {user.name.split(' ')[0]}.
          </p>
          <p className="mt-2 max-w-md text-sm text-stone">Member since {formatDate(user.createdAt, 'en-US', { month: 'long', year: 'numeric' })}.</p>
          <dl className="mt-8 grid grid-cols-3 gap-4">
            {[
              ['Orders', orders.length],
              ['Open returns', openReturns],
              ['Wishlist', hydrated ? wish.length : 0],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-2xl border border-ink/10 p-4">
                <dt className="text-eyebrow text-stone">{k}</dt>
                <dd className="mt-2 font-display text-4xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <MemberCard user={user} />
      </div>
      <Panel title="Recent orders" action={orders.length ? <Link href="/account/orders" className="link-wipe text-sm">All orders</Link> : undefined}>
        {orders.length ? (
          <div className="space-y-3">
            {orders.slice(0, 3).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-stone">No orders yet.</p>
            <ButtonLink href="/shop" className="mt-6" arrow>
              Discover the collection
            </ButtonLink>
          </div>
        )}
      </Panel>
    </div>
  )
}

export function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <Panel title="Orders">
      {orders.length ? (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-stone">You have not placed an order yet.</p>
          <ButtonLink href="/shop" className="mt-6" arrow>
            Shop the collection
          </ButtonLink>
        </div>
      )}
    </Panel>
  )
}

export function OrderDetail({ order, returnWindowOpen, returns }: { order: Order; returnWindowOpen: boolean; returns: ReturnRequest[] }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/account/orders" className="link-wipe text-sm text-stone">
            ← All orders
          </Link>
          <h2 className="mt-3 font-display text-4xl">Order {order.orderNumber}</h2>
          <p className="mt-1 text-sm text-stone">Placed {formatDate(order.placedAt, 'en-US', { dateStyle: 'long' })}</p>
        </div>
        <StatusPill status={order.status} />
      </div>
      <Panel title="Progress">
        <OrderTimeline order={order} />
        {order.trackingNumber ? (
          <p className="mt-8 rounded-2xl border border-ink/10 p-4 text-sm">
            Tracking number <span className="font-mono">{order.trackingNumber}</span>
          </p>
        ) : null}
      </Panel>
      <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Pieces">
          <OrderLines order={order} />
        </Panel>
        <div className="space-y-8">
          <Panel title="Totals">
            <OrderTotals order={order} />
          </Panel>
          <Panel title="Delivery">
            <AddressBlock order={order} />
            {order.notes ? <p className="mt-4 rounded-xl bg-ivory/70 p-3 text-sm text-stone">“{order.notes}”</p> : null}
          </Panel>
        </div>
      </div>
      {returns.length ? (
        <Panel title="Returns for this order">
          <ul className="space-y-2 text-sm">
            {returns.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-xl border border-ink/10 p-3">
                <span>{r.items.map((i) => `${i.quantity}× ${i.title}`).join(', ')}</span>
                <StatusPill status={r.status} />
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {returnWindowOpen ? (
          <ButtonLink href={`/account/returns/new?order=${order.id}`} variant="outline" arrow>
            Start a return
          </ButtonLink>
        ) : null}
        <ButtonLink href="/contact" variant="ghost">
          Need help with this order?
        </ButtonLink>
      </div>
    </div>
  )
}

const REASONS: { id: ReturnReason; label: string }[] = [
  { id: 'wrong-size', label: 'Wrong size' },
  { id: 'defective', label: 'Arrived damaged or faulty' },
  { id: 'not-as-described', label: 'Not as described' },
  { id: 'changed-mind', label: 'Changed my mind' },
  { id: 'other', label: 'Other' },
]

export function ReturnsList({ returns, eligible }: { returns: ReturnRequest[]; eligible: Order[] }) {
  const money = useMoney()
  const { commerce } = useSettings()
  return (
    <div className="space-y-8">
      <Panel title="Returns" action={eligible.length ? <ButtonLink href="/account/returns/new" size="sm" arrow>Start a return</ButtonLink> : undefined}>
        <p className="-mt-2 mb-6 text-sm text-stone">Returns open once an order is delivered and stay open for {commerce.returnWindowDays} days.</p>
        {returns.length ? (
          <ul className="space-y-3">
            {returns.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink/10 bg-ivory/60 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm">{r.orderNumber}</p>
                  <p className="text-xs text-stone">
                    {formatDate(r.createdAt)} · {REASONS.find((x) => x.id === r.reason)?.label}
                  </p>
                  <p className="mt-1 text-sm">{r.items.map((i) => `${i.quantity}× ${i.title}`).join(', ')}</p>
                </div>
                <StatusPill status={r.status} />
                <span className="font-mono text-sm">{money(r.refundAmount, { currency: r.currency })}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-stone">No returns. We hope everything fits beautifully.</p>
        )}
      </Panel>
    </div>
  )
}

export function NewReturn({ orders, initialOrderId }: { orders: Order[]; initialOrderId: string | null }) {
  const router = useRouter()
  const money = useMoney()
  const addToast = useUIStore((s) => s.addToast)
  const [orderId, setOrderId] = useState(initialOrderId && orders.some((o) => o.id === initialOrderId) ? initialOrderId : orders[0]?.id ?? '')
  const order = orders.find((o) => o.id === orderId)
  const [qty, setQty] = useState<Record<string, number>>({})
  const [reason, setReason] = useState<ReturnReason>('wrong-size')
  const [comments, setComments] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => setQty({}), [orderId])

  if (!orders.length) {
    return (
      <Panel title="Start a return">
        <p className="text-stone">You have no delivered orders inside the return window right now.</p>
        <ButtonLink href="/account/orders" variant="outline" className="mt-6">
          View orders
        </ButtonLink>
      </Panel>
    )
  }

  const chosen = Object.entries(qty).filter(([, n]) => n > 0)
  const refund = order ? chosen.reduce((s, [id, n]) => s + (order.items.find((i) => i.id === id)?.price ?? 0) * n, 0) : 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api('/api/returns', { body: { orderId, items: chosen.map(([orderItemId, quantity]) => ({ orderItemId, quantity })), reason, comments: comments || null } })
      addToast('Return requested. We will be in touch with the next steps.')
      router.push('/account/returns')
      router.refresh()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not request the return.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <Panel title="Start a return">
        <Select label="Order" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.orderNumber} — delivered {o.deliveredAt ? formatDate(o.deliveredAt) : ''}
            </option>
          ))}
        </Select>
        {order ? (
          <ul className="mt-6 divide-y divide-ink/10">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 py-4">
                <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-parchment">{it.image ? <Image src={it.image} alt="" fill sizes="64px" className="object-cover" /> : null}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl leading-tight">{it.title}</span>
                  <span className="text-xs text-stone">
                    {[it.size, it.color].filter(Boolean).join(' · ')} · bought {it.quantity} · {money(it.price, { currency: order.currency })}
                  </span>
                </span>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-stone">Return</span>
                  <select value={qty[it.id] ?? 0} onChange={(e) => setQty({ ...qty, [it.id]: Number(e.target.value) })} className="rounded-full border border-ink/15 bg-transparent px-3 py-1.5">
                    {Array.from({ length: it.quantity + 1 }, (_, n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>
      <Panel title="Why are you returning it?">
        <div className="grid gap-2 sm:grid-cols-2">
          {REASONS.map((r) => (
            <label key={r.id} className={cn('flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm', reason === r.id ? 'border-ink bg-ink/[0.03]' : 'border-ink/15')}>
              <input type="radio" name="reason" checked={reason === r.id} onChange={() => setReason(r.id)} className="accent-[#5b0e14]" />
              {r.label}
            </label>
          ))}
        </div>
        <TextArea label="Anything we should know? (optional)" rows={3} className="mt-6" value={comments} onChange={(e) => setComments(e.target.value)} maxLength={1000} />
      </Panel>
      {error ? (
        <p role="alert" className="rounded-2xl bg-error/[0.07] p-4 text-sm text-error">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-6">
        <Button type="submit" size="lg" loading={busy} disabled={!chosen.length} arrow>
          Request return{refund ? ` — ${money(refund, { currency: order?.currency })}` : ''}
        </Button>
        <p className="text-sm text-stone">Refund amount is confirmed once we receive the pieces.</p>
      </div>
    </form>
  )
}

export function Rewards({ user, orders }: { user: PublicUser; orders: Order[] }) {
  const { all } = useCurrency()
  const activity = [
    ...orders.filter((o) => o.pointsEarned > 0).map((o) => ({ id: o.id, label: `Order ${o.orderNumber}${o.status === 'cancelled' ? ' (cancelled — points removed)' : ''}`, points: o.status === 'cancelled' ? 0 : o.pointsEarned, date: o.placedAt })),
    { id: 'welcome', label: 'Welcome bonus', points: 100, date: user.createdAt },
  ].sort((a, b) => +new Date(b.date) - +new Date(a.date))
  return (
    <div className="space-y-8">
      <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
        <MemberCard user={user} />
        <div>
          <h2 className="font-display text-4xl">How points work</h2>
          <ul className="mt-5 space-y-3 text-stone">
            <li>
              {all.map((c, i) => (
                <span key={c.code}>
                  {i ? ' · ' : 'Earn '}
                  <span className="text-ink">
                    {c.pointsPerUnit} point{c.pointsPerUnit === 1 ? '' : 's'}
                  </span>{' '}
                  per {c.code === 'USD' ? 'dollar' : c.code === 'INR' ? 'rupee' : `unit of ${c.code}`}
                </span>
              ))}{' '}
              you spend when signed in.
            </li>
            <li>
              <span className="text-ink">100 points</span> welcome bonus when you join.
            </li>
            <li>Points from a cancelled order are removed.</li>
          </ul>
        </div>
      </div>
      <Panel title="Tiers">
        <ol className="grid gap-3 sm:grid-cols-4">
          {TIERS.map((t) => {
            const reached = user.points >= t.min
            return (
              <li key={t.id} className={cn('rounded-2xl border p-5', user.tier === t.id ? 'border-gold bg-gold/10' : reached ? 'border-ink/20' : 'border-ink/10 opacity-60')}>
                <p className="font-display text-2xl">{t.name}</p>
                <p className="mt-1 font-mono text-xs text-stone">{t.min.toLocaleString()}+ points</p>
                {user.tier === t.id ? <p className="mt-3 text-eyebrow text-gold-deep">Your tier</p> : null}
              </li>
            )
          })}
        </ol>
      </Panel>
      <Panel title="Activity">
        <ul className="divide-y divide-ink/10">
          {activity.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-3 text-sm">
              <span>
                {a.label}
                <span className="ml-3 text-xs text-stone">{formatDate(a.date)}</span>
              </span>
              <span className={cn('font-mono', a.points ? 'text-success' : 'text-stone')}>+{a.points}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

export function Wishlist() {
  const hydrated = useHydrated()
  const handles = useWishlistStore((s) => s.items)
  const [products, setProducts] = useState<Product[] | null>(null)
  useEffect(() => {
    api<{ products: Product[] }>('/api/products')
      .then(({ products: all }) => setProducts(all))
      .catch(() => setProducts([]))
  }, [])
  const saved = hydrated && products ? products.filter((p) => handles.includes(p.handle)) : null
  const missing = hydrated && products ? handles.filter((h) => !products.some((p) => p.handle === h)).length : 0
  return (
    <Panel title="Wishlist" action={saved?.length ? <span className="font-mono text-sm text-stone">{saved.length}</span> : undefined}>
      {!saved ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-[1.25rem] skeleton" />
          ))}
        </div>
      ) : saved.length ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3">
            {saved.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          {missing ? <p className="mt-6 text-xs text-stone">{missing} saved piece(s) are no longer available.</p> : null}
        </>
      ) : (
        <div className="py-10 text-center">
          <p className="text-stone">Tap the heart on any piece to keep it here.</p>
          <ButtonLink href="/shop" className="mt-6" arrow>
            Browse pieces
          </ButtonLink>
        </div>
      )}
    </Panel>
  )
}

export function Profile({ user }: { user: PublicUser }) {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const addToast = useUIStore((s) => s.addToast)
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' })
  const [pwBusy, setPwBusy] = useState(false)
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({})

  return (
    <div className="space-y-8">
      <Panel title="Details">
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            setErrors({})
            try {
              const { user: u } = await api<{ user: PublicUser }>('/api/account', { method: 'PATCH', body: { name, phone: phone || null } })
              setUser(u)
              addToast('Your details are saved.')
              router.refresh()
            } catch (err) {
              if (err instanceof ApiError) setErrors(err.fields ?? { _: err.message })
            } finally {
              setBusy(false)
            }
          }}
        >
          <Field label="Full name" required value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <Field label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
          <Field label="Email" value={user.email} disabled hint="Contact us to change the email on your account." className="sm:col-span-2" />
          {errors._ ? <p className="text-sm text-error sm:col-span-2">{errors._}</p> : null}
          <div className="sm:col-span-2">
            <Button type="submit" loading={busy}>
              Save details
            </Button>
          </div>
        </form>
      </Panel>
      <Panel title="Password">
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault()
            setPwBusy(true)
            setPwErrors({})
            try {
              await api('/api/account/password', { body: pw })
              setPw({ currentPassword: '', newPassword: '' })
              addToast('Your password is updated.')
            } catch (err) {
              if (err instanceof ApiError) setPwErrors(err.fields ?? { _: err.message })
            } finally {
              setPwBusy(false)
            }
          }}
        >
          <Field label="Current password" type="password" autoComplete="current-password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} error={pwErrors.currentPassword} />
          <Field label="New password" type="password" autoComplete="new-password" required minLength={8} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} error={pwErrors.newPassword} hint="At least 8 characters." />
          {pwErrors._ ? <p className="text-sm text-error sm:col-span-2">{pwErrors._}</p> : null}
          <div className="sm:col-span-2">
            <Button type="submit" variant="outline" loading={pwBusy}>
              Update password
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  )
}

export function TrackOrder({ initialNumber }: { initialNumber: string }) {
  const [orderNumber, setOrderNumber] = useState(initialNumber)
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="bg-ivory pb-28 pt-nav text-ink">
      <div className="container-wide pt-12 md:pt-20">
        <p className="text-eyebrow text-burgundy">Order tracking</p>
        <h1 className="mt-5 text-display">Where is my order?</h1>
        <div className="mt-12 grid gap-10 lg:grid-cols-[400px_1fr]">
          <form
            className="space-y-4 self-start rounded-[1.75rem] bg-bone/70 p-6 md:p-8"
            onSubmit={async (e) => {
              e.preventDefault()
              setBusy(true)
              setError(null)
              try {
                const res = await api<{ order: Order }>('/api/orders/lookup', { body: { orderNumber, email } })
                setOrder(res.order)
              } catch (err) {
                setOrder(null)
                setError(err instanceof ApiError ? err.message : 'Please try again.')
              } finally {
                setBusy(false)
              }
            }}
          >
            <p className="text-sm text-stone">Enter the order number from your confirmation and the email you used at checkout.</p>
            <Field label="Order number" placeholder="SK-2026-01001" required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())} />
            <Field label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error ? (
              <p role="alert" className="text-sm text-error">
                {error}
              </p>
            ) : null}
            <Button type="submit" block loading={busy} arrow>
              Find my order
            </Button>
            <p className="text-xs text-stone">
              Have an account?{' '}
              <Link href="/account/orders" className="underline">
                See all your orders
              </Link>
            </p>
          </form>
          {order ? (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="space-y-6 rounded-[1.75rem] bg-bone/70 p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-3xl">{order.orderNumber}</h2>
                <StatusPill status={order.status} />
              </div>
              <OrderTimeline order={order} />
              {order.trackingNumber ? (
                <p className="text-sm">
                  Tracking number <span className="font-mono">{order.trackingNumber}</span>
                </p>
              ) : null}
              <OrderLines order={order} />
              <OrderTotals order={order} />
            </motion.div>
          ) : (
            <div className="hidden items-center justify-center rounded-[1.75rem] border border-dashed border-ink/15 p-10 text-center text-stone lg:flex">Your order&rsquo;s progress will appear here.</div>
          )}
        </div>
      </div>
    </div>
  )
}
