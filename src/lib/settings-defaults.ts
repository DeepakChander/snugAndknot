import type { SiteSettings } from '@/types/commerce'

/**
 * Defaults for every admin-editable setting. Stored values are deep-merged over
 * these, so adding a new field here never breaks an existing database.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  store: {
    name: 'Snug&Knot',
    tagline: 'Where tension becomes tenderness.',
    description: 'Textiles knotted at the crossroads of tradition and nerve. Every thread earns its place.',
    email: 'hello@snugandknot.com',
    phone: '+91-9355704093',
    address: { street: '142 Mercer Street', city: 'New York', state: 'NY', zip: '10012', country: 'United States' },
    social: {
      instagram: 'https://instagram.com/snugandknot',
      pinterest: 'https://pinterest.com/snugandknot',
      tiktok: 'https://tiktok.com/@snugandknot',
      twitter: 'https://twitter.com/snugandknot',
    },
  },
  commerce: {
    currency: 'USD',
    locale: 'en-US',
    freeShippingThreshold: 150,
    standardShippingRate: 8,
    expressShippingRate: 18,
    taxRate: 0,
    returnWindowDays: 30,
    pointsPerDollar: 1,
    codEnabled: true,
  },
  announcement: {
    enabled: true,
    messages: [
      'Complimentary shipping on orders over $150',
      'Hand-finished in small batches',
      '30-day returns, no questions asked',
    ],
    link: '/shop',
  },
  reviews: {
    moderation: 'manual',
  },
  homepage: {
    heroEyebrow: 'Autumn / Winter Atelier',
    heroTitle: 'Knitted slowly. Worn for a lifetime.',
    heroSubtitle:
      'Merino, cashmere and long-staple cotton — knotted by hand in small batches, finished with intention.',
    primaryCtaLabel: 'Shop the collection',
    primaryCtaHref: '/shop',
    secondaryCtaLabel: 'Inside the atelier',
    secondaryCtaHref: '/about',
    manifesto:
      'Tension is not the enemy of softness. Every knot is a decision, every thread earns its place, and the loom does not rush.',
  },
  seo: {
    title: 'Snug&Knot — Luxury Knitwear, Hand-Finished',
    description:
      'Luxury knitwear knotted by hand: merino, cashmere and long-staple cotton cardigans and knit tees, made in small batches to last a lifetime.',
    ogImage: '/images/Collections-Hero/Artisan.png',
  },
}

export function mergeSettings<T extends object>(base: T, override: unknown): T {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return base
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    const b = (base as Record<string, unknown>)[k]
    if (b && typeof b === 'object' && !Array.isArray(b) && v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = mergeSettings(b as object, v)
    } else if (v !== undefined && k in (base as object)) {
      out[k] = v
    }
  }
  return out as T
}
