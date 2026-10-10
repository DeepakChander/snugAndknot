'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useCartQuote } from '@/hooks/use-cart-quote'
import { useHydrated } from '@/hooks/use-hydrated'
import { useMoney, useSettings } from '@/components/providers/SettingsProvider'
import { Button, ButtonLink } from '@/components/kit/Button'
import { Field, Select, TextArea } from '@/components/kit/Field'
import { ShieldIcon, TruckIcon } from '@/components/kit/icons'
import OrderSummary from './OrderSummary'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/format'
import type { Address, Order, ShippingMethod } from '@/types/commerce'

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Ireland', 'India', 'Australia', 'New Zealand', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Denmark', 'Norway', 'Switzerland', 'Japan', 'Singapore', 'United Arab Emirates']
const DRAFT_KEY = 'sk-checkout-draft'
export const LAST_ORDER_KEY = 'sk-last-order'

type Form = { email: string; notes: string; shippingMethod: ShippingMethod } & Address

function Step({ n, title, children, aside }: { n: number; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: n * 0.06 }} className="border-t border-ink/10 py-9">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="flex items-baseline gap-4 font-display text-3xl">
          <span className="font-mono text-sm text-gold">{String(n).padStart(2, '0')}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </motion.section>
  )
}

export default function CheckoutView() {
  const router = useRouter()
  const hydrated = useHydrated()
  const items = useCartStore((s) => s.items)
  const couponCode = useCartStore((s) => s.couponCode)
  const clearCart = useCartStore((s) => s.clearCart)
  const user = useAuthStore((s) => s.user)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  const { commerce, store } = useSettings()
  const money = useMoney()
  const [form, setForm] = useState<Form>({
    email: '',
    firstName: '',
    lastName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: store.address.country || 'United States',
    phone: '',
    notes: '',
    shippingMethod: 'standard',
  })
  const { quote, loading, notices } = useCartQuote({ shippingMethod: form.shippingMethod })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)
  const restored = useRef(false)

  // Restore a draft after a refresh; prefill from the signed-in account.
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null')
      if (draft) setForm((f) => ({ ...f, ...draft }))
    } catch {}
  }, [])
  useEffect(() => {
    if (!user) return
    setForm((f) => {
      const [first, ...rest] = user.name.split(' ')
      return { ...f, email: f.email || user.email, firstName: f.firstName || first, lastName: f.lastName || rest.join(' '), phone: f.phone || user.phone || '' }
    })
  }, [user])
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    } catch {}
  }, [form])

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(({ [k]: _drop, ...rest }) => rest)
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address'
    for (const [k, label] of [
      ['firstName', 'First name'],
      ['lastName', 'Last name'],
      ['line1', 'Address'],
      ['city', 'City'],
      ['state', 'State / region'],
      ['postalCode', 'Postal code'],
    ] as const) {
      if (!form[k].trim()) e[k] = `${label} is required`
    }
    return e
  }

  async function place(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const v = validate()
    setErrors(v)
    if (Object.keys(v).length) {
      document.getElementById(`co-${Object.keys(v)[0]}`)?.focus()
      return
    }
    setPlacing(true)
    try {
      const { order } = await api<{ order: Order }>('/api/orders', {
        body: {
          lines: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          couponCode: couponCode && quote?.coupon ? couponCode : null,
          shippingMethod: form.shippingMethod,
          email: form.email,
          address: {
            firstName: form.firstName,
            lastName: form.lastName,
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
            phone: form.phone || undefined,
          },
          notes: form.notes || null,
          paymentMethod: 'cod',
        },
      })
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order))
        sessionStorage.removeItem(DRAFT_KEY)
      } catch {}
      clearCart()
      if (user) void useAuthStore.getState().fetchSession()
      router.push(`/checkout/confirmed?order=${encodeURIComponent(order.orderNumber)}`)
    } catch (err) {
      setPlacing(false)
      if (err instanceof ApiError) {
        setFormError(err.message)
        if (err.fields) {
          const mapped: Record<string, string> = {}
          for (const [k, msg] of Object.entries(err.fields)) mapped[k.replace(/^address\./, '')] = msg
          setErrors(mapped)
        }
      } else setFormError('Something went wrong. Your bag is safe — please try again.')
    }
  }

  if (!hydrated) return <div className="min-h-[100svh] bg-ivory pt-nav" />
  if (!items.length) {
    return (
      <div className="min-h-[80svh] bg-ivory pt-nav text-ink">
        <div className="container-wide py-24 text-center">
          <h1 className="text-display">Your bag is empty</h1>
          <p className="mx-auto mt-6 max-w-md text-stone">Add a piece to your bag to check out.</p>
          <ButtonLink href="/shop" className="mt-10" arrow>
            Shop the collection
          </ButtonLink>
        </div>
      </div>
    )
  }

  const standardFree = (quote ? quote.subtotal - quote.discount : 0) >= commerce.freeShippingThreshold && commerce.freeShippingThreshold > 0

  return (
    <div className="bg-ivory pb-28 pt-nav text-ink">
      <form onSubmit={place} noValidate className="container-wide grid gap-12 pt-10 md:pt-14 lg:grid-cols-[1fr_440px] lg:gap-16">
        <div>
          <h1 className="text-display">Checkout</h1>
          <p className="mt-4 flex items-center gap-2 text-sm text-stone">
            <ShieldIcon size={16} className="text-success" /> Your details are sent securely and only used for this order.
          </p>

          <div className="mt-10">
            <Step
              n={1}
              title="Contact"
              aside={
                !user ? (
                  <button type="button" onClick={() => openAuthModal('login')} className="link-wipe text-sm">
                    Sign in
                  </button>
                ) : (
                  <span className="text-sm text-stone">Signed in as {user.name}</span>
                )
              }
            >
              <Field id="co-email" label="Email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} error={errors.email} hint={!user ? 'Order updates are tied to this address. Sign in to earn points.' : undefined} />
            </Step>

            <Step n={2} title="Delivery address">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="co-firstName" label="First name" autoComplete="given-name" required value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
                <Field id="co-lastName" label="Last name" autoComplete="family-name" required value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
                <Field id="co-line1" label="Address" autoComplete="address-line1" required className="sm:col-span-2" value={form.line1} onChange={set('line1')} error={errors.line1} />
                <Field id="co-line2" label="Apartment, suite (optional)" autoComplete="address-line2" className="sm:col-span-2" value={form.line2 ?? ''} onChange={set('line2')} />
                <Field id="co-city" label="City" autoComplete="address-level2" required value={form.city} onChange={set('city')} error={errors.city} />
                <Field id="co-state" label="State / region" autoComplete="address-level1" required value={form.state} onChange={set('state')} error={errors.state} />
                <Field id="co-postalCode" label="Postal code" autoComplete="postal-code" required value={form.postalCode} onChange={set('postalCode')} error={errors.postalCode} />
                <Select id="co-country" label="Country" autoComplete="country-name" value={form.country} onChange={set('country')} error={errors.country}>
                  {Array.from(new Set([form.country, ...COUNTRIES])).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                <Field id="co-phone" label="Phone (for the courier)" type="tel" autoComplete="tel" className="sm:col-span-2" value={form.phone ?? ''} onChange={set('phone')} error={errors.phone} />
              </div>
            </Step>

            <Step n={3} title="Shipping">
              <div className="grid gap-3" role="radiogroup" aria-label="Shipping method">
                {(
                  [
                    { id: 'standard', title: 'Standard delivery', price: standardFree ? 0 : commerce.standardShippingRate, note: commerce.freeShippingThreshold > 0 ? `Free over ${money(commerce.freeShippingThreshold)}` : undefined },
                    { id: 'express', title: 'Express delivery', price: commerce.expressShippingRate, note: 'Priority dispatch' },
                  ] as const
                ).map((m) => (
                  <label key={m.id} className={cn('flex cursor-pointer items-center gap-4 rounded-2xl border p-5 transition-colors', form.shippingMethod === m.id ? 'border-ink bg-ink/[0.03]' : 'border-ink/15 hover:border-ink/40')}>
                    <input type="radio" name="shipping" value={m.id} checked={form.shippingMethod === m.id} onChange={() => setForm((f) => ({ ...f, shippingMethod: m.id }))} className="h-4 w-4 accent-[#5b0e14]" />
                    <TruckIcon size={20} className="text-burgundy" />
                    <span className="flex-1">
                      <span className="block">{m.title}</span>
                      {m.note ? <span className="text-xs text-stone">{m.note}</span> : null}
                    </span>
                    <span className="font-mono text-sm">{m.price ? money(m.price) : 'Free'}</span>
                  </label>
                ))}
              </div>
            </Step>

            <Step n={4} title="Payment">
              {commerce.codEnabled ? (
                <div className="grid gap-3">
                  <label className="flex items-center gap-4 rounded-2xl border border-ink bg-ink/[0.03] p-5">
                    <input type="radio" name="payment" checked readOnly className="h-4 w-4 accent-[#5b0e14]" />
                    <span className="flex-1">
                      <span className="block">Pay on delivery</span>
                      <span className="text-xs text-stone">Pay the courier when your parcel arrives. No card details needed online.</span>
                    </span>
                  </label>
                  <div className="flex items-center gap-4 rounded-2xl border border-dashed border-ink/15 p-5 text-stone">
                    <input type="radio" disabled className="h-4 w-4" aria-label="Card payment (not yet available)" />
                    <span className="flex-1">
                      <span className="block">Card payment</span>
                      <span className="text-xs">Online card payments are coming soon.</span>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl bg-error/[0.07] p-5 text-sm text-error">Checkout is paused right now. Please contact us at {store.email} to place an order.</p>
              )}
            </Step>

            <Step n={5} title="Notes">
              <TextArea id="co-notes" label="Gift message or delivery instructions (optional)" rows={3} maxLength={500} value={form.notes} onChange={set('notes')} />
            </Step>
          </div>
        </div>

        <div className="lg:sticky lg:top-[calc(var(--nav-offset)+1.5rem)] lg:self-start">
          <OrderSummary quote={quote} loading={loading}>
            {notices.length ? (
              <ul className="mb-4 space-y-1 rounded-2xl bg-burgundy/[0.06] p-4 text-sm text-burgundy" role="status">
                {notices.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            ) : null}
            {formError ? (
              <p role="alert" className="mb-4 rounded-2xl bg-error/[0.07] p-4 text-sm text-error">
                {formError}
              </p>
            ) : null}
            <Button type="submit" size="lg" block loading={placing} disabled={!commerce.codEnabled || !quote || loading} arrow>
              {placing ? 'Placing order…' : `Place order${quote ? ` — ${money(quote.total)}` : ''}`}
            </Button>
            <p className="mt-3 text-center text-xs text-stone">
              By placing your order you agree to our{' '}
              <Link href="/terms-of-service" className="underline">
                terms
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="underline">
                privacy policy
              </Link>
              .
            </p>
          </OrderSummary>
        </div>
      </form>
    </div>
  )
}
