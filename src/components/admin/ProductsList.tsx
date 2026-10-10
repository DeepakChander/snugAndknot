'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMoney } from '@/components/providers/SettingsProvider'
import { Badge, Empty, PageHeader, STATUS_TONE } from './ui'
import { cn, formatDate } from '@/lib/format'
import type { Product } from '@/types/commerce'

export default function ProductsList({ products }: { products: Product[] }) {
  const money = useMoney()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
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

  return (
    <>
      <PageHeader
        title="Products"
        description="Everything on these pages appears on the storefront. Drafts and archived pieces are hidden from customers."
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
      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/10 text-left text-xs text-stone">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Stock</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {rows.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.inventory, 0)
                const out = p.variants.filter((v) => v.inventory === 0).length
                return (
                  <tr key={p.id} className="hover:bg-ink/[0.02]">
                    <td className="px-4 py-3">
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-burgundy">
                        <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-parchment">{p.images[0] ? <Image src={p.images[0].src} alt="" fill sizes="44px" className="object-cover" /> : null}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{p.title}</span>
                          <span className="text-xs text-stone">
                            {p.productType || '—'} · {p.gender} · {p.variants.length} variant{p.variants.length === 1 ? '' : 's'}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {stock}
                      {out ? <span className="ml-2 text-xs text-error">{out} sold out</span> : null}
                    </td>
                    <td className="px-3 py-3 tabular-nums">{money(p.price)}</td>
                    <td className="px-3 py-3 tabular-nums">{p.reviewCount ? `${p.rating.toFixed(1)} (${p.reviewCount})` : '—'}</td>
                    <td className="px-4 py-3 text-stone">{formatDate(p.updatedAt)}</td>
                  </tr>
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
