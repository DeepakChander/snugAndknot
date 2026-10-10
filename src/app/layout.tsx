import type { Metadata, Viewport } from 'next'
import { instrumentSerif, geist, geistMono } from '@/lib/fonts'
import { getStoreSettings } from '@/server/catalog'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://snug-andknot.vercel.app'

export async function generateMetadata(): Promise<Metadata> {
  const { seo, store } = await getStoreSettings()
  const description = seo.description || store.description
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: seo.title, template: `%s — ${store.name}` },
    description,
    applicationName: store.name,
    openGraph: {
      type: 'website',
      siteName: store.name,
      title: seo.title,
      description,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: seo.title, description, images: seo.ogImage ? [seo.ogImage] : undefined },
    icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
    manifest: '/manifest.json',
  }
}

export const viewport: Viewport = {
  themeColor: '#0d0a09',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
