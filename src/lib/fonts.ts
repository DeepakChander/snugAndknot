import { Instrument_Serif, Inter, Inter_Tight, Geist_Mono } from 'next/font/google'

/** Display grotesk — headlines, wordmark, product names, navigation. Set tight and heavy. */
export const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
})

/** Body text and interface copy. */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

/** Italic serif accent — one word or phrase inside a headline, never a whole heading. */
export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  // Only the italic is ever set; the upright face would be a wasted preload.
  style: 'italic',
  variable: '--font-instrument',
  display: 'swap',
})

/** Labels, prices, counters — set in capitals with a slash prefix. */
export const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})
