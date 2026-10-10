'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Btn, Card, Input, PageHeader, Textarea, Toggle, useMutate } from './ui'
import { ImageField } from './ImagePicker'
import { cn } from '@/lib/format'
import type { SettingsKey, SiteSettings } from '@/types/commerce'

const TABS: { key: SettingsKey; label: string; blurb: string }[] = [
  { key: 'store', label: 'Store details', blurb: 'Name, contact details, address and social links. Shown in the header, footer, contact page, policies and order pages.' },
  { key: 'commerce', label: 'Checkout & shipping', blurb: 'Currency, shipping rates, tax, returns and rewards. Prices and totals are recalculated on the server with these values.' },
  { key: 'announcement', label: 'Announcement bar', blurb: 'The rotating line of text above the navigation on every page.' },
  { key: 'reviews', label: 'Reviews', blurb: 'Decide whether new customer reviews need your approval before they appear.' },
  { key: 'homepage', label: 'Home page', blurb: 'The words in the home page hero and the manifesto section.' },
  { key: 'seo', label: 'Search & sharing', blurb: 'How the site appears in Google results and when a link is shared.' },
]

function Section({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
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

function Counter({ value, max }: { value: string; max: number }) {
  return <span className={cn('tabular-nums', value.length > max && 'text-error')}>{value.length} / {max}</span>
}

function SaveBar({ dirty, busy, onSave, onReset }: { dirty: boolean; busy: boolean; onSave: () => void; onReset: () => void }) {
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
function useSection<K extends SettingsKey>(key: K, initial: SiteSettings[K]) {
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

function CommerceForm({ initial }: { initial: SiteSettings['commerce'] }) {
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
        <Section title="Currency" description={<>How prices are shown. Preview: <strong className="font-medium text-ink">{preview}</strong></>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Currency code" value={d.currency} maxLength={3} error={s.err.currency} onChange={(e) => set({ currency: e.target.value.toUpperCase() })} hint="ISO code, e.g. USD, EUR, GBP, INR." className="font-mono uppercase" />
            <Input label="Locale" value={d.locale} error={s.err.locale} onChange={(e) => set({ locale: e.target.value })} hint="Number format, e.g. en-US, en-GB, fr-FR." className="font-mono" />
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
        <Section title="Payment" description="Card payments are not connected yet, so cash on delivery is the only way to pay.">
          <Toggle checked={d.codEnabled} onChange={(v) => set({ codEnabled: v })} label="Accept cash on delivery" description={d.codEnabled ? 'Customers can place orders and pay when they arrive.' : 'Checkout is paused: customers are asked to contact you instead.'} />
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

function HomepageForm({ initial }: { initial: SiteSettings['homepage'] }) {
  const s = useSection('homepage', initial)
  const d = s.draft
  const set = (patch: Partial<typeof d>) => s.setDraft({ ...d, ...patch })
  return (
    <>
      <Card>
        <Section
          title="Hero"
          description={
            <>
              The first screen of the home page. Products in the 3D ring come from your active products and collections.{' '}
              <Link href="/" target="_blank" className="underline">
                Open the home page ↗
              </Link>
            </>
          }
        >
          <Input label="Eyebrow" value={d.heroEyebrow} error={s.err.heroEyebrow} onChange={(e) => set({ heroEyebrow: e.target.value })} hint="The small line above the title." />
          <Input label="Title" value={d.heroTitle} error={s.err.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />
          <Textarea label="Subtitle" rows={2} value={d.heroSubtitle} error={s.err.heroSubtitle} onChange={(e) => set({ heroSubtitle: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Main button label" value={d.primaryCtaLabel} error={s.err.primaryCtaLabel} onChange={(e) => set({ primaryCtaLabel: e.target.value })} />
            <Input label="Main button link" value={d.primaryCtaHref} error={s.err.primaryCtaHref} onChange={(e) => set({ primaryCtaHref: e.target.value })} placeholder="/shop" />
            <Input label="Second button label" value={d.secondaryCtaLabel} error={s.err.secondaryCtaLabel} onChange={(e) => set({ secondaryCtaLabel: e.target.value })} hint="Leave empty to hide it." />
            <Input label="Second button link" value={d.secondaryCtaHref} error={s.err.secondaryCtaHref} onChange={(e) => set({ secondaryCtaHref: e.target.value })} placeholder="/collections" />
          </div>
        </Section>
        <Section title="Manifesto" description="The large statement that reveals word by word as visitors scroll.">
          <Textarea label="Manifesto" rows={4} value={d.manifesto} error={s.err.manifesto} onChange={(e) => set({ manifesto: e.target.value })} hint={<Counter value={d.manifesto} max={600} />} />
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

export function SettingsAdmin({ settings, tab }: { settings: SiteSettings; tab: SettingsKey }) {
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
        {current.key === 'commerce' ? <CommerceForm initial={settings.commerce} /> : null}
        {current.key === 'announcement' ? <AnnouncementForm initial={settings.announcement} /> : null}
        {current.key === 'reviews' ? <ReviewsForm initial={settings.reviews} /> : null}
        {current.key === 'homepage' ? <HomepageForm initial={settings.homepage} /> : null}
        {current.key === 'seo' ? <SeoForm initial={settings.seo} /> : null}
      </div>
    </>
  )
}
