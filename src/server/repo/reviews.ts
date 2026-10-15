import 'server-only'
import { query, type Row } from '@/server/db/client'
import type { RatingSummary, Review, ReviewFit, ReviewStatus } from '@/types/commerce'
import { iso, newId, num } from './util'

function mapReview(r: Row): Review {
  return {
    id: r.id,
    productId: r.product_id,
    author: r.author,
    rating: Math.trunc(num(r.rating)),
    title: r.title,
    body: r.body,
    fit: (r.fit ?? null) as ReviewFit | null,
    verified: !!r.verified,
    status: r.status as ReviewStatus,
    helpful: Math.trunc(num(r.helpful)),
    adminReply: r.admin_reply ?? null,
    createdAt: iso(r.created_at),
  }
}

export async function listApprovedReviews(productId: string): Promise<Review[]> {
  const rows = await query(
    `SELECT * FROM reviews WHERE product_id = $1 AND status = 'approved' ORDER BY created_at DESC`,
    [productId]
  )
  return rows.map(mapReview)
}

export async function getRatingSummary(productId: string): Promise<RatingSummary> {
  const rows = await query<{ rating: number; fit: string | null; n: number }>(
    `SELECT rating, fit, count(*)::int AS n FROM reviews
      WHERE product_id = $1 AND status = 'approved' GROUP BY rating, fit`,
    [productId]
  )
  const distribution: RatingSummary['distribution'] = [0, 0, 0, 0, 0]
  const fit = { small: 0, true: 0, large: 0 }
  let total = 0
  let sum = 0
  for (const r of rows) {
    const rating = Math.trunc(num(r.rating))
    const n = Math.trunc(num(r.n))
    distribution[rating - 1] += n
    total += n
    sum += rating * n
    if (r.fit === 'small' || r.fit === 'true' || r.fit === 'large') fit[r.fit] += n
  }
  return { average: total ? Math.round((sum / total) * 10) / 10 : 0, count: total, distribution, fit }
}

export async function findUserReview(productId: string, userId: string): Promise<Review | null> {
  const rows = await query('SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2', [productId, userId])
  return rows[0] ? mapReview(rows[0]) : null
}

/** A "verified" review needs an order placed from this account (not just the same email). */
export async function hasPurchased(productId: string, userId: string): Promise<boolean> {
  const rows = await query(
    `SELECT 1 FROM orders o JOIN order_items i ON i.order_id = o.id
      WHERE i.product_id = $1 AND o.status NOT IN ('cancelled', 'pending_payment') AND o.user_id = $2
      LIMIT 1`,
    [productId, userId]
  )
  return rows.length > 0
}

export async function createReview(input: {
  productId: string
  userId: string
  author: string
  rating: number
  title: string
  body: string
  fit: ReviewFit | null
  verified: boolean
  status: ReviewStatus
}): Promise<Review> {
  const rows = await query(
    `INSERT INTO reviews (id, product_id, user_id, author, rating, title, body, fit, verified, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [
      newId('rev'), input.productId, input.userId, input.author, input.rating, input.title, input.body,
      input.fit, input.verified, input.status,
    ]
  )
  return mapReview(rows[0])
}

export async function markHelpful(id: string): Promise<number | null> {
  const rows = await query<{ helpful: number }>(
    `UPDATE reviews SET helpful = helpful + 1 WHERE id = $1 AND status = 'approved' RETURNING helpful`,
    [id]
  )
  return rows[0] ? Math.trunc(num(rows[0].helpful)) : null
}

/** Latest approved reviews across the catalogue, with store-wide average and count. */
export async function latestApprovedReviews(limit = 6) {
  const rows = await query(
    `SELECT r.*, p.title AS product_title, p.handle AS product_handle
       FROM reviews r JOIN products p ON p.id = r.product_id AND p.status = 'active'
      WHERE r.status = 'approved' ORDER BY r.rating DESC, r.created_at DESC LIMIT $1`,
    [limit]
  )
  const [agg] = await query<{ avg: number; n: number }>(
    `SELECT coalesce(avg(rating), 0)::float8 AS avg, count(*)::int AS n FROM reviews r
       JOIN products p ON p.id = r.product_id AND p.status = 'active' WHERE r.status = 'approved'`
  )
  return {
    reviews: rows.map((r) => ({ ...mapReview(r), productTitle: r.product_title as string, productHandle: r.product_handle as string })),
    average: Math.round(num(agg?.avg) * 10) / 10,
    count: Math.trunc(num(agg?.n)),
  }
}

/* ─────────────────────────── Admin ─────────────────────────── */

export interface AdminReview extends Review {
  productTitle: string
  productHandle: string
  email: string | null
}

export async function listReviewsAdmin(status?: ReviewStatus): Promise<AdminReview[]> {
  const rows = await query(
    `SELECT r.*, p.title AS product_title, p.handle AS product_handle, u.email AS user_email
       FROM reviews r
       JOIN products p ON p.id = r.product_id
       LEFT JOIN users u ON u.id = r.user_id
      ${status ? 'WHERE r.status = $1' : ''}
      ORDER BY (r.status = 'pending') DESC, r.created_at DESC`,
    status ? [status] : []
  )
  return rows.map((r) => ({
    ...mapReview(r),
    userId: r.user_id ?? null,
    productTitle: r.product_title,
    productHandle: r.product_handle,
    email: r.user_email ?? null,
  }))
}

export async function getReviewById(id: string): Promise<Review | null> {
  const rows = await query('SELECT * FROM reviews WHERE id = $1', [id])
  return rows[0] ? mapReview(rows[0]) : null
}

export async function updateReviewAdmin(
  id: string,
  patch: { status?: ReviewStatus; adminReply?: string | null }
): Promise<Review | null> {
  const rows = await query(
    `UPDATE reviews SET
        status = coalesce($2, status),
        admin_reply = CASE WHEN $3::boolean THEN $4 ELSE admin_reply END,
        updated_at = now()
      WHERE id = $1 RETURNING *`,
    [id, patch.status ?? null, patch.adminReply !== undefined, patch.adminReply ?? null]
  )
  return rows[0] ? mapReview(rows[0]) : null
}

export async function deleteReview(id: string): Promise<{ productId: string } | null> {
  const rows = await query<{ product_id: string }>('DELETE FROM reviews WHERE id = $1 RETURNING product_id', [id])
  return rows[0] ? { productId: rows[0].product_id } : null
}
