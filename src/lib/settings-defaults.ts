import type { SiteSettings } from '@/types/commerce'

/**
 * Defaults for every admin-editable setting. Stored values are deep-merged over
 * these, so adding a new field here never breaks an existing database.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  store: {
    name: 'Snug&Knot',
    tagline: 'Everyday clothing for men, women and kids.',
    description: 'Trendy, comfortable, premium everyday clothing for men, women and kids.',
    email: 'support@snugandknot.com',
    phone: '+91-9355704093',
    whatsapp: '+91-9355704093',
    address: { street: '', city: '', state: '', zip: '', country: 'India' },
    social: {
      instagram: 'https://instagram.com/snugandknot',
      pinterest: 'https://pinterest.com/snugandknot',
      tiktok: 'https://tiktok.com/@snugandknot',
      twitter: 'https://twitter.com/snugandknot',
    },
    departments: { men: true, women: true, kids: true },
    marketplaces: [],
  },
  commerce: {
    currency: 'USD',
    locale: 'en-US',
    freeShippingThreshold: 150,
    standardShippingRate: 8,
    expressShippingRate: 18,
    taxRate: 0,
    returnWindowDays: 30,
    deliveryEstimate: '3–7 working days',
    refundDays: 7,
    freeReturns: false,
    pointsPerDollar: 1,
    codEnabled: true,
    onlinePaymentsEnabled: false,
    extraCurrencies: [],
  },
  announcement: {
    enabled: true,
    messages: [
      'Free shipping on orders over {free-shipping}',
      'Delivery in 3–7 working days',
      '30-day returns on unworn pieces',
    ],
    link: '/shop',
  },
  reviews: {
    moderation: 'manual',
  },
  homepage: {
    sections: { categories: true, newIn: true, collections: true, reviews: true, journal: true, promises: true },
    heroImage: '/images/hero/campaign.webp',
    feature: { enabled: true, collectionHandle: 'coastal-escape', image: '', ctaLabel: 'Shop the edit' },
    heroPanels: [
      { label: 'Women', href: '/shop/women', image: '/images/hero/women.webp' },
      { label: 'Men', href: '/shop/men', image: '/images/hero/men.webp' },
      { label: 'Kids', href: '/shop/kids', image: '/images/hero/kids.webp' },
    ],
    heroEyebrow: 'Everyday clothing for',
    heroTitle: 'Men, Women & Kids',
    heroSubtitle: 'Trendy · Comfortable · Premium',
    primaryCtaLabel: 'Shop now',
    primaryCtaHref: '/shop',
    secondaryCtaLabel: 'See the collections',
    secondaryCtaHref: '/collections',
    manifesto:
      'Everyday clothing for men, women and kids that is easy to wear and made to last: well-cut basics and seasonal pieces, chosen with *care*.',
  },
  seo: {
    title: 'Snug&Knot — Everyday Clothing for Men, Women & Kids',
    description:
      'Trendy, comfortable, premium everyday clothing for men, women and kids: shirts, T-shirts, knitwear, jeans, dresses and more, with 30-day returns.',
    // 1200×630, the size link previews expect: three of the real pieces side by side.
    ogImage: '/images/og/snugandknot.jpg',
  },
  // The home page video wall stays hidden until it is switched on with at least one playable clip.
  videos: {
    enabled: false,
    heading: '#SnugAndKnot',
    intro: 'Show us how you wear yours. Tag @snugandknot and #SnugAndKnot for a chance to be featured here.',
    ctaLabel: 'Follow @snugandknot',
    ctaHref: 'https://instagram.com/snugandknot',
    items: [],
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
