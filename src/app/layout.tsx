import { dmSerifDisplay, inter, jetbrainsMono } from '@/lib/fonts'
import { siteMetadata } from './metadata'
import './globals.css'

export const metadata = siteMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-cream text-walnut font-body antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}

// Client providers wrapper - separate component for client-side functionality
import ClientProviders from '@/components/layout/ClientProviders'
