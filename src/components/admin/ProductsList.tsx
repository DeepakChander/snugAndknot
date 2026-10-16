'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useMemo, useState } from 'react'
import { useCurrency, useMoney } from '@/components/providers/SettingsProvider'
import { Badge, Btn, Empty, PageHeader, STATUS_TONE, confirmAction, useMutate } from './ui'
import { cn, formatDate } from '@/lib/format'
import type { Product } from '@/types/commerce'

type Status = Product['status']
const cell = 'h-9 rounded-lg border border-ink/15 bg-white px-2.5 text-sm tabular-nums outline-none focus:border-ink/50'

/** Each size's stock, with a one-click sold out per size and for the whole piece. */
function StockPanel({ product, onDone }: { product: Product; onDone: () => void }) {
  const { run, busy } = useMutate()
  const [stock, setStock] = useState(() => Object.fromEntries(product.variants.map((v) => [v.id, String(v.inventory)])))
  const save = async (values: Record<string, string>) => {
    const variants = product.variants.map((v) => ({ id: v.id, inventory: Math.max(0, parseInt(values[v.id], 10) || 0) }))
    if (await run('POST', '/api/admin/products/actions', { action: 'inventory', id: product.id, variants }, 'Stock saved.')) onDone()
  }
  return (
    <div className="space-y-4">
      <p className="text-xs text-stone">Stock per size. 0 shows the size as sold out; customers waiting for a size are told when it comes back.</p>
      <div className="flex flex-wrap gap-3">
        {product.variants.map((v) => (
          <label key={v.id} className="flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-2 text-sm">
            <span className="min-w-12 font-medium">{v.size || v.title}</span>
            <input type="number" min={0} step={1} value={stock[v.id]} onChange={(e) => setStock({ ...stock, [v.id]: e.target.value })} className={cn(cell, 'w-20', (parseInt(stock[v.id], 10) || 0) === 0 && 'border-error/40')} aria-label={`Stock of ${v.size || v.title}`} />
            <button type="button" onClick={() => setStock({ ...stock, [v.id]: '0' })} className="text-xs text-stone underline hover:text-ink">
              Sold out
            </button>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Btn size="sm" loading={busy} onClick={() => save(stock)}>
          Save stock
        </Btn>
        <Btn size="sm" variant="outline" loading={busy} onClick={() => save(Object.fromEntries(product.variants.map((v) => [v.id, '0'])))}>
          Mark whole piece sold out
        </Btn>
        <Btn size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Btn>
      </div>
    </div>
  )
}

/** One price for every size, in the base currency and each additional one. */
function PricePanel({ product, onDone }: { product: Product; onDone: () => void }) {
  const { run, busy, fieldErrors } = useMutate()
  const { all } = useCurrency()
  const [base, ...extra] = all
  const [price, setPrice] = useState(String(product.price))
  const [compareAt, setCompareAt] = useState(product.compareAtPrice === null ? '' : String(product.compareAtPrice))
  const [book, setBook] = useState(() =>
    Object.fromEntries(extra.map((c) => [c.code, { price: product.prices[c.code] ? String(product.prices[c.code].price) : '', compareAt: product.prices[c.code]?.compareAtPrice ? String(product.prices[c.code].compareAtPrice) : '' }]))
  )
  const sizesDiffer = product.variants.some((v) => v.price !== product.price || JSON.stringify(v.prices) !== JSON.stringify(product.prices))
  const save = async () => {
    const prices = Object.fromEntries(
      Object.entries(book)
        .filter(([, v]) => v.price.trim() !== '')
        .map(([code, v]) => [code, { price: Number(v.price), compareAtPrice: v.compareAt.trim() ? Number(v.compareAt) : null }])
    )
    const body = { action: 'price', id: product.id, price: Number(price), compareAtPrice: compareAt.trim() ? Number(compareAt) : null, prices }
    if (await run('POST', '/api/admin/products/actions', body, 'Prices saved.')) onDone()
  }
  const row = (code: string, p: string, c: string, setP: (v: string) => void, setC: (v: string) => void, err?: string) => (
    <div key={code} className="flex flex-wrap items-center gap-2">
      <span className="w-12 text-sm font-medium">{code}</span>
      <input type="number" min={0} step="0.01" value={p} onChange={(e) => setP(e.target.value)} placeholder={code === base.code ? 'Price' : 'Not sold'} className={cn(cell, 'w-28')} aria-label={`Price in ${code}`} />
      <input type="number" min={0} step="0.01" value={c} onChange={(e) => setC(e.target.value)} placeholder="Was (optional)" className={cn(cell, 'w-32')} aria-label={`Compare-at price in ${code}`} />
      {err ? <span className="text-xs text-error">{err}</span> : null}
    </div>
  )
  return (
    <div className="space-y-3">
      <p className="text-xs text-stone">
        The price for every size. &ldquo;Was&rdquo; shows a sale (it must be higher). Leave an extra currency empty to stop selling the piece in it.
        {sizesDiffer ? <span className="text-gold-deep"> This piece&apos;s sizes have their own prices now; saving here gives them all this one.</span> : null}
      </p>
      {row(base.code, price, compareAt, setPrice, setCompareAt, fieldErrors.price || fieldErrors.compareAtPrice)}
      {extra.map((c) =>
        row(
          c.code,
          book[c.code].price,
          book[c.code].compareAt,
          (v) => setBook({ ...book, [c.code]: { ...book[c.code], price: v } }),
          (v) => setBook({ ...book, [c.code]: { ...book[c.code], compareAt: v } }),
          fieldErrors[`prices.${c.code}.compareAtPrice`] || fieldErrors[`prices.${c.code}.price`]
        )
      )}
      <div className="flex gap-2 pt-1">
        <Btn size="sm" loading={busy} onClick={save}>
          Save prices
        </Btn>
        <Btn size="sm" variant="ghost" onClick={onDone}>
          Cancel
        </Btn>
      </div>
    </div>
  )
}

export default function ProductsList({ products }: { products: Product[] }) {
  const money = useMoney()
  const { run, busy } = useMutate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | Status>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<{ id: string; panel: 'stock' | 'price' } | null>(null)
  const rows = useMemo(
    () =>
      products.filter(
        (p) =>
          (status === 'all' || p.status === status) &&
          (!q.trim() || [p.title, p.handle, p.productType, p.category, ...p.variants.map((v) => v.sku)].join(' ').toLowerCase().includes(q.trim().toLowerCase()))
      ),
    [products, q, status]
  )
  const counts = { all: products.length, active: 0, draft: 0, archived: 0 } as Record<string, number>
  products.forEach((p) => (counts[p.status] += 1))

  // Only products still on the list count as selected (a filter change or a delete drops the rest).
  const chosen = rows.filter((p) => selected.has(p.id)).map((p) => p.id)
  const allChosen = rows.length > 0 && chosen.length === rows.length
  const toggle = (id: string) => setSelected((s) => (s.has(id) ? new Set([...s].filter((x) => x !== id)) : new Set([...s, id])))
  const act = async (body: Record<string, unknown>, success: string) => {
    if (await run('POST', '/api/admin/products/actions', body, success)) setSelected(new Set())
  }
  const many = (n: number) => `${n} product${n === 1 ? '' : 's'}`

  return (
    <>
      <PageHeader
        title="Products"
        description="Everything on these pages appears on the storefront. Drafts and archived pieces are hidden from customers. Tick pieces to change many at once; Stock and Price change one piece without opening it."
        actions={
          <Link href="/admin/products/new" className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-ivory hover:bg-burgundy">
            New product
          </Link>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-ink/10 bg-white/70 p-1">
          {(['all', 'active', 'draft', 'archived'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={cn('rounded-full px-3.5 py-1.5 text-sm capitalize', status === s ? 'bg-ink text-ivory' : 'text-ink/70 hover:text-ink')}>
              {s} <span className="ml-1 text-xs opacity-60">{counts[s]}</span>
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, handle or SKU" className="h-10 min-w-[240px] flex-1 rounded-full border border-ink/15 bg-white px-4 text-sm outline-none focus:border-ink/50" />
      </div>

      {chosen.length ? (
        <div role="toolbar" aria-label="Change the selected products" className="sticky top-2 z-10 mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-ink px-4 py-3 text-sm text-ivory">
          <span className="mr-2 font-medium">{many(chosen.length)} selected</span>
          <Btn size="sm" variant="outline" disabled={busy} onClick={() => act({ action: 'status', ids: chosen, status: 'active' }, 'Shown in the shop.')} className="bg-ivory text-ink">
            Show in shop
          </Btn>
          <Btn size="sm" variant="outline" disabled={busy} onClick={() => act({ action: 'status', ids: chosen, status: 'draft' }, 'Hidden as drafts.')} className="bg-ivory text-ink">
            Hide (draft)
          </Btn>
          <Btn size="sm" variant="outline" disabled={busy} onClick={() => act({ action: 'status', ids: chosen, status: 'archived' }, 'Archived.')} className="bg-ivory text-ink">
            Archive
          </Btn>
          <Btn size="sm" variant="outline" disabled={busy} onClick={() => confirmAction(`Mark every size of ${many(chosen.length)} sold out?`) && act({ action: 'sold-out', ids: chosen }, 'Marked sold out.')} className="bg-ivory text-ink">
            Mark sold out
          </Btn>
          <Btn
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              const n = parseInt(window.prompt('Back in stock: how many of each sold-out size?', '10') ?? '', 10)
              if (n > 0) void act({ action: 'restock', ids: chosen, quantity: n }, 'Back in stock.')
            }}
            className="bg-ivory text-ink"
          >
            Back in stock
          </Btn>
          <Btn size="sm" variant="danger" disabled={busy} onClick={() => confirmAction(`Delete ${many(chosen.length)}? This removes them, their sizes and their reviews. Orders keep their history.`) && act({ action: 'delete', ids: chosen }, 'Deleted.')} className="bg-ivory">
            Delete
          </Btn>
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-xs text-ivory/70 underline hover:text-ivory">
            Clear selection
          </button>
        </div>
      ) : null}

      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-xs text-stone">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" checked={allChosen} onChange={() => setSelected(allChosen ? new Set() : new Set(rows.map((p) => p.id)))} aria-label="Select every product shown" className="h-4 w-4 accent-ink" />
                </th>
                <th className="px-2 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Stock</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Quick changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {rows.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.inventory, 0)
                const out = p.variants.filter((v) => v.inventory === 0).length
                const soldOut = p.variants.length > 0 && out === p.variants.length
                const priced = Object.keys(p.prices)
                return (
                  <Fragment key={p.id}>
                    <tr className={cn('hover:bg-ink/[0.02]', selected.has(p.id) && 'bg-ink/[0.03]')}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Select ${p.title}`} className="h-4 w-4 accent-ink" />
                      </td>
                      <td className="px-2 py-3">
                        <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-burgundy">
                          <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-parchment">{p.images[0] ? <Image src={p.images[0].src} alt="" fill sizes="44px" className="object-cover" /> : null}</span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{p.title}</span>
                            <span className="text-xs text-stone">
                              {p.gender} · {p.category || 'no category'} · {p.variants.length} size{p.variants.length === 1 ? '' : 's'}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                      </td>
                      <td className="px-3 py-3 tabular-nums">
                        {soldOut ? <Badge tone="bad">sold out</Badge> : stock}
                        {out && !soldOut ? <span className="ml-2 text-xs text-error">{out} size{out === 1 ? '' : 's'} sold out</span> : null}
                      </td>
                      <td className="px-3 py-3 tabular-nums">
                        {money(p.price)}
                        <span className="block text-xs text-stone">{priced.length ? `also ${priced.join(', ')}` : 'base currency only'}</span>
                      </td>
                      <td className="px-3 py-3 text-stone">{formatDate(p.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Btn size="sm" variant={open?.id === p.id && open.panel === 'stock' ? 'primary' : 'outline'} onClick={() => setOpen(open?.id === p.id && open.panel === 'stock' ? null : { id: p.id, panel: 'stock' })}>
                            Stock
                          </Btn>
                          <Btn size="sm" variant={open?.id === p.id && open.panel === 'price' ? 'primary' : 'outline'} onClick={() => setOpen(open?.id === p.id && open.panel === 'price' ? null : { id: p.id, panel: 'price' })}>
                            Price
                          </Btn>
                          <Btn size="sm" variant="danger" disabled={busy} onClick={() => confirmAction(`Delete “${p.title}”? This removes it, its sizes and its reviews. Orders keep their history.`) && act({ action: 'delete', ids: [p.id] }, 'Product deleted.')}>
                            Delete
                          </Btn>
                        </div>
                      </td>
                    </tr>
                    {open?.id === p.id ? (
                      <tr className="bg-bone/60">
                        <td />
                        <td colSpan={6} className="px-2 py-4 pr-4">
                          {open.panel === 'stock' ? <StockPanel product={p} onDone={() => setOpen(null)} /> : <PricePanel product={p} onDone={() => setOpen(null)} />}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No products match">Try another search or status.</Empty>
      )}
    </>
  )
}

