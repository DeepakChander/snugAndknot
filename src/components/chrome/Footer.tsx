'use client'

import Link from 'next/link'
import { scrollToTop } from '@/lib/motion/lenis'
import { useSettings } from '@/components/providers/SettingsProvider'
import { DEPARTMENT_TITLES, openDepartments } from '@/lib/categories'
import NewsletterForm from './NewsletterForm'
import CurrencySwitcher from './CurrencySwitcher'
import MarketplaceStrip from './MarketplaceStrip'
import { ArrowUp, InstagramIcon, MailIcon, PhoneIcon, PinterestIcon, TiktokIcon, XIcon } from '@/components/kit/icons'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      // The open departments are added in front.
      { label: 'New in', href: '/shop?sort=newest' },
      { label: 'Collections', href: '/collections' },
      { label: 'Shop all', href: '/shop' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Shipping & returns', href: '/shipping-returns' },
      { label: 'Size guide', href: '/size-guide' },
      { label: 'Care guide', href: '/care-instructions' },
      { label: 'Track an order', href: '/track' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our story', href: '/about' },
      { label: 'Journal', href: '/journal' },
      { label: 'Lookbook', href: '/lookbook' },
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

/**
 * The site footer on the one dark ground: a large serif sign-off with the newsletter, the link
 * columns, contact and socials, the ways to pay (from the checkout settings, so it never promises a
 * method that is switched off), the store's name set large, and the small print. Still, in flow.
 */
export default function Footer() {
  const { store, commerce } = useSettings()
  const socials = [
    { href: store.social.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: store.social.pinterest, label: 'Pinterest', Icon: PinterestIcon },
    { href: store.social.tiktok, label: 'TikTok', Icon: TiktokIcon },
    { href: store.social.twitter, label: 'X', Icon: XIcon },
  ].filter((s) => s.href)
  // The ways checkout takes payment right now: Razorpay's methods while it is live, cash on delivery while it is on.
  const pay = [...(commerce.onlinePaymentsEnabled ? ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net banking', 'Wallets'] : []), ...(commerce.codEnabled ? ['Cash on delivery'] : [])]
  const columns = COLUMNS.map((c) => (c.title === 'Shop' ? { ...c, links: [...openDepartments(store).map((d) => ({ label: DEPARTMENT_TITLES[d], href: `/shop/${d}` })), ...c.links] } : c))

  return (
    <>
      <MarketplaceStrip items={store.marketplaces ?? []} />
      <footer className="bg-ink text-ivory">
        {/* Sign-off and newsletter */}
        <div className="container-wide grid gap-10 border-b border-ivory/10 py-14 md:py-20 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-eyebrow text-ivory/50">The newsletter</p>
            <h2 className="mt-4 font-serif text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98]">
              New pieces, first. <em className="text-ivory/70">Never too often.</em>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="max-w-md text-[0.92rem] text-ivory/60">New arrivals, restocks and offers, a few times a month. Unsubscribe any time.</p>
            <NewsletterForm source="footer" tone="dark" className="mt-5 max-w-md" />
          </div>
        </div>

        {/* Links */}
        <div className="container-wide grid gap-12 py-12 md:py-16 lg:grid-cols-12">
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ivory/50">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[0.9rem] text-ivory/80 transition-colors hover:text-ivory">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="space-y-8 lg:col-span-4 lg:pl-10">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ivory/50">Customer care</p>
              {/* No street address is published: the shop is online only. */}
              <ul className="mt-5 space-y-3 text-[0.9rem] text-ivory/80">
                <li>
                  <a href={`mailto:${store.email}`} className="flex items-center gap-2.5 hover:text-ivory">
                    <MailIcon size={16} /> {store.email}
                  </a>
                </li>
                {store.phone ? (
                  <li>
                    <a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2.5 hover:text-ivory">
                      <PhoneIcon size={16} /> {store.phone}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
            {socials.length ? (
              <div className="flex gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center border border-ivory/20 text-ivory/80 transition-colors hover:border-ivory hover:text-ivory">
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            ) : null}
            {pay.length ? (
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ivory/50">We accept</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {pay.map((p) => (
                    <li key={p} className="border border-ivory/20 px-2.5 py-1 text-[0.72rem] text-ivory/80">
                      {p}
                    </li>
                  ))}
                </ul>
                {commerce.onlinePaymentsEnabled ? <p className="mt-3 text-[0.72rem] text-ivory/45">Online payments are processed securely by Razorpay.</p> : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* The name, set large and still */}
        <div aria-hidden className="container-wide select-none overflow-hidden">
          <p className="whitespace-nowrap text-center font-serif text-[clamp(3.5rem,15.5vw,15rem)] leading-[0.8] tracking-[-0.02em] text-ivory/[0.92]">{store.name}</p>
        </div>

        {/* Small print */}
        <div className="container-wide mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ivory/10 py-6 text-[0.75rem] text-ivory/55">
          <p>
            © {new Date().getFullYear()} {store.name}
            {store.tagline ? ` · ${store.tagline}` : ''}
          </p>
          <div className="flex items-center gap-5">
            <CurrencySwitcher className="text-ivory/70" />
            <Link href="/privacy-policy" className="hover:text-ivory">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-ivory">
              Terms
            </Link>
            <button type="button" onClick={() => scrollToTop(false)} className="flex items-center gap-1.5 hover:text-ivory" aria-label="Back to top">
              <ArrowUp size={14} /> Top
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}
