import 'server-only'
import { query } from '@/server/db/client'
import { getSettings } from './settings'
import { iso, newId, num } from './util'

/* ─────────────────────────── Newsletter ─────────────────────────── */

export async function subscribe(email: string, source: string): Promise<{ created: boolean }> {
  const rows = await query(
    `INSERT INTO subscribers (email, source) VALUES (lower($1), $2) ON CONFLICT (email) DO NOTHING RETURNING email`,
    [email.trim(), source]
  )
  return { created: rows.length > 0 }
}

export async function listSubscribers() {
  const rows = await query('SELECT * FROM subscribers ORDER BY created_at DESC')
  return rows.map((r) => ({ email: r.email as string, source: r.source as string, createdAt: iso(r.created_at) }))
}

export async function deleteSubscriber(email: string) {
  const rows = await query('DELETE FROM subscribers WHERE email = lower($1) RETURNING email', [email])
  return rows.length > 0
}

/* ─────────────────────────── Contact messages ─────────────────────────── */

export type MessageStatus = 'new' | 'read' | 'archived'

export async function createMessage(input: { name: string; email: string; subject: string; body: string }) {
  await query('INSERT INTO messages (id, name, email, subject, body) VALUES ($1, $2, lower($3), $4, $5)', [
    newId('msg'),
    input.name.trim(),
    input.email.trim(),
    input.subject.trim(),
    input.body.trim(),
  ])
}

export async function listMessages() {
  const rows = await query(`SELECT * FROM messages ORDER BY (status = 'new') DESC, created_at DESC`)
  return rows.map((r) => ({
    id: r.id as string,
    name: r.name as string,
    email: r.email as string,
    subject: r.subject as string,
    body: r.body as string,
    status: r.status as MessageStatus,
    createdAt: iso(r.created_at),
  }))
}

type MessageHead = { name: string; email: string; subject: string }

/** `changed` is the message when its status actually moved; a no-op re-mark reports found only. */
export async function setMessageStatus(id: string, status: MessageStatus): Promise<{ found: boolean; changed: MessageHead | null }> {
  const rows = await query<MessageHead>(
    'UPDATE messages SET status = $2 WHERE id = $1 AND status IS DISTINCT FROM $2 RETURNING name, email, subject',
    [id, status]
  )
  if (rows.length) return { found: true, changed: rows[0] }
  const exists = await query('SELECT 1 FROM messages WHERE id = $1', [id])
  return { found: exists.length > 0, changed: null }
}

/** The deleted message's sender and subject, or null when there was nothing to delete. */
export async function deleteMessage(id: string): Promise<MessageHead | null> {
  const [row] = await query<MessageHead>('DELETE FROM messages WHERE id = $1 RETURNING name, email, subject', [id])
  return row ?? null
}

/* ─────────────────────────── Back-in-stock alerts ─────────────────────────── */

export async function createStockAlert(productId: string, variantId: string | null, email: string): Promise<'missing' | 'created' | 'exists'> {
  const exists = await query('SELECT 1 FROM products WHERE id = $1', [productId])
  if (!exists.length) return 'missing'
  const rows = await query(
    `INSERT INTO stock_alerts (id, product_id, variant_id, email) VALUES ($1, $2, $3, lower($4))
     ON CONFLICT DO NOTHING RETURNING id`,
    [newId('alr'), productId, variantId, email.trim()]
  )
  return rows.length ? 'created' : 'exists'
}

export async function listStockAlerts() {
  const rows = await query(
    `SELECT a.*, p.title AS product_title, v.title AS variant_title, coalesce(v.inventory, 0) AS inventory
       FROM stock_alerts a JOIN products p ON p.id = a.product_id
       LEFT JOIN variants v ON v.id = a.variant_id
      ORDER BY a.created_at DESC`
  )
  return rows.map((r) => ({
    id: r.id as string,
    email: r.email as string,
    productTitle: r.product_title as string,
    variantTitle: (r.variant_title as string | null) ?? null,
    inventory: Math.trunc(num(r.inventory)),
    createdAt: iso(r.created_at),
  }))
}

/* ─────────────────────────── Media ─────────────────────────── */

export const MEDIA_MAX_BYTES = 4 * 1024 * 1024
export const MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] as const

export async function saveMedia(filename: string, mime: string, data: Buffer): Promise<string> {
  const id = newId('img')
  await query('INSERT INTO media (id, filename, mime, size, data) VALUES ($1, $2, $3, $4, $5)', [
    id,
    filename.slice(0, 200),
    mime,
    data.length,
    data,
  ])
  return id
}

export async function getMedia(id: string): Promise<{ mime: string; data: Buffer } | null> {
  const rows = await query<{ mime: string; data: Buffer | Uint8Array }>('SELECT mime, data FROM media WHERE id = $1', [id])
  if (!rows[0]) return null
  return { mime: rows[0].mime, data: Buffer.from(rows[0].data) }
}

export async function listMedia() {
  const rows = await query('SELECT id, filename, mime, size, created_at FROM media ORDER BY created_at DESC LIMIT 200')
  return rows.map((r) => ({
    id: r.id as string,
    url: `/api/media/${r.id}`,
    filename: r.filename as string,
    mime: r.mime as string,
    size: Math.trunc(num(r.size)),
    createdAt: iso(r.created_at),
  }))
}

/** The deleted image's file name, or null when there was nothing to delete. */
export async function deleteMedia(id: string): Promise<string | null> {
  const [row] = await query<{ filename: string }>('DELETE FROM media WHERE id = $1 RETURNING filename', [id])
  return row ? row.filename : null
}

/* ─────────────────────────── Customers (admin) ─────────────────────────── */

export async function listCustomers() {
  const rows = await query(
    `SELECT u.id, u.email, u.name, u.role, u.points, u.created_at, u.last_login_at,
            count(o.id) FILTER (WHERE NOT (o.payment_method = 'razorpay' AND o.paid_at IS NULL))::int AS orders,
            -- Amounts in different currencies are never added together: one total per currency.
            (SELECT coalesce(json_agg(json_build_object('currency', t.currency, 'amount', t.amount) ORDER BY t.amount DESC), '[]'::json)
               FROM (SELECT o2.currency, sum(o2.total) AS amount FROM orders o2
                      WHERE o2.user_id = u.id AND o2.status NOT IN ('cancelled', 'pending_payment') GROUP BY o2.currency) t) AS spent
       FROM users u LEFT JOIN orders o ON o.user_id = u.id
      GROUP BY u.id ORDER BY u.created_at DESC`
  )
  return rows.map((r) => ({
    id: r.id as string,
    email: r.email as string,
    name: r.name as string,
    role: r.role as 'customer' | 'admin',
    points: Math.trunc(num(r.points)),
    orders: Math.trunc(num(r.orders)),
    spent: (typeof r.spent === 'string' ? JSON.parse(r.spent) : (r.spent ?? [])).map((x: { currency: string; amount: unknown }) => ({ currency: x.currency, amount: num(x.amount) })) as { currency: string; amount: number }[],
    createdAt: iso(r.created_at),
    lastLoginAt: r.last_login_at ? iso(r.last_login_at) : null,
  }))
}

export async function updateCustomer(
  id: string,
  patch: { role?: 'customer' | 'admin'; points?: number }
): Promise<'ok' | 'not-found' | 'env-admin'> {
  const [target] = await query('SELECT role, managed_by_env FROM users WHERE id = $1', [id])
  if (!target) return 'not-found'
  // The ADMIN_EMAIL account is managed by environment variables, not from the admin panel.
  if (target.managed_by_env === true && patch.role === 'customer') return 'env-admin'
  const roleChanges = patch.role !== undefined && patch.role !== target.role
  await query(
    // A role change signs that person out everywhere, so no session outlives the rights it was issued with.
    `UPDATE users SET role = coalesce($2, role), points = coalesce($3, points),
            session_version = session_version + $4
      WHERE id = $1`,
    [id, patch.role ?? null, patch.points === undefined ? null : Math.max(0, Math.trunc(patch.points)), roleChanges ? 1 : 0]
  )
  return 'ok'
}

/* ─────────────────────────── Dashboard ─────────────────────────── */

/** Money figures are in the base currency; orders in other currencies are reported per currency. */
export async function dashboardStats() {
  const base = (await getSettings()).commerce.currency.toUpperCase()
  const [totals] = await query(
    `SELECT coalesce(sum(total) FILTER (WHERE status NOT IN ('cancelled', 'pending_payment') AND currency = $1), 0) AS revenue,
            count(*) FILTER (WHERE status NOT IN ('cancelled', 'pending_payment'))::int AS orders,
            count(*) FILTER (WHERE status = 'placed')::int AS awaiting,
            coalesce(avg(total) FILTER (WHERE status NOT IN ('cancelled', 'pending_payment') AND currency = $1), 0) AS aov
       FROM orders`,
    [base]
  )
  const other = await query(
    `SELECT currency, sum(total) AS revenue, count(*)::int AS orders FROM orders
      WHERE status NOT IN ('cancelled', 'pending_payment') AND currency <> $1 GROUP BY currency ORDER BY currency`,
    [base]
  )
  const [counts] = await query(
    `SELECT (SELECT count(*)::int FROM users WHERE role = 'customer') AS customers,
            (SELECT count(*)::int FROM reviews WHERE status = 'pending') AS pending_reviews,
            (SELECT count(*)::int FROM messages WHERE status = 'new') AS new_messages,
            (SELECT count(*)::int FROM subscribers) AS subscribers,
            (SELECT count(*)::int FROM returns WHERE status = 'pending') AS pending_returns,
            (SELECT count(*)::int FROM products WHERE status = 'active') AS active_products,
            (SELECT coalesce(avg(rating), 0)::float8 FROM reviews WHERE status = 'approved') AS avg_rating`
  )
  const daily = await query(
    `SELECT to_char(d::date, 'YYYY-MM-DD') AS day,
            coalesce(sum(o.total) FILTER (WHERE o.status NOT IN ('cancelled', 'pending_payment')), 0) AS revenue,
            count(o.id) FILTER (WHERE o.status NOT IN ('cancelled', 'pending_payment'))::int AS orders
       FROM generate_series(current_date - 29, current_date, interval '1 day') d
       LEFT JOIN orders o ON o.placed_at::date = d::date AND o.currency = $1
      GROUP BY d ORDER BY d`,
    [base]
  )
  const lowStock = await query(
    `SELECT v.id, v.title, v.sku, v.inventory, p.title AS product_title, p.id AS product_id
       FROM variants v JOIN products p ON p.id = v.product_id
      WHERE p.status = 'active' AND v.inventory <= 5 ORDER BY v.inventory, p.title LIMIT 12`
  )
  const top = await query(
    `SELECT i.title, i.handle, sum(i.quantity)::int AS units, sum(i.price * i.quantity) AS revenue
       FROM order_items i JOIN orders o ON o.id = i.order_id
      WHERE o.status NOT IN ('cancelled', 'pending_payment') AND o.currency = $1 GROUP BY i.title, i.handle ORDER BY units DESC LIMIT 5`,
    [base]
  )
  return {
    revenue: num(totals.revenue),
    orders: Math.trunc(num(totals.orders)),
    awaitingFulfilment: Math.trunc(num(totals.awaiting)),
    averageOrderValue: Math.round(num(totals.aov) * 100) / 100,
    otherCurrencies: other.map((o) => ({ currency: o.currency as string, revenue: num(o.revenue), orders: Math.trunc(num(o.orders)) })),
    customers: Math.trunc(num(counts.customers)),
    pendingReviews: Math.trunc(num(counts.pending_reviews)),
    newMessages: Math.trunc(num(counts.new_messages)),
    subscribers: Math.trunc(num(counts.subscribers)),
    pendingReturns: Math.trunc(num(counts.pending_returns)),
    activeProducts: Math.trunc(num(counts.active_products)),
    averageRating: Math.round(num(counts.avg_rating) * 10) / 10,
    daily: daily.map((d) => ({ day: d.day as string, revenue: num(d.revenue), orders: Math.trunc(num(d.orders)) })),
    lowStock: lowStock.map((v) => ({
      id: v.id as string,
      title: v.title as string,
      sku: v.sku as string,
      inventory: Math.trunc(num(v.inventory)),
      productTitle: v.product_title as string,
      productId: v.product_id as string,
    })),
    topProducts: top.map((t) => ({
      title: t.title as string,
      handle: t.handle as string,
      units: Math.trunc(num(t.units)),
      revenue: num(t.revenue),
    })),
  }
}
