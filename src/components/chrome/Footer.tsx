'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import { scrollToTop } from '@/lib/motion/lenis'
import { useSettings } from '@/components/providers/SettingsProvider'
import Magnetic from '@/components/motion/Magnetic'
import NewsletterForm from './NewsletterForm'
import { ArrowUp, InstagramIcon, PinterestIcon, TiktokIcon, XIcon } from '@/components/kit/icons'
import { KnotMark } from './Preloader'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Women', href: '/shop/women' },
      { label: 'Men', href: '/shop/men' },
      { label: 'Kids', href: '/shop/kids' },
      { label: 'All pieces', href: '/shop' },
      { label: 'Collections', href: '/collections' },
    ],
  },
  {
    title: 'Care',
    links: [
      { label: 'Shipping & returns', href: '/shipping-returns' },
      { label: 'Caring for knitwear', href: '/care-instructions' },
      { label: 'Size guide', href: '/size-guide' },
      { label: 'Track an order', href: '/track' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Atelier',
    links: [
      { label: 'Our story', href: '/about' },
      { label: 'Lookbook', href: '/lookbook' },
      { label: 'Journal', href: '/journal' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Your account', href: '/account' },
      { label: 'Orders', href: '/account/orders' },
      { label: 'Wishlist', href: '/account/wishlist' },
      { label: 'Rewards', href: '/account/rewards' },
    ],
  },
]

function LocalTime({ city }: { city: string }) {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tz = city.toLowerCase().includes('new york') ? 'America/New_York' : undefined
    const f = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz })
    const tick = () => setTime(f.format(new Date()))
    tick()
    const t = setInterval(tick, 30_000)
    return () => clearInterval(t)
  }, [city])
  return <span suppressHydrationWarning>{time}</span>
}

function FooterContent() {
  const { store } = useSettings()
  const word = useRef<HTMLDivElement>(null)
  const name = store.name
  const [a, b] = name.includes('&') ? name.split('&') : [name, '']

  useGSAP(
    () => {
      const letters = word.current?.querySelectorAll('[data-l]')
      if (!letters?.length || prefersReducedMotion()) return
      gsap.fromTo(
        letters,
        { yPercent: 105 },
        {
          yPercent: 0,
          ease: 'expo.out',
          duration: 1.4,
          stagger: 0.05,
          // The wordmark may sit inside a position:fixed layer, so measure the in-flow <footer>.
          scrollTrigger: { trigger: word.current?.closest('footer'), start: 'bottom 125%', toggleActions: 'play none none reverse' },
        }
      )
    },
    { scope: word }
  )

  const socials = [
    { href: store.social.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: store.social.pinterest, label: 'Pinterest', Icon: PinterestIcon },
    { href: store.social.tiktok, label: 'TikTok', Icon: TiktokIcon },
    { href: store.social.twitter, label: 'X', Icon: XIcon },
  ].filter((s) => s.href)

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-noir text-bone">
      <KnotMark className="pointer-events-none absolute -right-24 top-10 h-[34rem] w-[34rem] text-bone/[0.035]" strokeWidth={0.6} />

      <div className="container-wide relative grid gap-14 pt-20 md:pt-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-eyebrow text-gold">The atelier letter</p>
          <h2 className="mt-5 text-headline text-balance">
            Slow news from the <em className="text-gold-light">workroom</em>.
          </h2>
          <p className="mt-5 max-w-md text-bone/60">New pieces, restocks and the stories behind the yarn — a few times a season, never more.</p>
          <NewsletterForm source="footer" className="mt-8 max-w-lg" />
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-7 lg:pl-12">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-eyebrow text-taupe">{col.title}</p>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-wipe text-[0.95rem] text-bone/80 transition-colors hover:text-bone">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="container-wide relative mt-16 grid gap-8 text-sm text-bone/65 md:grid-cols-3">
        <address className="not-italic leading-relaxed">
          {store.address.street}
          <br />
          {store.address.city}
          {store.address.state ? `, ${store.address.state}` : ''} {store.address.zip}
          <br />
          <span className="text-bone/45">
            {store.address.city} — <LocalTime city={store.address.city} />
          </span>
        </address>
        <div className="leading-relaxed">
          <a href={`mailto:${store.email}`} className="link-wipe text-bone/85">
            {store.email}
          </a>
          <br />
          {store.phone ? (
            <a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`} className="link-wipe">
              {store.phone}
            </a>
          ) : null}
        </div>
        <div className="flex items-start gap-2 md:justify-end">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              data-cursor="hover"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/15 transition-colors hover:border-gold hover:text-gold"
            >
              <Icon size={17} />
            </a>
          ))}
        </div>
      </div>

      <div ref={word} className="relative mt-auto select-none overflow-hidden px-[2vw] pt-14" aria-hidden>
        <div className="flex justify-between font-display text-[19.5vw] leading-[0.78] tracking-[-0.045em] text-bone">
          {a.split('').map((c, i) => (
            <span key={`a${i}`} data-l className="inline-block">
              {c}
            </span>
          ))}
          {name.includes('&') ? (
            <span data-l className="inline-block italic text-gold">
              &amp;
            </span>
          ) : null}
          {b.split('').map((c, i) => (
            <span key={`b${i}`} data-l className="inline-block">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="container-wide relative flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 py-6 text-xs text-bone/50">
        <p>
          © {new Date().getFullYear()} {store.name}. Hand-finished in small batches.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/privacy-policy" className="link-wipe">
            Privacy
          </Link>
          <Link href="/terms-of-service" className="link-wipe">
            Terms
          </Link>
          <Magnetic>
            <button
              type="button"
              onClick={() => scrollToTop(false)}
              data-cursor="hover"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-bone/20 text-bone transition-colors hover:bg-bone hover:text-ink"
              aria-label="Back to top"
            >
              <ArrowUp size={18} />
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  )
}

/**
 * On large screens the footer sits fixed beneath the page and is uncovered as the
 * last section scrolls away (clip-path reveal). On small screens it is in normal flow.
 */
export default function Footer() {
  const inner = useRef<HTMLDivElement>(null)
  const [h, setH] = useState<number | null>(null)
  const [reveal, setReveal] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const measure = () => {
      const height = inner.current?.offsetHeight ?? 0
      const fits = mq.matches && height > 0 && height <= window.innerHeight
      setReveal(fits)
      setH(height)
      ScrollTrigger.refresh()
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (inner.current) ro.observe(inner.current)
    mq.addEventListener('change', measure)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', measure)
    }
  }, [])

  return (
    <footer
      data-nav-theme="dark"
      className="relative"
      style={reveal && h ? { height: h, clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' } : undefined}
    >
      <div ref={inner} className={reveal ? 'fixed bottom-0 left-0 w-full lg:min-h-[100svh]' : 'lg:min-h-[100svh]'}>
        <FooterContent />
      </div>
    </footer>
  )
}
