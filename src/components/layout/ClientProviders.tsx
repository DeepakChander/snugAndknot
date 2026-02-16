'use client'

import dynamic from 'next/dynamic'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import SearchOverlay from './SearchOverlay'
import ToastContainer from './ToastContainer'
import SkipLink from './SkipLink'
import PageTransition from './PageTransition'

// Lazy load heavy components (no SSR for DOM-dependent components)
const Preloader = dynamic(() => import('./Preloader'), { ssr: false })
const CustomCursor = dynamic(() => import('@/components/animation/CustomCursor'), { ssr: false })

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Preloader />
      <CustomCursor />

      <Header />
      <main id="main-content" className="page-content min-h-screen">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />

      {/* Overlays */}
      <CartDrawer />
      <SearchOverlay />
      <ToastContainer />
    </>
  )
}
