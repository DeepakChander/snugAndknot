import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Content Security Policy without nonces (nonces would force every page to render on each
 * request). Allows this site plus the analytics it actually loads: Google Analytics and the
 * Meta Pixel. Images come from this site or the two photo hosts the image optimiser allows.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://*.googletagmanager.com https://connect.facebook.net`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://images.pexels.com https://*.google-analytics.com https://*.googletagmanager.com https://www.facebook.com https://connect.facebook.net",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.facebook.com https://connect.facebook.net",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  // The Meta Pixel sends some events through a hidden facebook.com iframe and form.
  "frame-src https://www.facebook.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.facebook.com",
  "frame-ancestors 'none'",
  // Only on Vercel: a local `next start` over plain http must keep working.
  ...(process.env.VERCEL ? ['upgrade-insecure-requests'] : []),
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  // Browsers ignore this over plain http, so it is safe to send everywhere.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
]

const nextConfig: NextConfig = {
  // Do not advertise the framework and version.
  poweredByHeader: false,
  // A stray lockfile in a parent folder must not be mistaken for the workspace root.
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
  // Database drivers load native/wasm assets at runtime — keep them out of the bundle.
  serverExternalPackages: ['pg', '@electric-sql/pglite'],
  // PGlite (the no-DATABASE_URL fallback) reads its wasm + data files from disk.
  outputFileTracingIncludes: {
    '/**': ['./node_modules/@electric-sql/pglite/dist/*.wasm', './node_modules/@electric-sql/pglite/dist/*.data'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
  async redirects() {
    return [
      // One address for search engines: the project's vercel.app alias forwards to the real domain.
      { source: '/:path*', has: [{ type: 'host', value: 'snug-andknot.vercel.app' }], destination: 'https://www.snugandknot.com/:path*', permanent: true },
      { source: '/blog', destination: '/journal', permanent: true },
      { source: '/blog/:slug', destination: '/journal/:slug', permanent: true },
    ]
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Photographs change rarely; cache them for a month (file names are not hashed, so not immutable).
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]
  },
}

// Wrap with bundle analyzer when ANALYZE env is set
const withBundleAnalyzer =
  process.env.ANALYZE === 'true'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('@next/bundle-analyzer')({ enabled: true })
    : (config: NextConfig) => config

export default withBundleAnalyzer(nextConfig)
