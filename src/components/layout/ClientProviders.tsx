'use client'

import dynamic from 'next/dynamic'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import SearchOverlay from './SearchOverlay'
import ToastContainer from './ToastContainer'
import SkipLink from './SkipLink'
import LenisProvider from '@/components/animation/LenisProvider'

const Preloader = dynamic(() => import('./Preloader'), { ssr: false })
const CustomCursor = dynamic(() => import('@/components/animation/CustomCursor'), { ssr: false })

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <SkipLink />
      <Preloader />
      <CustomCursor />
      <Header />
      <main id="main-content" className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <ToastContainer />
    </LenisProvider>
  )
}
