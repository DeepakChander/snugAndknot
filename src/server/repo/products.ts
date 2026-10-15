import 'server-only'
import { query, tx, type Queryable, type Row } from '@/server/db/client'
import type {
  ColorSwatch,
  Gender,
  Product,
  ProductDetails,
  ProductImage,
  ProductStatus,
  PriceBook,
  SortOption,
  Variant,
} from '@/types/commerce'
import { iso, json, num, numOrNull } from './util'

const PRODUCT_SELECT = `
SELECT p.*,
       coalesce(r.avg_rating, 0)  AS rating,
       coalesce(r.review_count, 0) AS review_count,
       coalesce(v.variants, '[]'::json) AS variants_json
  FROM products p
  LEFT JOIN (
        SELECT product_id, avg(rating)::float8 AS avg_rating, count(*)::int AS review_count
          FROM reviews WHERE status = 'approved' GROUP BY product_id
       ) r ON r.product_id = p.id
  LEFT JOIN (
        SELECT product_id,
               json_agg(json_build_object(
                 'id', id, 'title', title, 'sku', sku, 'size', size, 'color', color,
                 'price', price, 'compareAtPrice', compare_at_price,
                 'inventory', inventory, 'position', position, 'prices', prices
               ) ORDER BY position, id) AS variants
          FROM variants GROUP BY product_id
       ) v ON v.product_id = p.id
`

function mapVariant(v: Row): Variant {
  const inventory = Math.max(0, Math.trunc(num(v.inventory)))
  return {
    id: String(v.id),
    title: String(v.title),
    sku: String(v.sku),
    size: v.size ?? null,
    color: v.color ?? null,
    price: num(v.price),
    compareAtPrice: numOrNull(v.compareAtPrice),
    inventory,
    available: inventory > 0,
    position: Math.trunc(num(v.position)),
    prices: priceBook(v.prices),
  }
}

/** Prices per additional currency, defensively normalised (numbers, no empty entries). */
export function priceBook(v: unknown): PriceBook {
  const out: PriceBook = {}
  for (const [code, p] of Object.entries(json<Record<string, { price?: unknown; compareAtPrice?: unknown }>>(v, {}) ?? {})) {
    if (!/^[A-Z]{3}$/.test(code) || !p || p.price === null || p.price === undefined) continue
    out[code] = { price: num(p.price), compareAtPrice: numOrNull(p.compareAtPrice) }
  }
  return out
}

export function mapProduct(r: Row): Product {
  return {
    id: r.id,
    handle: r.handle,
    title: r.title,
    description: r.description,
    details: json<ProductDetails>(r.details, {}),
    vendor: r.vendor,
    productType: r.product_type,
    gender: r.gender as Gender,
    category: r.category,
    tags: r.tags ?? [],
    price: num(r.price),
    compareAtPrice: numOrNull(r.compare_at_price),
    prices: priceBook(r.prices),
    images: json<ProductImage[]>(r.images, []),
    colors: json<ColorSwatch[]>(r.colors, []),
    sizes: r.sizes ?? [],
    featured: !!r.featured,
    isNew: !!r.is_new,
    bestseller: !!r.bestseller,
    status: r.status as ProductStatus,
    seoTitle: r.seo_title ?? null,
    seoDescription: r.seo_description ?? null,
    variants: json<Row[]>(r.variants_json, []).map(mapVariant),
    rating: Math.round(num(r.rating) * 10) / 10,
    reviewCount: Math.trunc(num(r.review_count)),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  }
}

export interface ProductQuery {
  status?: ProductStatus | 'any'
  gender?: Gender
  category?: string
  search?: string
  ids?: string[]
  featured?: boolean
  isNew?: boolean
  sizes?: string[]
  colors?: string[]
  minPrice?: number
  maxPrice?: number
  sort?: SortOption
  limit?: number
}

const ORDER_BY: Record<SortOption, string> = {
  featured: 'p.featured DESC, p.bestseller DESC, p.created_at DESC',
  newest: 'p.created_at DESC',
  'price-asc': 'p.price ASC, p.created_at DESC',
  'price-desc': 'p.price DESC, p.created_at DESC',
  rating: 'rating DESC, review_count DESC, p.created_at DESC',
}

export async function listProducts(opts: ProductQuery = {}): Promise<Product[]> {
  const where: string[] = []
  const params: unknown[] = []
  const p = (v: unknown) => {
    params.push(v)
    return `$${params.length}`
  }

  const status = opts.status ?? 'active'
  if (status !== 'any') where.push(`p.status = ${p(status)}`)
  if (opts.gender) {
    // Unisex pieces appear in both the men's and women's edits.
    where.push(
      opts.gender === 'men' || opts.gender === 'women'
        ? `p.gender IN (${p(opts.gender)}, 'unisex')`
        : `p.gender = ${p(opts.gender)}`
    )
  }
  if (opts.category) where.push(`p.category = ${p(opts.category)}`)
  if (opts.ids) where.push(`p.id = ANY(${p(opts.ids)}::text[])`)
  if (opts.featured) where.push('p.featured')
  if (opts.isNew) where.push('p.is_new')
  if (opts.minPrice !== undefined) where.push(`p.price >= ${p(opts.minPrice)}`)
  if (opts.maxPrice !== undefined) where.push(`p.price <= ${p(opts.maxPrice)}`)
  if (opts.sizes?.length) where.push(`p.sizes && ${p(opts.sizes)}::text[]`)
  if (opts.colors?.length) {
    where.push(
      `EXISTS (SELECT 1 FROM jsonb_array_elements(p.colors) c WHERE c->>'name' = ANY(${p(opts.colors)}::text[]))`
    )
  }
  if (opts.search?.trim()) {
    const term = p(`%${opts.search.trim().replace(/[%_\\]/g, (m) => `\\${m}`)}%`)
    where.push(`(p.title ILIKE ${term} OR p.description ILIKE ${term} OR p.product_type ILIKE ${term}
      OR p.category ILIKE ${term} OR EXISTS (SELECT 1 FROM unnest(p.tags) t WHERE t ILIKE ${term}))`)
  }

  const sql = `${PRODUCT_SELECT}
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY ${ORDER_BY[opts.sort as SortOption] ?? ORDER_BY.featured}
    ${opts.limit ? `LIMIT ${Math.max(1, Math.min(200, Math.trunc(opts.limit)))}` : ''}`
  const rows = await query(sql, params)
  const products = rows.map(mapProduct)

  if (opts.ids) {
    // Preserve the caller's ordering (collections are curated).
    const order = new Map(opts.ids.map((id, i) => [id, i]))
    products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
  }
  return products
}

export async function getProductByHandle(handle: string, opts: { includeDrafts?: boolean } = {}) {
  const rows = await query(
    `${PRODUCT_SELECT} WHERE p.handle = $1 ${opts.includeDrafts ? '' : "AND p.status = 'active'"}`,
    [handle]
  )
  return rows[0] ? mapProduct(rows[0]) : null
}

export async function getProductById(id: string) {
  const rows = await query(`${PRODUCT_SELECT} WHERE p.id = $1`, [id])
  return rows[0] ? mapProduct(rows[0]) : null
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const rows = await query(
    `${PRODUCT_SELECT}
      WHERE p.status = 'active' AND p.id <> $1
      ORDER BY (p.category = $2)::int + (p.gender = $3)::int DESC, p.featured DESC, p.created_at DESC
      LIMIT $4`,
    [product.id, product.category, product.gender, limit]
  )
  return rows.map(mapProduct)
}

export async function getCatalogFacets() {
  const rows = await query<{ sizes: string[] | null; colors: ColorSwatch[] | null; min: number; max: number }>(
    `SELECT (SELECT array_agg(DISTINCT s) FROM products p2, unnest(p2.sizes) s WHERE p2.status = 'active') AS sizes,
            (SELECT json_agg(DISTINCT c) FROM products p3, jsonb_array_elements(p3.colors) c WHERE p3.status = 'active') AS colors,
            coalesce(min(price), 0) AS min, coalesce(max(price), 0) AS max
       FROM products WHERE status = 'active'`
  )
  const r = rows[0]
  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size']
  const sizes = (r?.sizes ?? []).slice().sort((a, b) => {
    const ia = sizeOrder.indexOf(a)
    const ib = sizeOrder.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b)
  })
  const seen = new Set<string>()
  const colors = (json<ColorSwatch[]>(r?.colors, []) ?? []).filter((c) => {
    if (!c?.name || seen.has(c.name)) return false
    seen.add(c.name)
    return true
  })
  return { sizes, colors, priceRange: [num(r?.min), num(r?.max)] as [number, number] }
}

/* ─────────────────────────── Admin writes ─────────────────────────── */

export interface ProductInput {
  handle: string
  title: string
  description: string
  details: ProductDetails
  vendor: string
  productType: string
  gender: Gender
  category: string
  tags: string[]
  price: number
  compareAtPrice: number | null
  prices: PriceBook
  images: ProductImage[]
  colors: ColorSwatch[]
  featured: boolean
  isNew: boolean
  bestseller: boolean
  status: ProductStatus
  seoTitle: string | null
  seoDescription: string | null
  variants: {
    id?: string
    title?: string
    sku: string
    size: string | null
    color: string | null
    price: number
    compareAtPrice: number | null
    inventory: number
    prices: PriceBook
  }[]
}

export class ConflictError extends Error {}

function sizesFrom(input: ProductInput) {
  return Array.from(new Set(input.variants.map((v) => v.size).filter((s): s is string => !!s)))
}

async function writeVariants(q: Queryable, productId: string, input: ProductInput) {
  const keepIds: string[] = []
  for (const [i, v] of input.variants.entries()) {
    const id = v.id || `${productId}-${i}-${Date.now().toString(36)}`
    keepIds.push(id)
    const title = v.title || [v.size, v.color].filter(Boolean).join(' / ') || 'Default'
    await q.query(
      `INSERT INTO variants (id, product_id, title, sku, size, color, price, compare_at_price, inventory, position, prices)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, sku = EXCLUDED.sku, size = EXCLUDED.size,
         color = EXCLUDED.color, price = EXCLUDED.price, compare_at_price = EXCLUDED.compare_at_price,
         inventory = EXCLUDED.inventory, position = EXCLUDED.position, prices = EXCLUDED.prices
       WHERE variants.product_id = EXCLUDED.product_id`,
      [id, productId, title, v.sku, v.size, v.color, v.price, v.compareAtPrice, Math.max(0, Math.trunc(v.inventory)), i, JSON.stringify(v.prices ?? {})]
    )
  }
  await q.query('DELETE FROM variants WHERE product_id = $1 AND NOT (id = ANY($2::text[]))', [productId, keepIds])
}

function translateUniqueViolation(err: unknown): never {
  const e = err as { code?: string; constraint?: string; detail?: string; message?: string }
  if (e?.code === '23505') {
    if (String(e.constraint ?? e.message).includes('handle')) throw new ConflictError('Another product already uses this URL handle.')
    if (String(e.constraint ?? e.message).includes('sku')) throw new ConflictError('A variant SKU is already used by another product.')
    throw new ConflictError('That value must be unique.')
  }
  throw err
}

export async function createProduct(id: string, input: ProductInput): Promise<Product> {
  try {
    await tx(async (q) => {
      await q.query(
        `INSERT INTO products (id, handle, title, description, details, vendor, product_type, gender, category, tags,
           price, compare_at_price, images, colors, sizes, featured, is_new, bestseller, status, seo_title, seo_description, prices)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10::text[], $11, $12, $13::jsonb, $14::jsonb, $15::text[],
           $16, $17, $18, $19, $20, $21, $22::jsonb)`,
        [
          id, input.handle, input.title, input.description, JSON.stringify(input.details), input.vendor,
          input.productType, input.gender, input.category, input.tags, input.price, input.compareAtPrice,
          JSON.stringify(input.images), JSON.stringify(input.colors), sizesFrom(input), input.featured,
          input.isNew, input.bestseller, input.status, input.seoTitle, input.seoDescription, JSON.stringify(input.prices ?? {}),
        ]
      )
      await writeVariants(q, id, input)
    })
  } catch (err) {
    translateUniqueViolation(err)
  }
  return (await getProductById(id))!
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product | null> {
  try {
    const found = await tx(async (q) => {
      const rows = await q.query(
        `UPDATE products SET handle = $2, title = $3, description = $4, details = $5::jsonb, vendor = $6,
           product_type = $7, gender = $8, category = $9, tags = $10::text[], price = $11, compare_at_price = $12,
           images = $13::jsonb, colors = $14::jsonb, sizes = $15::text[], featured = $16, is_new = $17,
           bestseller = $18, status = $19, seo_title = $20, seo_description = $21, prices = $22::jsonb, updated_at = now()
         WHERE id = $1 RETURNING id`,
        [
          id, input.handle, input.title, input.description, JSON.stringify(input.details), input.vendor,
          input.productType, input.gender, input.category, input.tags, input.price, input.compareAtPrice,
          JSON.stringify(input.images), JSON.stringify(input.colors), sizesFrom(input), input.featured,
          input.isNew, input.bestseller, input.status, input.seoTitle, input.seoDescription, JSON.stringify(input.prices ?? {}),
        ]
      )
      if (!rows.length) return false
      await writeVariants(q, id, input)
      return true
    })
    if (!found) return null
  } catch (err) {
    translateUniqueViolation(err)
  }
  return getProductById(id)
}

export async function deleteProduct(id: string): Promise<boolean> {
  return tx(async (q) => {
    const rows = await q.query('DELETE FROM products WHERE id = $1 RETURNING id', [id])
    if (rows.length) {
      await q.query('UPDATE collections SET product_ids = array_remove(product_ids, $1), updated_at = now()', [id])
    }
    return rows.length > 0
  })
}
