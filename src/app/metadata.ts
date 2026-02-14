import type { Metadata } from 'next'

export const siteMetadata: Metadata = {
  metadataBase: new URL('https://snugandknot.com'),
  title: {
    default: 'Snug&Knot | Premium Fashion, Woven with Intention',
    template: '%s | Snug&Knot',
  },
  description: 'Discover timeless fashion pieces crafted with care. Premium tops, bottoms, dresses, outerwear, and accessories designed to be cherished.',
  keywords: ['fashion', 'clothing', 'premium', 'sustainable', 'tops', 'dresses', 'outerwear', 'accessories', 'womens fashion', 'mens fashion'],
  authors: [{ name: 'Snug&Knot' }],
  creator: 'Snug&Knot',
  publisher: 'Snug&Knot',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://snugandknot.com',
    siteName: 'Snug&Knot',
    title: 'Snug&Knot | Premium Fashion',
    description: 'Timeless pieces crafted with care, designed to be cherished.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Snug&Knot Premium Fashion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@snugandknot',
    creator: '@snugandknot',
    title: 'Snug&Knot | Premium Fashion',
    description: 'Timeless pieces crafted with care, designed to be cherished.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}
