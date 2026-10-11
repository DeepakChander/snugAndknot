import type { MetadataRoute } from 'next'
import { INDEXABLE, SITE_URL } from '@/lib/site'

/** Private and per-visitor pages stay out of search; previews are not crawled at all. */
const PRIVATE = ['/admin', '/api/', '/account', '/checkout', '/cart', '/search', '/track']

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    // Uploaded product photos are served from /api/media/, so that one API path stays crawlable.
    rules: [{ userAgent: '*', allow: ['/', '/api/media/'], disallow: PRIVATE }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
