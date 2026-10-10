import 'server-only'
import { query, type Queryable, type Row } from '@/server/db/client'
import type { Coupon } from '@/types/commerce'
import { num, numOrNull, round2 } from './util'

function mapCoupon(r: Row): Coupon {
  const exp = r.expires_at
  return {
    code: r.code,
    type: r.type,
    value: num(r.value),
    minPurchase: num(r.min_purchase),
    description: r.description,
    expiresAt: exp ? (exp instanceof Date ? exp.toISOString().slice(0, 10) : String(exp).slice(0, 10)) : null,
    active: !!r.active,
    usageLimit: numOrNull(r.usage_limit),
    usedCount: Math.trunc(num(r.used_count)),
  }
}

export async function listCoupons(): Promise<Coupon[]> {
  const rows = await query('SELECT * FROM coupons ORDER BY created_at DESC')
  return rows.map(mapCoupon)
}

export async function getCoupon(code: string, q?: Queryable): Promise<Coupon | null> {
  const rows = await (q ?? { query }).query('SELECT * FROM coupons WHERE upper(code) = upper($1)', [code.trim()])
  return rows[0] ? mapCoupon(rows[0]) : null
}

/** Returns an error message, or null when the coupon applies to this subtotal today. */
export function couponProblem(c: Coupon, subtotal: number, today = new Date()): string | null {
  if (!c.active) return 'This code is no longer active.'
  if (c.expiresAt && c.expiresAt < today.toISOString().slice(0, 10)) return 'This code has expired.'
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return 'This code has reached its usage limit.'
  if (subtotal < c.minPurchase) return `Spend ${c.minPurchase.toFixed(0)} or more to use this code.`
  return null
}

export function couponDiscount(c: Coupon, subtotal: number): number {
  const raw = c.type === 'percentage' ? (subtotal * c.value) / 100 : c.value
  return round2(Math.min(raw, subtotal))
}

export async function upsertCoupon(input: Omit<Coupon, 'usedCount'>): Promise<Coupon> {
  const rows = await query(
    `INSERT INTO coupons (code, type, value, min_purchase, description, expires_at, active, usage_limit)
     VALUES (upper($1), $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (code) DO UPDATE SET type = EXCLUDED.type, value = EXCLUDED.value, min_purchase = EXCLUDED.min_purchase,
       description = EXCLUDED.description, expires_at = EXCLUDED.expires_at, active = EXCLUDED.active,
       usage_limit = EXCLUDED.usage_limit
     RETURNING *`,
    [input.code.trim(), input.type, input.value, input.minPurchase, input.description, input.expiresAt, input.active, input.usageLimit]
  )
  return mapCoupon(rows[0])
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const rows = await query('DELETE FROM coupons WHERE upper(code) = upper($1) RETURNING code', [code])
  return rows.length > 0
}
