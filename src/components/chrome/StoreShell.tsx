'use client'

import { useEffect } from 'react'
import { SettingsProvider, type NavData, type PublicSettings } from '@/components/providers/SettingsProvider'
import { useAuthStore } from '@/stores/auth-store'
import SmoothScroll from '@/components/motion/SmoothScroll'
import Preloader from './Preloader'
import PageTransition from './PageTransition'
import Navbar from './Navbar'
import Footer from './Footer'
import Toaster from './Toaster'
import MobileMenu from './MobileMenu'
import CartDrawer from './CartDrawer'
import SearchOverlay from './SearchOverlay'
import AuthModal from './AuthModal'
import CustomCursor from './CustomCursor'
import WelcomeOffer from './WelcomeOffer'
import HelpWidget from './HelpWidget'

/*
 * Every overlay below renders nothing on the server and on the first client pass
 * (closed state, or a portal that mounts after hydration), so server and client
 * trees always match.
 */
export default function StoreShell({ settings, nav, children }: { settings: PublicSettings; nav: NavData; children: React.ReactNode }) {
  useEffect(() => {
    void useAuthStore.getState().fetchSession()
  }, [])

  return (
    <SettingsProvider settings={settings} nav={nav}>
      <a href="#main" className="sr-only z-[300] rounded-full bg-ink px-5 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <SmoothScroll />
      <Preloader />
      <PageTransition />
      <Navbar />
      <MobileMenu />
      <main id="main" tabIndex={-1} className="relative z-[1] min-h-[100svh] bg-ivory outline-none">
        {children}
      </main>
      <Footer />
      <Toaster />
      <CartDrawer />
      <SearchOverlay />
      <AuthModal />
      <WelcomeOffer />
      <HelpWidget />
      <CustomCursor />
      <div className="grain" aria-hidden />
    </SettingsProvider>
  )
}
