import 'server-only'
import { query } from '@/server/db/client'
import type { Category, Collection } from '@/types/commerce'
import type { Row } from '@/server/db/client'
import { num } from './util'

function mapCollection(r: Row): Collection {
  return {
    id: r.id,
    handle: r.handle,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    image: r.image,
    productIds: r.product_ids ?? [],
    featured: !!r.featured,
    position: Math.trunc(num(r.position)),
  }
}

function mapCategory(r: Row): Category {
  return {
    slug: r.slug,
    title: r.title,
    description: r.description,
    image: r.image,
    position: Math.trunc(num(r.position)),
    badge: r.badge ?? '',
    showOnHome: r.show_on_home ?? true,
  }
}

export async function listCollections(opts: { featuredOnly?: boolean } = {}): Promise<Collection[]> {
  const rows = await query(
    `SELECT * FROM collections ${opts.featuredOnly ? 'WHERE featured' : ''} ORDER BY position, created_at`
  )
  return rows.map(mapCollection)
}

export async function getCollectionByHandle(handle: string): Promise<Collection | null> {
  const rows = await query('SELECT * FROM collections WHERE handle = $1', [handle])
  return rows[0] ? mapCollection(rows[0]) : null
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const rows = await query('SELECT * FROM collections WHERE id = $1', [id])
  return rows[0] ? mapCollection(rows[0]) : null
}

export interface CollectionInput {
  handle: string
  title: string
  subtitle: string
  description: string
  image: string
  productIds: string[]
  featured: boolean
  position: number
}

export async function upsertCollection(id: string, input: CollectionInput): Promise<Collection> {
  try {
    const rows = await query(
      `INSERT INTO collections (id, handle, title, subtitle, description, image, product_ids, featured, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9)
       ON CONFLICT (id) DO UPDATE SET handle = EXCLUDED.handle, title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
         description = EXCLUDED.description, image = EXCLUDED.image, product_ids = EXCLUDED.product_ids,
         featured = EXCLUDED.featured, position = EXCLUDED.position, updated_at = now()
       RETURNING *`,
      [id, input.handle, input.title, input.subtitle, input.description, input.image, input.productIds, input.featured, input.position]
    )
    return mapCollection(rows[0])
  } catch (err) {
    if ((err as { code?: string }).code === '23505') {
      throw Object.assign(new Error('Another collection already uses this URL handle.'), { status: 409 })
    }
    throw err
  }
}

export async function deleteCollection(id: string): Promise<boolean> {
  const rows = await query('DELETE FROM collections WHERE id = $1 RETURNING id', [id])
  return rows.length > 0
}

export async function listCategories(): Promise<Category[]> {
  const rows = await query('SELECT * FROM categories ORDER BY position, title')
  return rows.map(mapCategory)
}

/** Categories that currently have at least one active product — what the storefront should show. */
export async function listActiveCategories(): Promise<(Category & { productCount: number })[]> {
  const rows = await query(
    `SELECT c.*, count(p.id)::int AS product_count
       FROM categories c JOIN products p ON p.category = c.slug AND p.status = 'active'
      GROUP BY c.slug ORDER BY c.position, c.title`
  )
  return rows.map((r) => ({ ...mapCategory(r), productCount: Math.trunc(num(r.product_count)) }))
}

export async function getCategory(slug: string): Promise<Category | null> {
  const rows = await query('SELECT * FROM categories WHERE slug = $1', [slug])
  return rows[0] ? mapCategory(rows[0]) : null
}

export async function upsertCategory(input: Category): Promise<Category> {
  const rows = await query(
    `INSERT INTO categories (slug, title, description, image, position, badge, show_on_home) VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
       image = EXCLUDED.image, position = EXCLUDED.position, badge = EXCLUDED.badge, show_on_home = EXCLUDED.show_on_home
     RETURNING *`,
    [input.slug, input.title, input.description, input.image, input.position, input.badge, input.showOnHome]
  )
  return mapCategory(rows[0])
}

export async function deleteCategory(slug: string): Promise<{ deleted: boolean; inUse: number }> {
  const inUse = await query<{ n: number }>('SELECT count(*)::int AS n FROM products WHERE category = $1', [slug])
  const n = Math.trunc(num(inUse[0]?.n))
  if (n > 0) return { deleted: false, inUse: n }
  const rows = await query('DELETE FROM categories WHERE slug = $1 RETURNING slug', [slug])
  return { deleted: rows.length > 0, inUse: 0 }
}
