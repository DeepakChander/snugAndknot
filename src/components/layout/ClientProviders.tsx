'use client'

import dynamic from 'next/dynamic'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import SearchOverlay from './SearchOverlay'
import ToastContainer from './ToastContainer'
import SkipLink from './SkipLink'
import PageTransition from './PageTransition'
import SmoothScroll from './SmoothScroll'

// Lazy load heavy components (no SSR for DOM-dependent components)
const CustomCursor = dynamic(() => import('@/components/animation/CustomCursor'), { ssr: false })
const AuthModal = dynamic(() => import('@/components/auth/AuthModal'), { ssr: false })
const ChatWidget = dynamic(() => import('@/components/support/ChatWidget'), { ssr: false })
const WelcomePopup = dynamic(() => import('@/components/marketing/WelcomePopup'), { ssr: false })
const AnalyticsProvider = dynamic(() => import('@/components/analytics/AnalyticsProvider'), { ssr: false })

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <CustomCursor />
      <AnalyticsProvider />

      <SmoothScroll>
        <Header />
        <main id="main-content" className="page-content min-h-screen">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
      </SmoothScroll>

      {/* Overlays — outside SmoothScroll so they're not affected */}
      <CartDrawer />
      <SearchOverlay />
      <AuthModal />
      <ToastContainer />

      {/* Floating Widgets */}
      <ChatWidget />
      <WelcomePopup />
    </>
  )
}
