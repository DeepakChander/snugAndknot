import { playfairDisplay, inter, jetbrainsMono } from '@/lib/fonts'
import { siteMetadata } from './metadata'
import ClientProviders from '@/components/layout/ClientProviders'
import './globals.css'

export const metadata = siteMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-ivory text-burgundy font-body antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
