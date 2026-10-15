'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Btn, Card, Input, PageHeader, Textarea, Toggle, useMutate } from './ui'
import { ImageField } from './ImagePicker'
import { cn } from '@/lib/format'
import { currencySymbol } from '@/lib/currency'
import type { CurrencySettings, SettingsKey, SiteSettings } from '@/types/commerce'

const TABS: { key: SettingsKey; label: string; blurb: string }[] = [
  { key: 'store', label: 'Store details', blurb: 'Name, contact details, address and social links. Shown in the header, footer, contact page, policies and order pages.' },
  { key: 'commerce', label: 'Checkout & shipping', blurb: 'Currency, shipping rates, tax, returns and rewards. Prices and totals are recalculated on the server with these values.' },
  { key: 'announcement', label: 'Announcement bar', blurb: 'The rotating line of text above the navigation on every page.' },
  { key: 'reviews', label: 'Reviews', blurb: 'Decide whether new customer reviews need your approval before they appear.' },
  { key: 'homepage', label: 'Home page', blurb: 'The words in the home page hero and the manifesto section.' },
  { key: 'seo', label: 'Search & sharing', blurb: 'How the site appears in Google results and when a link is shared.' },
]

export function Section({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-6 border-b border-ink/10 py-8 first:pt-0 last:border-0 last:pb-0 lg:grid-cols-[16rem_1fr]">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description ? <p className="mt-1 text-xs leading-relaxed text-stone">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export function Counter({ value, max }: { value: string; max: number }) {
  return <span className={cn('tabular-nums', value.length > max && 'text-error')}>{value.length} / {max}</span>
}

export function SaveBar({ dirty, busy, onSave, onReset }: { dirty: boolean; busy: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <div className="sticky bottom-4 z-10 mt-8 flex items-center justify-end gap-3 rounded-full border border-ink/10 bg-white/90 p-2 pl-5 shadow-lg backdrop-blur">
      <p className="mr-auto text-xs text-stone">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
      <Btn variant="ghost" disabled={!dirty || busy} onClick={onReset}>
        Discard
      </Btn>
      <Btn disabled={!dirty} loading={busy} onClick={onSave}>
        Save changes
      </Btn>
    </div>
  )
}

/** One form per section: keeps a draft, saves just that section, reports errors at the field. */
export function useSection<K extends SettingsKey>(key: K, initial: SiteSettings[K]) {
  const { run, busy, fieldErrors } = useMutate()
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft])
  async function save() {
    const res = await run<{ value: SiteSettings[K] }>('PUT', '/api/admin/settings', { section: key, value: draft }, 'Settings saved — the store is updated.')
    if (res) {
      setSaved(res.value)
      setDraft(res.value)
    }
  }
  return { draft, setDraft, dirty, busy, err: fieldErrors, save, reset: () => setDraft(saved) }
}

/* ─────────────────────────── Sections ─────────────────────────── */

function StoreForm({ initial }: { initial: SiteSettings['store'] }) {
  const s = useSection('store', initial)
  const d = s.draft
  const set = (patch: Partial<typeof d>) => s.setDraft({ ...d, ...patch })
  const addr = (k: keyof typeof d.address, v: string) => set({ address: { ...d.address, [k]: v } })
  const social = (k: keyof typeof d.social, v: string) => set({ social: { ...d.social, [k]: v } })
  return (
    <>
      <Card>
        <Section title="Brand" description="The name is used in the logo, page titles and policies.">
          <Input label="Store name" value={d.name} error={s.err.name} onChange={(e) => set({ name: e.target.value })} />
          <Input label="Tagline" value={d.tagline} error={s.err.tagline} onChange={(e) => set({ tagline: e.target.value })} hint="Shown at the foot of every page." />
          <Textarea label="Short description" rows={3} value={d.description} error={s.err.description} onChange={(e) => set({ description: e.target.value })} hint="Used for search results when no search description is set." />
        </Section>
        <Section title="Contact" description="Shown in the footer, contact page, help widget, policies and order pages.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Email" type="email" value={d.email} error={s.err.email} onChange={(e) => set({ email: e.target.value })} />
            <Input label="Phone (optional)" type="tel" value={d.phone} error={s.err.phone} onChange={(e) => set({ phone: e.target.value })} />
          </div>
        </Section>
        <Section title="Address" description="Your studio or business address.">
          <Input label="Street" value={d.address.street} error={s.err['address.street']} onChange={(e) => addr('street', e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="City" value={d.address.city} error={s.err['address.city']} onChange={(e) => addr('city', e.target.value)} />
            <Input label="State / region" value={d.address.state} error={s.err['address.state']} onChange={(e) => addr('state', e.target.value)} />
            <Input label="ZIP / postcode" value={d.address.zip} error={s.err['address.zip']} onChange={(e) => addr('zip', e.target.value)} />
          </div>
          <Input label="Country" value={d.address.country} error={s.err['address.country']} onChange={(e) => addr('country', e.target.value)} />
        </Section>
        <Section title="Social links" description="Leave a field empty to hide that icon.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Instagram" value={d.social.instagram} error={s.err['social.instagram']} onChange={(e) => social('instagram', e.target.value)} placeholder="https://instagram.com/…" />
            <Input label="Pinterest" value={d.social.pinterest} error={s.err['social.pinterest']} onChange={(e) => social('pinterest', e.target.value)} placeholder="https://pinterest.com/…" />
            <Input label="TikTok" value={d.social.tiktok} error={s.err['social.tiktok']} onChange={(e) => social('tiktok', e.target.value)} placeholder="https://tiktok.com/@…" />
            <Input label="X / Twitter" value={d.social.twitter} error={s.err['social.twitter']} onChange={(e) => social('twitter', e.target.value)} placeholder="https://x.com/…" />
          </div>
        </Section>
      </Card>
      <SaveBar dirty={s.dirty} busy={s.busy} onSave={s.save} onReset={s.reset} />
    </>
  )
}

/** The Razorpay connection as the server sees it. Never carries a key or secret. */
export interface RazorpayConnection {
  configured: boolean
  mode: 'test' | 'live' | null
  webhook: boolean
  webhookUrl: string
  /** Active products with no price yet, per additional currency. */
  missingPrices: Record<string, number>
}

/** One additional currency. Countries are typed as text and parsed, so commas can be typed freely. */
function CurrencyRow({ value, index, err, onChange, onRemove, missing }: { value: CurrencySettings; index: number; err: Record<string, string>; onChange: (v: CurrencySettings) => void; onRemove: () => void; missing: number | undefined }) {
  const [countries, setCountries] = useState(value.countries.join(', '))
  const num = (v: string) => (v === '' ? 0 : Number(v))
  const e = (k: string) => err[`extraCurrencies.${index}.${k}`]
  const sym = currencySymbol(value.code || 'XXX', value.locale || 'en')
  return (
    <div className="rounded-2xl border border-ink/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-sm">{value.code || 'New currency'}</p>
        <Btn size="sm" variant="ghost" className="text-error" onClick={onRemove}>
          Remove
        </Btn>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Currency code" value={value.code} maxLength={3} error={e('code')} onChange={(ev) => onChange({ ...value, code: ev.target.value.toUpperCase() })} className="font-mono uppercase" hint="e.g. INR" />
        <Input label="Locale" value={value.locale} error={e('locale')} onChange={(ev) => onChange({ ...value, locale: ev.target.value })} className="font-mono" hint="e.g. en-IN" />
        <Input
          label="Shown first in"
          value={countries}
          error={e('countries') ?? Object.entries(err).find(([k]) => k.startsWith(`extraCurrencies.${index}.countries.`))?.[1]}
          onChange={(ev) => {
            setCountries(ev.target.value)
            onChange({ ...value, countries: ev.target.value.split(/[\s,]+/).map((c) => c.trim().toUpperCase()).filter(Boolean) })
          }}
          className="font-mono uppercase"
          hint="Country codes, e.g. IN"
        />
        <Input label="Standard shipping" type="number" min={0} step="0.01" prefix={sym} value={value.standardShippingRate} error={e('standardShippingRate')} onChange={(ev) => onChange({ ...value, standardShippingRate: num(ev.target.value) })} />
        <Input label="Express shipping" type="number" min={0} step="0.01" prefix={sym} value={value.expressShippingRate} error={e('expressShippingRate')} onChange={(ev) => onChange({ ...value, expressShippingRate: num(ev.target.value) })} />
        <Input label="Free shipping from" type="number" min={0} step="0.01" prefix={sym} value={value.freeShippingThreshold} error={e('freeShippingThreshold')} onChange={(ev) => onChange({ ...value, freeShippingThreshold: num(ev.target.value) })} />
        <Input label="Points per 1 spent" type="number" min={0} max={100} step="0.01" value={value.pointsPerUnit} error={e('pointsPerUnit')} onChange={(ev) => onChange({ ...value, pointsPerUnit: num(ev.target.value) })} hint="e.g. 0.01 per rupee ≈ 1 per dollar" />
      </div>
      {missing ? (
        <p className="mt-3 rounded-xl bg-gold/15 p-3 text-xs text-gold-deep">
          {missing} active product{missing === 1 ? ' has' : 's have'} no {value.code} price yet. Shoppers paying in {value.code} cannot buy {missing === 1 ? 'it' : 'them'} until you add one (Products → edit → Pricing).
        </p>
      ) : null}
    </div>
  )
}

function CommerceForm({ initial, payments }: { initial: SiteSettings['commerce']; payments: RazorpayConnection }) {
  const s = useSection('commerce', initial)
  const d = s.draft
  const set = (patch: Partial<typeof d>) => s.setDraft({ ...d, ...patch })
  const num = (v: string) => (v === '' ? 0 : Number(v))
  const preview = useMemo(() => {
    try {
      return new Intl.NumberFormat(d.locale || 'en-US', { style: 'currency', currency: d.currency || 'USD' }).format(1234.5)
    } catch {
      return 'Check the currency and locale'
    }
  }, [d.locale, d.currency])
  return (
    <>
      <Card>
        <Section title="Currency" description={<>The base currency: every price, rate and threshold on this page is in it. Preview: <strong className="font-medium text-ink">{preview}</strong></>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Currency code" value={d.currency} maxLength={3} error={s.err.currency} onChange={(e) => set({ currency: e.target.value.toUpperCase() })} hint="ISO code, e.g. USD, EUR, GBP, INR." className="font-mono uppercase" />
            <Input label="Locale" value={d.locale} error={s.err.locale} onChange={(e) => set({ locale: e.target.value })} hint="Number format, e.g. en-US, en-GB, fr-FR." className="font-mono" />
          </div>
        </Section>
        <Section
          title="More currencies"
          description="Sell in another currency too, such as INR next to USD. You set every price in it yourself (Products → Pricing), plus its shipping. Shoppers in the countries you list see it first, and anyone can switch in the footer. Orders are charged in the currency the shopper sees."
        >
          <div className="space-y-3">
            {(d.extraCurrencies ?? []).map((c, i) => (
              <CurrencyRow
                key={i}
                index={i}
                value={c}
                err={s.err}
                missing={payments.missingPrices[c.code]}
                onChange={(v) => set({ extraCurrencies: d.extraCurrencies.map((x, j) => (j === i ? v : x)) })}
                onRemove={() => set({ extraCurrencies: d.extraCurrencies.filter((_, j) => j !== i) })}
              />
            ))}
            {(d.extraCurrencies ?? []).length < 3 ? (
              <Btn
                size="sm"
                variant="outline"
                onClick={() =>
                  set({
                    extraCurrencies: [
                      ...(d.extraCurrencies ?? []),
                      d.currency !== 'INR' && !(d.extraCurrencies ?? []).some((x) => x.code === 'INR')
                        ? { code: 'INR', locale: 'en-IN', countries: ['IN'], standardShippingRate: 0, expressShippingRate: 0, freeShippingThreshold: 0, pointsPerUnit: 0.01 }
                        : { code: '', locale: 'en-US', countries: [], standardShippingRate: 0, expressShippingRate: 0, freeShippingThreshold: 0, pointsPerUnit: 1 },
                    ],
                  })
                }
              >
                Add a currency
              </Btn>
            ) : null}
          </div>
        </Section>
        <Section title="Shipping" description="Standard shipping becomes free once the bag reaches the threshold. Set the threshold to 0 to always charge.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Free shipping from" type="number" min={0} step="0.01" value={d.freeShippingThreshold} error={s.err.freeShippingThreshold} onChange={(e) => set({ freeShippingThreshold: num(e.target.value) })} />
            <Input label="Standard rate" type="number" min={0} step="0.01" value={d.standardShippingRate} error={s.err.standardShippingRate} onChange={(e) => set({ standardShippingRate: num(e.target.value) })} />
            <Input label="Express rate" type="number" min={0} step="0.01" value={d.expressShippingRate} error={s.err.expressShippingRate} onChange={(e) => set({ expressShippingRate: num(e.target.value) })} />
          </div>
        </Section>
        <Section title="Tax" description="A single percentage applied to the discounted subtotal at checkout.">
          <Input label="Tax rate (%)" type="number" min={0} max={50} step="0.001" value={d.taxRate} error={s.err.taxRate} onChange={(e) => set({ taxRate: num(e.target.value) })} wrapClassName="max-w-xs" />
        </Section>
        <Section title="Returns & rewards" description="Customers can request a return within this many days of delivery. Members earn points on every order.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Return window (days)" type="number" min={0} max={365} value={d.returnWindowDays} error={s.err.returnWindowDays} onChange={(e) => set({ returnWindowDays: Math.trunc(num(e.target.value)) })} />
            <Input label="Points earned per 1 spent" type="number" min={0} max={100} step="0.1" value={d.pointsPerDollar} error={s.err.pointsPerDollar} onChange={(e) => set({ pointsPerDollar: num(e.target.value) })} />
          </div>
        </Section>
        <Section
          title="Payment"
          description={
            payments.configured
              ? `Razorpay is connected in ${payments.mode} mode${payments.mode === 'test' ? ': payments use test cards and no real money moves' : ''}. Turn online payments on to offer them at checkout.`
              : 'Online payments need the Razorpay keys on the server first (SNUGKNOT_RAZORPAY_KEY_ID and SNUGKNOT_RAZORPAY_KEY_SECRET; see the README). Until then cash on delivery is the only way to pay.'
          }
        >
          <div className="space-y-5">
            <Toggle
              checked={d.onlinePaymentsEnabled}
              disabled={!payments.configured && !d.onlinePaymentsEnabled}
              onChange={(v) => set({ onlinePaymentsEnabled: v })}
              label="Accept online payments (Razorpay)"
              description={
                !payments.configured
                  ? 'Not connected yet.'
                  : d.onlinePaymentsEnabled
                    ? 'Customers can pay by card and the other methods your Razorpay account allows. Orders are placed once the payment is confirmed.'
                    : 'Off: checkout does not offer online payment.'
              }
            />
            <Toggle
              checked={d.codEnabled}
              onChange={(v) => set({ codEnabled: v })}
              label="Accept cash on delivery"
              description={
                d.codEnabled
                  ? 'Customers can place orders and pay when they arrive.'
                  : d.onlinePaymentsEnabled && payments.configured
                    ? 'Off: customers pay online only.'
                    : 'Checkout is paused: customers are asked to contact you instead.'
              }
            />
            {payments.configured ? (
              <p className={cn('rounded-xl p-3 text-xs', payments.webhook ? 'bg-success/10 text-success' : 'bg-gold/15 text-gold-deep')}>
                {payments.webhook ? (
                  <>Webhook secret set. Razorpay should send events to <span className="font-mono">{payments.webhookUrl}</span>.</>
                ) : (
                  <>
                    Recommended: in Razorpay → Webhooks, add <span className="font-mono">{payments.webhookUrl}</span> with the events payment.captured, payment.authorized, order.paid and refund.processed, and set the same secret as SNUGKNOT_RAZORPAY_WEBHOOK_SECRET. Without it, a customer who closes the page right after paying is still placed, but only when the 30-minute check runs.
                  </>
                )}
              </p>
            ) : null}
          </div>
        </Section>
      </Card>
      <SaveBar dirty={s.dirty} busy={s.busy} onSave={s.save} onReset={s.reset} />
    </>
  )
}

function AnnouncementForm({ initial }: { initial: SiteSettings['announcement'] }) {
  const s = useSection('announcement', initial)
  const d = s.draft
  const set = (patch: Partial<typeof d>) => s.setDraft({ ...d, ...patch })
  const msgs = d.messages
  const setMsg = (i: number, v: string) => set({ messages: msgs.map((m, j) => (j === i ? v : m)) })
  const move = (i: number, j: number) => {
    const a = [...msgs]
    ;[a[i], a[j]] = [a[j], a[i]]
    set({ messages: a })
  }
  return (
    <>
      <Card>
        <Section title="Show the bar">
          <Toggle checked={d.enabled} onChange={(v) => set({ enabled: v })} label="Show the announcement bar" description="When off, the bar is hidden on every page." />
        </Section>
        <Section title="Messages" description="Up to 8. They rotate every few seconds in this order.">
          <div className="rounded-xl bg-noir px-4 py-2.5 text-center text-xs tracking-wide text-bone/85">{msgs.find((m) => m.trim()) ?? 'Preview'}</div>
          <ul className="space-y-2">
            {msgs.map((m, i) => (
              <li key={i} className="flex items-start gap-2">
                <Input aria-label={`Message ${i + 1}`} value={m} maxLength={160} error={s.err[`messages.${i}`]} onChange={(e) => setMsg(i, e.target.value)} wrapClassName="flex-1" hint={<Counter value={m} max={160} />} />
                <Btn size="sm" variant="ghost" className="mt-1.5" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move up">
                  ↑
                </Btn>
                <Btn size="sm" variant="ghost" className="mt-1.5" disabled={i === msgs.length - 1} onClick={() => move(i, i + 1)} aria-label="Move down">
                  ↓
                </Btn>
                <Btn size="sm" variant="ghost" className="mt-1.5 text-error" onClick={() => set({ messages: msgs.filter((_, j) => j !== i) })}>
                  Remove
                </Btn>
              </li>
            ))}
          </ul>
          {msgs.length < 8 ? (
            <Btn size="sm" variant="outline" onClick={() => set({ messages: [...msgs, ''] })}>
              Add message
            </Btn>
          ) : null}
        </Section>
        <Section title="Link" description="Optional. Clicking the bar opens this page.">
          <Input label="Link" value={d.link} error={s.err.link} onChange={(e) => set({ link: e.target.value })} placeholder="/shop" />
        </Section>
      </Card>
      <SaveBar dirty={s.dirty} busy={s.busy} onSave={s.save} onReset={s.reset} />
    </>
  )
}

function ReviewsForm({ initial }: { initial: SiteSettings['reviews'] }) {
  const s = useSection('reviews', initial)
  const options = [
    { v: 'manual' as const, title: 'I approve each review', body: 'New reviews wait in Reviews until you approve them. Recommended.' },
    { v: 'auto' as const, title: 'Publish straight away', body: 'Reviews appear on the product as soon as they are submitted. You can still hide them later.' },
  ]
  return (
    <>
      <Card>
        <Section title="Moderation" description="Only signed-in customers can review, once per product. Reviews from people who bought the piece are marked as verified.">
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Review moderation">
            {options.map((o) => (
              <label key={o.v} className={cn('cursor-pointer rounded-2xl border p-4 transition-colors', s.draft.moderation === o.v ? 'border-ink bg-white' : 'border-ink/15 hover:border-ink/40')}>
                <input type="radio" name="moderation" className="sr-only" checked={s.draft.moderation === o.v} onChange={() => s.setDraft({ moderation: o.v })} />
                <span className="flex items-center gap-2 text-sm font-medium">
                  <span className={cn('grid h-4 w-4 place-items-center rounded-full border', s.draft.moderation === o.v ? 'border-ink' : 'border-ink/30')}>{s.draft.moderation === o.v ? <span className="h-2 w-2 rounded-full bg-ink" /> : null}</span>
                  {o.title}
                </span>
                <span className="mt-1.5 block pl-6 text-xs text-stone">{o.body}</span>
              </label>
            ))}
          </div>
        </Section>
      </Card>
      <SaveBar dirty={s.dirty} busy={s.busy} onSave={s.save} onReset={s.reset} />
    </>
  )
}

const FEATURE_ICONS: { id: SiteSettings['homepage']['features'][number]['icon']; label: string }[] = [
  { id: 'fabric', label: 'Fabric' },
  { id: 'factory', label: 'Workshop' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'truck', label: 'Delivery' },
  { id: 'returns', label: 'Returns' },
  { id: 'needle', label: 'Needle' },
]

function HomepageForm({ initial }: { initial: SiteSettings['homepage'] }) {
  const s = useSection('homepage', initial)
  const d = s.draft
  const set = (patch: Partial<typeof d>) => s.setDraft({ ...d, ...patch })
  const setFeature = (i: number, patch: Partial<(typeof d.features)[number]>) => set({ features: d.features.map((f, j) => (j === i ? { ...f, ...patch } : f)) })
  return (
    <>
      <Card>
        <Section
          title="Hero"
          description={
            <>
              The first screen: a wide photograph with this copy on its left. Use a landscape photo (about 3:1) with the people on the right half.{' '}
              <Link href="/" target="_blank" className="underline">
                Open the home page ↗
              </Link>
            </>
          }
        >
          <ImageField label="Hero photograph" value={d.heroImage} onChange={(v) => set({ heroImage: v })} aspect="aspect-[3/1]" />
          <Input label="Photo description" value={d.heroImageAlt} error={s.err.heroImageAlt} onChange={(e) => set({ heroImageAlt: e.target.value })} hint="Read aloud to people who cannot see the photo." />
          <Input label="Eyebrow" value={d.heroEyebrow} error={s.err.heroEyebrow} onChange={(e) => set({ heroEyebrow: e.target.value })} hint="The small spaced line above the title." />
          <Input label="Title" value={d.heroTitle} error={s.err.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />
          <Input label="Line under the title" value={d.heroSubtitle} error={s.err.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Button label" value={d.primaryCtaLabel} error={s.err.primaryCtaLabel} onChange={(e) => set({ primaryCtaLabel: e.target.value })} />
            <Input label="Button link" value={d.primaryCtaHref} error={s.err.primaryCtaHref} onChange={(e) => set({ primaryCtaHref: e.target.value })} placeholder="/shop" />
          </div>
        </Section>
        <Section title="Category cards" description="Men, Women and Kids show while they have pieces, followed by the categories set to “Show on home page” (Catalog → Categories). Empty uses a product photo.">
          <div className="grid gap-4 sm:grid-cols-3">
            {(['men', 'women', 'kids'] as const).map((k) => (
              <ImageField key={k} label={k[0].toUpperCase() + k.slice(1)} value={d.departmentImages[k]} onChange={(v) => set({ departmentImages: { ...d.departmentImages, [k]: v } })} />
            ))}
          </div>
        </Section>
        <Section title="Promises" description="Up to four short promises under the cards. Only state what is true for every order.">
          <div className="space-y-3">
            {d.features.map((f, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-ink/10 p-3 sm:grid-cols-[140px_1fr_1fr_auto] sm:items-end">
                <label className="text-sm">
                  <span className="mb-1 block text-xs text-stone">Icon</span>
                  <select value={f.icon} onChange={(e) => setFeature(i, { icon: e.target.value as typeof f.icon })} className="h-10 w-full rounded-lg border border-ink/15 bg-white px-2 text-sm">
                    {FEATURE_ICONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Input label="Title" value={f.title} error={s.err[`features.${i}.title`]} onChange={(e) => setFeature(i, { title: e.target.value })} />
                <Input label="Line" value={f.body} error={s.err[`features.${i}.body`]} onChange={(e) => setFeature(i, { body: e.target.value })} />
                <Btn size="sm" variant="ghost" className="text-error" onClick={() => set({ features: d.features.filter((_, j) => j !== i) })}>
                  Remove
                </Btn>
              </div>
            ))}
            {d.features.length < 4 ? (
              <Btn size="sm" variant="outline" onClick={() => set({ features: [...d.features, { icon: 'fabric', title: '', body: '' }] })}>
                Add a promise
              </Btn>
            ) : null}
          </div>
        </Section>
        <Section title="Our story" description="A photograph on one half and your story on the other. Leave the title and text empty to hide the section.">
          <ImageField label="Story photograph" value={d.storyImage} onChange={(v) => set({ storyImage: v })} aspect="aspect-[5/4]" />
          <Input label="Photo description" value={d.storyImageAlt} error={s.err.storyImageAlt} onChange={(e) => set({ storyImageAlt: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Eyebrow" value={d.storyEyebrow} error={s.err.storyEyebrow} onChange={(e) => set({ storyEyebrow: e.target.value })} />
            <Input label="Title" value={d.storyTitle} error={s.err.storyTitle} onChange={(e) => set({ storyTitle: e.target.value })} />
          </div>
          <Textarea label="Story" rows={4} value={d.storyBody} error={s.err.storyBody} onChange={(e) => set({ storyBody: e.target.value })} hint={<Counter value={d.storyBody} max={800} />} />
          <Input label="Signature line" value={d.storySignature} error={s.err.storySignature} onChange={(e) => set({ storySignature: e.target.value })} hint="Set in italic under the story, and in the footer." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Button label" value={d.storyCtaLabel} error={s.err.storyCtaLabel} onChange={(e) => set({ storyCtaLabel: e.target.value })} />
            <Input label="Button link" value={d.storyCtaHref} error={s.err.storyCtaHref} onChange={(e) => set({ storyCtaHref: e.target.value })} placeholder="/about" />
          </div>
        </Section>
        <Section title="Seasonal banner" description="A wide photograph with a short message, near the end of the page. Leave the title empty to hide it.">
          <ImageField label="Banner photograph" value={d.bannerImage} onChange={(v) => set({ bannerImage: v })} aspect="aspect-[4/1]" />
          <Input label="Photo description" value={d.bannerImageAlt} error={s.err.bannerImageAlt} onChange={(e) => set({ bannerImageAlt: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Eyebrow" value={d.bannerEyebrow} error={s.err.bannerEyebrow} onChange={(e) => set({ bannerEyebrow: e.target.value })} />
            <Input label="Title" value={d.bannerTitle} error={s.err.bannerTitle} onChange={(e) => set({ bannerTitle: e.target.value })} />
          </div>
          <Input label="Line" value={d.bannerBody} error={s.err.bannerBody} onChange={(e) => set({ bannerBody: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Button label" value={d.bannerCtaLabel} error={s.err.bannerCtaLabel} onChange={(e) => set({ bannerCtaLabel: e.target.value })} />
            <Input label="Button link" value={d.bannerCtaHref} error={s.err.bannerCtaHref} onChange={(e) => set({ bannerCtaHref: e.target.value })} placeholder="/shop" />
          </div>
        </Section>
      </Card>
      <SaveBar dirty={s.dirty} busy={s.busy} onSave={s.save} onReset={s.reset} />
    </>
  )
}

function SeoForm({ initial }: { initial: SiteSettings['seo'] }) {
  const s = useSection('seo', initial)
  const d = s.draft
  const set = (patch: Partial<typeof d>) => s.setDraft({ ...d, ...patch })
  return (
    <>
      <Card>
        <Section title="Search result" description="Used for the home page and as the default for other pages.">
          <div className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-xs text-[#1a7f37]">snug-andknot.vercel.app</p>
            <p className="mt-0.5 truncate text-lg text-[#1a0dab]">{d.title || 'Page title'}</p>
            <p className="line-clamp-2 text-sm text-ink/70">{d.description || 'Add a description to control the text under your link.'}</p>
          </div>
          <Input label="Title" value={d.title} error={s.err.title} onChange={(e) => set({ title: e.target.value })} hint={<Counter value={d.title} max={60} />} />
          <Textarea label="Description" rows={3} value={d.description} error={s.err.description} onChange={(e) => set({ description: e.target.value })} hint={<Counter value={d.description} max={160} />} />
        </Section>
        <Section title="Sharing image" description="Shown when a link to the site is shared on social media or in messages. 1200 × 630 works best.">
          <ImageField label="Image" aspect="aspect-[1200/630]" value={d.ogImage} onChange={(v) => set({ ogImage: v })} />
          {s.err.ogImage ? <p className="text-xs text-error">{s.err.ogImage}</p> : null}
        </Section>
      </Card>
      <SaveBar dirty={s.dirty} busy={s.busy} onSave={s.save} onReset={s.reset} />
    </>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export function SettingsAdmin({ settings, tab, payments }: { settings: SiteSettings; tab: SettingsKey; payments: RazorpayConnection }) {
  const router = useRouter()
  const pathname = usePathname()
  const current = TABS.find((t) => t.key === tab) ?? TABS[0]
  return (
    <>
      <PageHeader title="Settings" description={current.blurb} />
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-full border border-ink/10 bg-white/70 p-1 [scrollbar-width:none]" role="tablist" aria-label="Settings sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === current.key}
            onClick={() => router.replace(`${pathname}?tab=${t.key}`, { scroll: false })}
            className={cn('h-9 shrink-0 rounded-full px-4 text-sm transition-colors', t.key === current.key ? 'bg-ink text-ivory' : 'text-ink/70 hover:bg-ink/[0.06]')}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={current.label}>
        {current.key === 'store' ? <StoreForm initial={settings.store} /> : null}
        {current.key === 'commerce' ? <CommerceForm initial={settings.commerce} payments={payments} /> : null}
        {current.key === 'announcement' ? <AnnouncementForm initial={settings.announcement} /> : null}
        {current.key === 'reviews' ? <ReviewsForm initial={settings.reviews} /> : null}
        {current.key === 'homepage' ? <HomepageForm initial={settings.homepage} /> : null}
        {current.key === 'seo' ? <SeoForm initial={settings.seo} /> : null}
      </div>
    </>
  )
}
