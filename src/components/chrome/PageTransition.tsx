'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap, prefersReducedMotion, setPageReady, ScrollTrigger } from '@/lib/motion/gsap'
import { scrollToTop } from '@/lib/motion/lenis'
import Wordmark from './Wordmark'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'

const COLUMNS = 5
const PANEL_TONES = ['bg-ink', 'bg-signal', 'bg-clay', 'bg-sage', 'bg-butter']

function isPlainLeftClick(e: MouseEvent) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented
}

/**
 * Curtain transition between pages: five columns fall over the screen, the route
 * changes underneath, then they lift. Intercepts internal <a> clicks site-wide.
 */
export default function PageTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const root = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const pendingPath = useRef<string | null>(null)
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reveal = () => {
    const el = root.current
    if (!el) return
    if (fallback.current) clearTimeout(fallback.current)
    const cols = el.querySelectorAll('[data-col]')
    scrollToTop(true)
    ScrollTrigger.refresh()
    setPageReady(true)
    gsap.timeline({
      onComplete: () => {
        busy.current = false
        el.style.visibility = 'hidden'
      },
    })
      .to(el.querySelector('[data-mark]'), { opacity: 0, duration: 0.25 })
      .to(cols, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.8, stagger: 0.06, ease: 'curtain' }, 0.05)
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!isPlainLeftClick(e)) return
      const a = (e.target as HTMLElement | null)?.closest?.('a')
      if (!a || !a.href) return
      if (a.target && a.target !== '_self') return
      if (a.hasAttribute('download') || a.dataset.noTransition !== undefined) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) return
      // Same page (filters, anchors): let Next handle it without a curtain.
      if (url.pathname === location.pathname) return
      if (prefersReducedMotion() || busy.current) return

      e.preventDefault()
      e.stopPropagation()
      busy.current = true
      setPageReady(false)
      useUIStore.getState().closeMenu()
      useUIStore.getState().closeSearch()
      useCartStore.getState().closeCart()

      const el = root.current!
      el.style.visibility = 'visible'
      const cols = el.querySelectorAll('[data-col]')
      const href = url.pathname + url.search + url.hash
      pendingPath.current = url.pathname
      gsap.timeline({
        onComplete: () => {
          router.push(href, { scroll: false })
          // Never leave the curtain down if the navigation stalls.
          fallback.current = setTimeout(reveal, 8000)
        },
      })
        .fromTo(cols, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.7, stagger: 0.06, ease: 'curtain' })
        .fromTo(el.querySelector('[data-mark]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.25')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [router])

  // The new route has rendered — lift the curtain.
  const firstRender = useRef(true)
  useEffect(() => {
    // First load: the Preloader owns the page-ready signal.
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    // Any route change while the curtain is down (including a redirect elsewhere) lifts it.
    if (busy.current) {
      pendingPath.current = null
      requestAnimationFrame(() => requestAnimationFrame(reveal))
    } else if (!busy.current) {
      // Back/forward or programmatic navigation.
      setPageReady(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div ref={root} className="pointer-events-none fixed inset-0 z-[180] flex" style={{ visibility: 'hidden' }} data-chrome aria-hidden>
      {/* Panels in the yarn palette sweep across between pages */}
      {Array.from({ length: COLUMNS }).map((_, i) => (
        <div key={i} data-col className={`relative h-full flex-1 origin-bottom scale-y-0 ${PANEL_TONES[i % PANEL_TONES.length]}`} />
      ))}
      <div data-mark className="absolute inset-0 flex items-center justify-center opacity-0">
        <span className="rounded-full bg-ink px-6 py-3.5 text-bone">
          <Wordmark variant="chip" className="text-base" />
        </span>
      </div>
    </div>
  )
}
