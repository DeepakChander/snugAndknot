import type { Metadata } from 'next'
import { absoluteUrl, SITE_URL } from '@/lib/site'
import { DEFAULT_SETTINGS } from '@/lib/settings-defaults'
import { plain } from '@/lib/accent'
import type { FaqGroup } from '@/lib/faq'
import type { JournalPost } from '@/lib/journal'
import type { Product, RatingSummary, Review, SiteSettings } from '@/types/commerce'

/**
 * schema.org structured data for search engines and AI crawlers. Every value comes from the
 * catalogue, the settings or the page itself — nothing is invented (no placeholder ratings,
 * shipping regions or fees the shop has not published).
 */
type Ld = Record<string, unknown>

type ShareImage = { url: string; alt: string; width?: number; height?: number }

/** The site-wide share image from the settings; the default one is a known 1200×630. */
export function shareImages({ store, seo }: Pick<SiteSettings, 'store' | 'seo'>): ShareImage[] | undefined {
  if (!seo.ogImage) return undefined
  const size = seo.ogImage === DEFAULT_SETTINGS.seo.ogImage ? { width: 1200, height: 630 } : {}
  return [{ url: seo.ogImage, alt: `${store.name} — ${store.tagline}`, ...size }]
}

/**
 * A photograph for link previews, served 1200px wide by the image optimiser: the originals are
 * several megabytes, over what X, LinkedIn and Facebook accept. Uploaded media is passed through.
 */
export function socialImage(src: string, alt: string): ShareImage {
  return src.startsWith('/images/') ? { url: absoluteUrl(`/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`), alt } : { url: src, alt }
}

/**
 * Complete metadata for a page: title, description, canonical and its own share card. A page's
 * openGraph replaces the layout's whole block, so every page carries the full set.
 */
export function pageMeta(
  s: Pick<SiteSettings, 'store' | 'seo'>,
  opts: { title: string; description: string; path: string; images?: ShareImage[]; article?: { publishedTime: string; section?: string }; robots?: Metadata['robots'] }
): Metadata {
  const description = metaDescription(opts.description)
  const images = opts.images ?? shareImages(s)
  const shareTitle = `${opts.title} — ${s.store.name}`
  return {
    title: opts.title,
    description,
    alternates: { canonical: opts.path },
    ...(opts.robots ? { robots: opts.robots } : {}),
    openGraph: {
      type: opts.article ? 'article' : 'website',
      siteName: s.store.name,
      locale: 'en_US',
      url: opts.path,
      title: shareTitle,
      description,
      images,
      ...(opts.article ? { publishedTime: opts.article.publishedTime, section: opts.article.section } : {}),
    },
    twitter: { card: 'summary_large_image', title: shareTitle, description, images },
  }
}

const ORG_ID = `${SITE_URL}/#organization`
const SITE_ID = `${SITE_URL}/#website`

/** ISO 3166 code for the country names the settings form accepts; unknown names are left out. */
function countryCode(name: string): string | undefined {
  const n = name.trim().toLowerCase()
  const codes: Record<string, string> = {
    'united states': 'US', 'united states of america': 'US', usa: 'US', us: 'US',
    'united kingdom': 'GB', uk: 'GB', india: 'IN', canada: 'CA', australia: 'AU',
  }
  return codes[n]
}

export function organizationLd({ store }: Pick<SiteSettings, 'store'>): Ld {
  const sameAs = Object.values(store.social).filter((u) => /^https:\/\//.test(u))
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    '@id': ORG_ID,
    name: store.name,
    url: SITE_URL,
    logo: absoluteUrl('/icon-512.png'),
    description: store.description,
    email: store.email || undefined,
    telephone: store.phone || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  }
}

export function websiteLd({ store, seo }: Pick<SiteSettings, 'store' | 'seo'>): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: store.name,
    url: SITE_URL,
    description: seo.description || store.description,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** Breadcrumb trail; the last item is the current page. */
export function breadcrumbLd(trail: { name: string; path: string }[]): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: absoluteUrl(t.path) })),
  }
}

export function productLd(product: Product, summary: RatingSummary, reviews: Review[], settings: Pick<SiteSettings, 'store' | 'commerce'>): Ld {
  const { store, commerce } = settings
  const url = absoluteUrl(`/product/${product.handle}`)
  const prices = product.variants.length ? product.variants.map((v) => v.price) : [product.price]
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const availability = product.variants.length === 0 || product.variants.some((v) => v.available) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
  const country = countryCode(store.address.country)
  const returnPolicy =
    commerce.returnWindowDays > 0 && country
      ? {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: country,
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: commerce.returnWindowDays,
          returnMethod: 'https://schema.org/ReturnByMail',
          merchantReturnLink: absoluteUrl('/shipping-returns'),
        }
      : undefined
  const offerCommon = {
    priceCurrency: commerce.currency,
    availability,
    itemCondition: 'https://schema.org/NewCondition',
    url,
    seller: { '@id': ORG_ID },
    hasMerchantReturnPolicy: returnPolicy,
  }
  // Search engines take reviews collected on the site only: ones the owner added from WhatsApp,
  // Instagram and the like show on the page but stay out of the markup and its rating.
  const onSite = reviews.filter((r) => r.status === 'approved' && (r.source ?? 'site') === 'site')
  const approved = onSite.slice(0, 5)
  const rated = onSite.length === summary.count ? summary : { count: onSite.length, average: onSite.length ? onSite.reduce((n, r) => n + r.rating, 0) / onSite.length : 0 }
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.title,
    description: product.description,
    url,
    image: product.images.map((i) => absoluteUrl(i.src)),
    sku: product.variants.length === 1 ? product.variants[0].sku || undefined : undefined,
    category: product.productType || undefined,
    material: product.details.fabric || undefined,
    color: product.colors.length ? product.colors.map((c) => c.name).join(', ') : undefined,
    brand: { '@type': 'Brand', name: store.name },
    offers:
      low === high
        ? { '@type': 'Offer', price: low, ...offerCommon }
        : { '@type': 'AggregateOffer', lowPrice: low, highPrice: high, offerCount: product.variants.length, ...offerCommon },
    // Only real, approved reviews — never a placeholder rating.
    ...(rated.count > 0
      ? {
          aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(rated.average.toFixed(2)), reviewCount: rated.count, bestRating: 5, worstRating: 1 },
          review: approved.map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.author },
            datePublished: r.createdAt.slice(0, 10),
            name: r.title || undefined,
            reviewBody: r.body,
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          })),
        }
      : {}),
  }
}

/** The products on a listing page, in the order shown. */
export function itemListLd(name: string, products: Pick<Product, 'handle' | 'title'>[]): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(`/product/${p.handle}`), name: p.title })),
  }
}

export function articleLd(post: JournalPost, { store }: Pick<SiteSettings, 'store'>): Ld {
  const url = absoluteUrl(`/journal/${post.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    image: [absoluteUrl(post.image)],
    datePublished: `${post.date}T09:00:00+00:00`,
    dateModified: `${post.date}T09:00:00+00:00`,
    articleSection: post.tag,
    mainEntityOfPage: url,
    url,
    author: { '@type': 'Organization', name: store.name, url: SITE_URL },
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  }
}

export function faqLd(groups: FaqGroup[]): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap((g) => g.items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } }))),
  }
}

/** Plain text for meta descriptions: no *accent* markers, collapsed whitespace, cut at a word. */
export function metaDescription(text: string, max = 160): string {
  const t = plain(text).replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 60))}…`
}
