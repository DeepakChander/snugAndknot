import type { MetadataRoute } from 'next'
import { INDEXABLE, SITE_URL } from '@/lib/site'

/**
 * Never crawled: the admin, the API and unbounded search results. Account, bag, checkout and order
 * tracking stay crawlable on purpose: they carry noindex, and Google can only obey a noindex it is
 * allowed to fetch. Previews are not crawled at all.
 */
const PRIVATE = ['/admin', '/api/', '/search']

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    // Uploaded product photos are served from /api/media/, so that one API path stays crawlable.
    rules: [{ userAgent: '*', allow: ['/', '/api/media/'], disallow: PRIVATE }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
