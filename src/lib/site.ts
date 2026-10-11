/**
 * The site's public origin, for canonical URLs, the sitemap, robots, feeds and structured data.
 * NEXT_PUBLIC_SITE_URL wins; on Vercel the production domain is the fallback, so canonical links
 * are right even before the variable is set.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '') ||
  'https://www.snugandknot.com'
).replace(/\/+$/, '')

/** Absolute URL for a site path (or an already absolute URL). Apostrophes, which the URL parser
 *  leaves alone, are percent-encoded too ("Artisan's.png"), as some crawlers reject them. */
export function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, `${SITE_URL}/`).toString().replace(/'/g, '%27')
}

/** Only production deployments may be indexed; previews and local builds stay out of search. */
export const INDEXABLE = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : process.env.NODE_ENV === 'production'
