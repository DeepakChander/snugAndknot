'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrency, useMoney } from '@/components/providers/SettingsProvider'
import { useUIStore } from '@/stores/ui-store'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { Badge, Btn, Card, Empty, Input, PageHeader, Select, Textarea, Toggle, confirmAction, useMutate } from './ui'
import { ImageField, uploadImage } from './ImagePicker'
import { ApiError } from '@/lib/api'
import { cn, formatDate } from '@/lib/format'
import type { Category, Collection, Coupon } from '@/types/commerce'

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

type ProductLite = { id: string; title: string; image: string; status: string }

/* ─────────────────────────── Collections ─────────────────────────── */

function CollectionEditor({ collection, products, onClose }: { collection: Collection | null; products: ProductLite[]; onClose: () => void }) {
  const { run, busy, fieldErrors } = useMutate()
  const [c, setC] = useState<Omit<Collection, 'id'>>(
    collection ?? { handle: '', title: '', subtitle: '', description: '', image: '', productIds: [], featured: true, position: 0 }
  )
  const [touched, setTouched] = useState(!!collection)
  const set = <K extends keyof typeof c>(k: K, v: (typeof c)[K]) => setC((x) => ({ ...x, [k]: v }))
  const chosen = c.productIds.map((id) => products.find((p) => p.id === id)).filter(Boolean) as ProductLite[]
  const available = products.filter((p) => !c.productIds.includes(p.id))

  async function save() {
    const res = collection ? await run('PUT', `/api/admin/collections/${collection.id}`, c, 'Collection saved.') : await run('POST', '/api/admin/collections', c, 'Collection created.')
    if (res) onClose()
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
        <h2 className="font-display text-3xl">{collection ? 'Edit collection' : 'New collection'}</h2>
        <CloseButton onClick={onClose} />
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-6" data-lenis-prevent>
        <Input
          label="Title"
          value={c.title}
          error={fieldErrors.title}
          onChange={(e) => {
            const title = e.target.value
            setC((x) => ({ ...x, title, handle: touched ? x.handle : slug(title) }))
          }}
        />
        <Input
          label="URL handle"
          prefix="/"
          value={c.handle}
          error={fieldErrors.handle}
          hint={`/collections/${c.handle || '…'}`}
          onChange={(e) => {
            setTouched(true)
            set('handle', e.target.value.toLowerCase())
          }}
        />
        <Input label="Subtitle" value={c.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="The cold-weather edit" />
        <Textarea label="Description" rows={3} value={c.description} onChange={(e) => set('description', e.target.value)} />
        <ImageField label="Cover image" value={c.image} onChange={(v) => set('image', v)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Order" type="number" min={0} value={c.position} onChange={(e) => set('position', Number(e.target.value) || 0)} hint="Lower shows first." />
          <div className="pt-6">
            <Toggle checked={c.featured} onChange={(v) => set('featured', v)} label="Featured" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-ink/70">Pieces in this collection ({chosen.length})</p>
          <ul className="space-y-1.5">
            {chosen.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-2">
                <span className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-parchment">{p.image ? <Image src={p.image} alt="" fill sizes="36px" className="object-cover" /> : null}</span>
                <span className="min-w-0 flex-1 truncate text-sm">
                  {p.title} {p.status !== 'active' ? <Badge tone="warn">{p.status}</Badge> : null}
                </span>
                <Btn size="sm" variant="ghost" disabled={i === 0} onClick={() => set('productIds', swap(c.productIds, i, i - 1))} aria-label="Move up">
                  ↑
                </Btn>
                <Btn size="sm" variant="ghost" disabled={i === chosen.length - 1} onClick={() => set('productIds', swap(c.productIds, i, i + 1))} aria-label="Move down">
                  ↓
                </Btn>
                <Btn size="sm" variant="ghost" className="text-error" onClick={() => set('productIds', c.productIds.filter((x) => x !== p.id))}>
                  Remove
                </Btn>
              </li>
            ))}
          </ul>
          {available.length ? (
            <Select label="Add a piece" value="" onChange={(e) => e.target.value && set('productIds', [...c.productIds, e.target.value])} wrapClassName="mt-3">
              <option value="">Choose a product…</option>
              {available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                  {p.status !== 'active' ? ` (${p.status})` : ''}
                </option>
              ))}
            </Select>
          ) : null}
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-ink/10 p-6">
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn onClick={save} loading={busy}>
          Save collection
        </Btn>
      </div>
    </div>
  )
}

function swap<T>(arr: T[], i: number, j: number) {
  const a = [...arr]
  ;[a[i], a[j]] = [a[j], a[i]]
  return a
}

export function CollectionsAdmin({ collections, products }: { collections: Collection[]; products: ProductLite[] }) {
  const { run, busy } = useMutate()
  const [editing, setEditing] = useState<Collection | null | 'new'>(null)
  return (
    <>
      <PageHeader title="Collections" description="Curated groups of pieces, each with its own page, the home page fly-through and the menu." actions={<Btn onClick={() => setEditing('new')}>New collection</Btn>} />
      {collections.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <Card key={c.id} pad={false}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl bg-parchment">{c.image ? <Image src={c.image} alt="" fill sizes="33vw" className="object-cover" unoptimized={c.image.startsWith('/api/media/')} /> : null}</div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <p className="font-display text-2xl">{c.title}</p>
                  {c.featured ? <Badge tone="info">featured</Badge> : null}
                </div>
                <p className="text-xs text-stone">
                  /collections/{c.handle} · {c.productIds.length} piece(s) · order {c.position}
                </p>
                <div className="mt-4 flex gap-2">
                  <Btn size="sm" variant="outline" onClick={() => setEditing(c)}>
                    Edit
                  </Btn>
                  <a href={`/collections/${c.handle}`} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center rounded-full px-3 text-xs hover:bg-ink/[0.06]">
                    View ↗
                  </a>
                  <Btn size="sm" variant="danger" className="ml-auto" loading={busy} onClick={() => confirmAction(`Delete the collection “${c.title}”? The pieces themselves are kept.`) && run('DELETE', `/api/admin/collections/${c.id}`, undefined, 'Collection deleted.')}>
                    Delete
                  </Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty title="No collections yet" />
      )}
      <Overlay open={editing !== null} onClose={() => setEditing(null)} label="Collection editor" side="right" className="bg-[#f6f2ea] text-ink">
        {editing !== null ? <CollectionEditor key={editing === 'new' ? 'new' : editing.id} collection={editing === 'new' ? null : editing} products={products} onClose={() => setEditing(null)} /> : null}
      </Overlay>
    </>
  )
}

/* ─────────────────────────── Categories ─────────────────────────── */

function CategoryRow({ category, isNew, onDone }: { category: Category; isNew?: boolean; onDone?: () => void }) {
  const { run, busy, fieldErrors } = useMutate()
  const [c, setC] = useState(category)
  const [touched, setTouched] = useState(!isNew)
  return (
    <Card>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
        <div className="space-y-3">
          <Input
            label="Title"
            value={c.title}
            error={fieldErrors.title}
            onChange={(e) => {
              const title = e.target.value
              setC((x) => ({ ...x, title, slug: touched ? x.slug : slug(title) }))
            }}
          />
          <Input label="Slug" prefix="/" value={c.slug} disabled={!isNew} error={fieldErrors.slug} hint={isNew ? `/shop/${c.slug || '…'}` : 'Products point at the slug, so it cannot change.'} onChange={(e) => (setTouched(true), setC({ ...c, slug: e.target.value.toLowerCase() }))} />
          <Textarea label="Description" rows={2} value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Badge" maxLength={24} value={c.badge} error={fieldErrors.badge} placeholder="3XL TO 6XL" hint="Optional, e.g. 3XL TO 6XL. Shown beside the name on the home page." onChange={(e) => setC({ ...c, badge: e.target.value })} />
            <Input label="Order" type="number" min={0} value={c.position} onChange={(e) => setC({ ...c, position: Number(e.target.value) || 0 })} hint="Lower shows first." />
          </div>
          <Toggle checked={c.showOnHome} onChange={(v) => setC({ ...c, showOnHome: v })} label="Show on home page" description="Gives this category a tile in the home page's category grid, once it has active pieces." />
        </div>
        <ImageField label="Image" value={c.image} onChange={(v) => setC({ ...c, image: v })} />
        <div className="flex flex-row gap-2 lg:flex-col">
          <Btn size="sm" loading={busy} onClick={async () => (await run(isNew ? 'POST' : 'PUT', isNew ? '/api/admin/categories' : `/api/admin/categories/${category.slug}`, c, isNew ? 'Category created.' : 'Category saved.')) && onDone?.()}>
            {isNew ? 'Create' : 'Save'}
          </Btn>
          {isNew ? (
            <Btn size="sm" variant="ghost" onClick={onDone}>
              Cancel
            </Btn>
          ) : (
            <Btn size="sm" variant="danger" loading={busy} onClick={() => confirmAction(`Delete the category “${category.title}”?`) && run('DELETE', `/api/admin/categories/${category.slug}`, undefined, 'Category deleted.')}>
              Delete
            </Btn>
          )}
        </div>
      </div>
    </Card>
  )
}

export function CategoriesAdmin({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const [adding, setAdding] = useState(false)
  return (
    <>
      <PageHeader title="Categories" description="Categories group pieces by type (e.g. cardigans) and get their own page at /shop/slug. Only categories with active pieces are shown to customers. The home page grid shows them in order, using each image: a cut-out garment on a transparent background looks best." actions={!adding ? <Btn onClick={() => setAdding(true)}>New category</Btn> : undefined} />
      <div className="space-y-3">
        {adding ? <CategoryRow isNew category={{ slug: '', title: '', description: '', image: '', position: categories.length, badge: '', showOnHome: true }} onDone={() => setAdding(false)} /> : null}
        {categories.map((c) => (
          <div key={c.slug}>
            <p className="mb-1 px-1 text-xs text-stone">{counts[c.slug] ?? 0} product(s)</p>
            <CategoryRow category={c} />
          </div>
        ))}
        {!categories.length && !adding ? <Empty title="No categories" /> : null}
      </div>
    </>
  )
}

/* ─────────────────────────── Coupons ─────────────────────────── */

function CouponEditor({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) {
  const { run, busy, fieldErrors } = useMutate()
  const { all } = useCurrency()
  const extra = all.slice(1)
  // Per additional currency: fixed amount (fixed codes) and minimum spend, as typed.
  const [amounts, setAmounts] = useState<Record<string, { value: string; minPurchase: string }>>(() =>
    Object.fromEntries(Object.entries(coupon?.amounts ?? {}).map(([k, a]) => [k, { value: a.value ? String(a.value) : '', minPurchase: a.minPurchase ? String(a.minPurchase) : '' }]))
  )
  const [c, setC] = useState({
    code: coupon?.code ?? '',
    type: coupon?.type ?? ('percentage' as Coupon['type']),
    value: coupon ? String(coupon.value) : '10',
    minPurchase: coupon ? String(coupon.minPurchase) : '0',
    description: coupon?.description ?? '',
    expiresAt: coupon?.expiresAt ?? '',
    active: coupon?.active ?? true,
    usageLimit: coupon?.usageLimit ? String(coupon.usageLimit) : '',
  })
  async function save() {
    const amountsBody = Object.fromEntries(
      extra
        .map((x) => [x.code, amounts[x.code]] as const)
        .filter(([, a]) => a && (a.value.trim() !== '' || a.minPurchase.trim() !== ''))
        .map(([code, a]) => [code, { value: a!.value.trim() === '' ? null : Number(a!.value), minPurchase: Number(a!.minPurchase) || 0 }])
    )
    const body = { ...c, value: Number(c.value), minPurchase: Number(c.minPurchase) || 0, expiresAt: c.expiresAt || null, usageLimit: c.usageLimit ? Number(c.usageLimit) : null, amounts: amountsBody }
    const res = coupon ? await run('PUT', `/api/admin/coupons/${encodeURIComponent(coupon.code)}`, body, 'Code saved.') : await run('POST', '/api/admin/coupons', body, 'Code created.')
    if (res) onClose()
  }
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
        <h2 className="font-display text-3xl">{coupon ? `Edit ${coupon.code}` : 'New discount code'}</h2>
        <CloseButton onClick={onClose} />
      </div>
      <div className="flex-1 space-y-4 p-6">
        <Input label="Code" value={c.code} disabled={!!coupon} error={fieldErrors.code} onChange={(e) => setC({ ...c, code: e.target.value.toUpperCase().replace(/\s/g, '') })} hint="Letters, numbers, - and _. Customers type this at checkout." className="font-mono tracking-wider" />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Type" value={c.type} onChange={(e) => setC({ ...c, type: e.target.value as Coupon['type'] })}>
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
          </Select>
          <Input label={c.type === 'percentage' ? 'Percent' : 'Amount'} type="number" min={0} step="0.01" value={c.value} error={fieldErrors.value} onChange={(e) => setC({ ...c, value: e.target.value })} />
        </div>
        <Input label={extra.length ? `Minimum spend (${all[0].code})` : 'Minimum spend'} type="number" min={0} step="0.01" value={c.minPurchase} onChange={(e) => setC({ ...c, minPurchase: e.target.value })} />
        {extra.map((x) => {
          const a = amounts[x.code] ?? { value: '', minPurchase: '' }
          const setA = (patch: Partial<typeof a>) => setAmounts({ ...amounts, [x.code]: { ...a, ...patch } })
          return (
            <div key={x.code} className="grid grid-cols-2 gap-4 rounded-xl bg-ink/[0.03] p-3">
              {c.type === 'fixed' ? (
                <Input label={`Amount (${x.code})`} type="number" min={0} step="0.01" value={a.value} error={fieldErrors[`amounts.${x.code}.value`]} onChange={(e) => setA({ value: e.target.value })} hint={a.value.trim() ? undefined : `Empty: the code cannot be used in ${x.code}.`} />
              ) : (
                <p className="self-center text-xs text-stone">The percentage applies in {x.code} too.</p>
              )}
              <Input label={`Minimum spend (${x.code})`} type="number" min={0} step="0.01" value={a.minPurchase} onChange={(e) => setA({ minPurchase: e.target.value })} hint={c.type === 'percentage' && Number(c.minPurchase) > 0 && !a.minPurchase.trim() ? `Set one, or the code cannot be used in ${x.code}.` : undefined} />
            </div>
          )
        })}
        <Input label="Description (shown to customers)" value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} placeholder="10% off your first order" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Expires on (optional)" type="date" value={c.expiresAt} error={fieldErrors.expiresAt} onChange={(e) => setC({ ...c, expiresAt: e.target.value })} />
          <Input label="Usage limit (optional)" type="number" min={1} value={c.usageLimit} onChange={(e) => setC({ ...c, usageLimit: e.target.value })} hint="Total uses across all customers." />
        </div>
        <Toggle checked={c.active} onChange={(v) => setC({ ...c, active: v })} label="Active" description="Inactive codes are refused at checkout." />
      </div>
      <div className="flex justify-end gap-2 border-t border-ink/10 p-6">
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn onClick={save} loading={busy}>
          Save code
        </Btn>
      </div>
    </div>
  )
}

export function CouponsAdmin({ coupons }: { coupons: Coupon[] }) {
  const money = useMoney()
  const { run, busy } = useMutate()
  const [editing, setEditing] = useState<Coupon | null | 'new'>(null)
  const today = new Date().toISOString().slice(0, 10)
  return (
    <>
      <PageHeader title="Discount codes" description="Codes customers can enter in their bag or at checkout. Each use is counted when an order is placed." actions={<Btn onClick={() => setEditing('new')}>New code</Btn>} />
      {coupons.length ? (
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-ink/10 text-left text-xs text-stone">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-3 py-3 font-medium">Discount</th>
                <th className="px-3 py-3 font-medium">Minimum</th>
                <th className="px-3 py-3 font-medium">Used</th>
                <th className="px-3 py-3 font-medium">Expires</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {coupons.map((c) => {
                const expired = !!c.expiresAt && c.expiresAt < today
                const exhausted = c.usageLimit !== null && c.usedCount >= c.usageLimit
                return (
                  <tr key={c.code}>
                    <td className="px-4 py-3">
                      <span className="font-mono tracking-wider">{c.code}</span>
                      <span className="block text-xs text-stone">{c.description}</span>
                    </td>
                    <td className="px-3 py-3">{c.type === 'percentage' ? `${c.value}%` : money(c.value)}</td>
                    <td className="px-3 py-3">{c.minPurchase ? money(c.minPurchase) : '—'}</td>
                    <td className="px-3 py-3 tabular-nums">
                      {c.usedCount}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                    </td>
                    <td className="px-3 py-3 text-stone">{c.expiresAt ? formatDate(`${c.expiresAt}T12:00:00`) : 'Never'}</td>
                    <td className="px-3 py-3">
                      <Badge tone={!c.active ? 'neutral' : expired || exhausted ? 'bad' : 'good'}>{!c.active ? 'inactive' : expired ? 'expired' : exhausted ? 'used up' : 'active'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Btn size="sm" variant="outline" onClick={() => setEditing(c)}>
                        Edit
                      </Btn>{' '}
                      <Btn size="sm" variant="ghost" className="text-error" loading={busy} onClick={() => confirmAction(`Delete ${c.code}?`) && run('DELETE', `/api/admin/coupons/${encodeURIComponent(c.code)}`, undefined, 'Code deleted.')}>
                        Delete
                      </Btn>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No discount codes" />
      )}
      <Overlay open={editing !== null} onClose={() => setEditing(null)} label="Discount code editor" side="right" className="bg-[#f6f2ea] text-ink">
        {editing !== null ? <CouponEditor key={editing === 'new' ? 'new' : editing.code} coupon={editing === 'new' ? null : editing} onClose={() => setEditing(null)} /> : null}
      </Overlay>
    </>
  )
}

/* ─────────────────────────── Media ─────────────────────────── */

type MediaItem = { id: string; url: string; filename: string; mime: string; size: number; createdAt: string }

export function MediaAdmin({ media }: { media: MediaItem[] }) {
  const { run, busy } = useMutate()
  const router = useRouter()
  const addToast = useUIStore((s) => s.addToast)
  const file = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [drag, setDrag] = useState(false)

  async function upload(files: File[]) {
    if (!files.length) return
    setUploading(true)
    let ok = 0
    for (const f of files) {
      try {
        await uploadImage(f)
        ok++
      } catch (err) {
        addToast(`${f.name}: ${err instanceof ApiError ? err.message : 'upload failed'}`, 'error')
      }
    }
    setUploading(false)
    if (ok) {
      addToast(`${ok} image(s) uploaded.`)
      router.refresh()
    }
  }

  return (
    <>
      <PageHeader title="Media" description="Images uploaded here are stored in your database and can be used for products, collections and categories. JPEG, PNG, WebP, AVIF or GIF up to 4 MB." actions={<Btn loading={uploading} onClick={() => file.current?.click()}>Upload images</Btn>} />
      <input ref={file} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden" onChange={(e) => (upload(Array.from(e.target.files ?? [])), (e.target.value = ''))} />
      <div
        onDragOver={(e) => (e.preventDefault(), setDrag(true))}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          upload(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/')))
        }}
        className={cn('mb-6 rounded-2xl border-2 border-dashed px-6 py-10 text-center text-sm text-stone transition-colors', drag ? 'border-burgundy bg-burgundy/5' : 'border-ink/15')}
      >
        Drop images here to upload
      </div>
      {media.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {media.map((m) => (
            <figure key={m.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
              <div className="relative aspect-square bg-parchment">
                <Image src={m.url} alt={m.filename} fill sizes="20vw" className="object-cover" unoptimized />
              </div>
              <figcaption className="space-y-2 p-3">
                <p className="truncate text-xs" title={m.filename}>
                  {m.filename}
                </p>
                <p className="text-[11px] text-stone">
                  {(m.size / 1024).toFixed(0)} KB · {formatDate(m.createdAt)}
                </p>
                <div className="flex gap-1">
                  <Btn
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(m.url).catch(() => {})
                      addToast('Image URL copied.')
                    }}
                  >
                    Copy URL
                  </Btn>
                  <Btn size="sm" variant="ghost" className="text-error" loading={busy} onClick={() => confirmAction('Delete this image? Anything still using it will show a broken image.') && run('DELETE', `/api/admin/media/${m.id}`, undefined, 'Image deleted.')}>
                    Delete
                  </Btn>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <Empty title="No uploads yet">Uploaded images appear here.</Empty>
      )}
    </>
  )
}
