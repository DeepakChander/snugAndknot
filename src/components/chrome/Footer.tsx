'use client'

import Link from 'next/link'
import { scrollToTop } from '@/lib/motion/lenis'
import { useSettings } from '@/components/providers/SettingsProvider'
import NewsletterForm from './NewsletterForm'
import CurrencySwitcher from './CurrencySwitcher'
import { ArrowUp, InstagramIcon, PinterestIcon, TiktokIcon, XIcon } from '@/components/kit/icons'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'Women', href: '/shop/women' },
      { label: 'Men', href: '/shop/men' },
      { label: 'Kids', href: '/shop/kids' },
      { label: 'New in', href: '/shop?sort=newest' },
      { label: 'Collections', href: '/collections' },
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

/** The site footer: newsletter, link columns, contact and socials, then the small print. In normal flow. */
export default function Footer() {
  const { store } = useSettings()
  const socials = [
    { href: store.social.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: store.social.pinterest, label: 'Pinterest', Icon: PinterestIcon },
    { href: store.social.tiktok, label: 'TikTok', Icon: TiktokIcon },
    { href: store.social.twitter, label: 'X', Icon: XIcon },
  ].filter((s) => s.href)

  return (
    <footer className="border-t border-ink/10 bg-ivory text-ink">
      <div className="container-wide grid gap-12 py-14 md:py-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="text-[1.15rem] font-medium">Stay in the know</h2>
          <p className="mt-2 max-w-sm text-[0.88rem] text-stone">New arrivals, restocks and offers, a few times a month. Unsubscribe any time.</p>
          <NewsletterForm source="footer" tone="light" className="mt-5 max-w-md" />
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:col-span-8 lg:pl-10">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em]">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[0.86rem] text-ink/70 transition-colors hover:text-ink hover:underline hover:underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="container-wide flex flex-col gap-6 border-t border-ink/10 py-8 text-[0.84rem] md:flex-row md:items-center md:justify-between">
        {/* No street address is published: the shop is online only. */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-ink/70">
          <a href={`mailto:${store.email}`} className="hover:text-ink">
            {store.email}
          </a>
          {store.phone ? (
            <a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`} className="hover:text-ink">
              {store.phone}
            </a>
          ) : null}
        </div>
        {socials.length ? (
          <div className="flex gap-1">
            {socials.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center text-ink/70 transition-colors hover:text-ink">
                <Icon size={18} />
              </a>
            ))}
          </div>
        ) : null}
      </div>

      <div className="bg-bone">
        <div className="container-wide flex flex-wrap items-center justify-between gap-4 py-5 text-[0.75rem] text-stone">
          <p>
            © {new Date().getFullYear()} {store.name}
            {store.tagline ? ` · ${store.tagline}` : ''}
          </p>
          <div className="flex items-center gap-5">
            <CurrencySwitcher />
            <Link href="/privacy-policy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-ink">
              Terms
            </Link>
            <button type="button" onClick={() => scrollToTop(false)} className="flex items-center gap-1.5 hover:text-ink" aria-label="Back to top">
              <ArrowUp size={14} /> Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
