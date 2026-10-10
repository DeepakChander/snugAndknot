'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { SettingsProvider, type NavData, type PublicSettings } from '@/components/providers/SettingsProvider'
import { useAuthStore } from '@/stores/auth-store'
import { useHydrated } from '@/hooks/use-hydrated'
import SmoothScroll from '@/components/motion/SmoothScroll'
import Preloader from './Preloader'
import PageTransition from './PageTransition'
import Navbar from './Navbar'
import Footer from './Footer'
import Toaster from './Toaster'

// Overlays load after first paint — none of them is visible initially.
const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false })
const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false })
const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false })
const AuthModal = dynamic(() => import('./AuthModal'), { ssr: false })
const CustomCursor = dynamic(() => import('./CustomCursor'), { ssr: false })
const WelcomeOffer = dynamic(() => import('./WelcomeOffer'), { ssr: false })
const HelpWidget = dynamic(() => import('./HelpWidget'), { ssr: false })

export default function StoreShell({ settings, nav, children }: { settings: PublicSettings; nav: NavData; children: React.ReactNode }) {
  const hydrated = useHydrated()
  useEffect(() => {
    void useAuthStore.getState().fetchSession()
  }, [])

  return (
    <SettingsProvider settings={settings} nav={nav}>
      <a
        href="#main"
        className="sr-only z-[300] rounded-full bg-ink px-5 py-3 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <Preloader />
      <PageTransition />
      <Navbar />
      {hydrated ? <MobileMenu /> : null}
      <main id="main" tabIndex={-1} className="relative z-[1] min-h-[100svh] bg-ivory outline-none">
        {children}
      </main>
      <Footer />
      <Toaster />
      {/* Code-split overlays mount after hydration so server and client trees match. */}
      {hydrated ? (
        <>
          <CartDrawer />
          <SearchOverlay />
          <AuthModal />
          <WelcomeOffer />
          <HelpWidget />
          <CustomCursor />
        </>
      ) : null}
      <div className="grain" aria-hidden />
    </SettingsProvider>
  )
}
