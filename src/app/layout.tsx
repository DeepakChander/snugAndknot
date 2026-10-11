import type { Metadata, Viewport } from 'next'
import { instrumentSerif, inter, interTight, geistMono } from '@/lib/fonts'
import { getStoreSettings } from '@/server/catalog'
import { INDEXABLE, SITE_URL } from '@/lib/site'
import { metaDescription, shareImages } from '@/lib/seo'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const { seo, store } = await getStoreSettings()
  const description = metaDescription(seo.description || store.description)
  const ogImage = shareImages({ store, seo })
  const google = process.env.GOOGLE_SITE_VERIFICATION
  const bing = process.env.BING_SITE_VERIFICATION
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.title, template: `%s — ${store.name}` },
    description,
    applicationName: store.name,
    category: 'shopping',
    // Previews and local builds stay out of search; production is indexed.
    robots: INDEXABLE ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } } : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: store.name,
      locale: 'en_US',
      title: seo.title,
      description,
      images: ogImage,
    },
    twitter: { card: 'summary_large_image', title: seo.title, description, images: ogImage },
    // Declared with sizes so search engines and browsers pick a sharp one (Google wants ≥48px).
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/manifest.json',
    alternates: { types: { 'application/rss+xml': [{ url: '/journal/feed.xml', title: `${store.name} Journal` }] } },
    // Search Console / Bing Webmaster Tools ownership, set from the environment when you have the codes.
    verification: google || bing ? { google: google || undefined, other: bing ? { 'msvalidate.01': bing } : undefined } : undefined,
  }
}

export const viewport: Viewport = {
  themeColor: '#eeebe4',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${inter.variable} ${instrumentSerif.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
