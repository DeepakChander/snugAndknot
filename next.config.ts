import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
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
