'use client'

import Link from 'next/link'
import { useMoney } from '@/components/providers/SettingsProvider'
import RevenueChart from './RevenueChart'
import { Badge, Card, PageHeader, STATUS_TONE } from './ui'
import { formatDate } from '@/lib/format'
import type { Order } from '@/types/commerce'

type Stats = {
  revenue: number
  orders: number
  awaitingFulfilment: number
  averageOrderValue: number
  customers: number
  pendingReviews: number
  newMessages: number
  subscribers: number
  pendingReturns: number
  activeProducts: number
  averageRating: number
  daily: { day: string; revenue: number; orders: number }[]
  lowStock: { id: string; title: string; sku: string; inventory: number; productTitle: string; productId: string }[]
  topProducts: { title: string; handle: string; units: number; revenue: number }[]
}

function Tile({ label, value, href, note }: { label: string; value: string; href?: string; note?: string }) {
  const body = (
    <>
      <p className="text-xs text-stone">{label}</p>
      <p className="mt-2 text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums">{value}</p>
      {note ? <p className="mt-2 text-xs text-stone">{note}</p> : null}
    </>
  )
  return href ? (
    <Link href={href} className="rounded-2xl border border-ink/10 bg-white/70 p-5 transition-colors hover:border-ink/30">
      {body}
    </Link>
  ) : (
    <div className="rounded-2xl border border-ink/10 bg-white/70 p-5">{body}</div>
  )
}

export default function Dashboard({ stats, recent, userName }: { stats: Stats; recent: Order[]; userName: string }) {
  const money = useMoney()
  const todo = [
    stats.awaitingFulfilment && { href: '/admin/orders?status=placed', label: `${stats.awaitingFulfilment} order${stats.awaitingFulfilment === 1 ? '' : 's'} to confirm` },
    stats.pendingReviews && { href: '/admin/reviews', label: `${stats.pendingReviews} review${stats.pendingReviews === 1 ? '' : 's'} to moderate` },
    stats.pendingReturns && { href: '/admin/returns', label: `${stats.pendingReturns} return request${stats.pendingReturns === 1 ? '' : 's'}` },
    stats.newMessages && { href: '/admin/inbox', label: `${stats.newMessages} new message${stats.newMessages === 1 ? '' : 's'}` },
    stats.lowStock.length && { href: '/admin/products', label: `${stats.lowStock.length} size${stats.lowStock.length === 1 ? '' : 's'} low on stock` },
  ].filter(Boolean) as { href: string; label: string }[]

  return (
    <>
      <PageHeader title={`Hello, ${userName.split(' ')[0]}`} description="Here is how the atelier is doing." />

      {todo.length ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {todo.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-full bg-ink px-4 py-2 text-sm text-ivory hover:bg-burgundy">
              {t.label} →
            </Link>
          ))}
        </div>
      ) : (
        <p className="mb-6 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">Everything is up to date.</p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile label="Revenue (all time)" value={money(stats.revenue)} />
        <Tile label="Orders" value={stats.orders.toLocaleString()} href="/admin/orders" note={`${money(stats.averageOrderValue)} average`} />
        <Tile label="Customers" value={stats.customers.toLocaleString()} href="/admin/customers" note={`${stats.subscribers} newsletter subscribers`} />
        <Tile label="Average rating" value={stats.averageRating ? `${stats.averageRating.toFixed(1)} ★` : '—'} href="/admin/reviews" note={`${stats.activeProducts} active products`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <RevenueChart data={stats.daily} />
        </Card>
        <Card title="Best sellers" pad={false}>
          {stats.topProducts.length ? (
            <ul className="divide-y divide-ink/5">
              {stats.topProducts.map((p) => (
                <li key={p.handle} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <Link href={`/product/${p.handle}`} target="_blank" className="truncate hover:text-burgundy">
                    {p.title}
                  </Link>
                  <span className="shrink-0 tabular-nums text-stone">
                    {p.units} sold · {money(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-stone">Sales will show here after the first orders.</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Recent orders" actions={<Link href="/admin/orders" className="text-xs text-stone hover:text-ink">All orders →</Link>} pad={false}>
          {recent.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-ink/5">
                  {recent.map((o) => (
                    <tr key={o.id} className="hover:bg-ink/[0.02]">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs hover:text-burgundy">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="px-3 py-3">{o.customerName}</td>
                      <td className="px-3 py-3 text-stone">{formatDate(o.placedAt)}</td>
                      <td className="px-3 py-3">
                        <Badge tone={STATUS_TONE[o.status]}>{o.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{money(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-5 text-sm text-stone">No orders yet.</p>
          )}
        </Card>
        <Card title="Low stock (5 or fewer)" pad={false}>
          {stats.lowStock.length ? (
            <ul className="divide-y divide-ink/5">
              {stats.lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <Link href={`/admin/products/${v.productId}`} className="min-w-0 hover:text-burgundy">
                    <span className="block truncate">{v.productTitle}</span>
                    <span className="font-mono text-xs text-stone">{v.sku}</span>
                  </Link>
                  <Badge tone={v.inventory === 0 ? 'bad' : 'warn'}>{v.inventory === 0 ? 'sold out' : `${v.inventory} left`}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-stone">Every size is well stocked.</p>
          )}
        </Card>
      </div>
    </>
  )
}
