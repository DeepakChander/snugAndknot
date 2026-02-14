import { DM_Serif_Display, Inter, JetBrains_Mono } from 'next/font/google'

export const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-heading',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})
