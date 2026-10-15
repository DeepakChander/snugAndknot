'use client'

import Link from 'next/link'
import { useNavData, useSettings } from '@/components/providers/SettingsProvider'
import NewsletterForm from './NewsletterForm'
import CurrencySwitcher from './CurrencySwitcher'
import Wordmark from './Wordmark'
import { InstagramIcon, PinterestIcon, TiktokIcon, XIcon } from '@/components/kit/icons'

const CARE = [
  { label: 'Shipping & returns', href: '/shipping-returns' },
  { label: 'Size guide', href: '/size-guide' },
  { label: 'Caring for knitwear', href: '/care-instructions' },
  { label: 'Track an order', href: '/track' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Contact us', href: '/contact' },
]

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[0.8rem] font-medium text-bone">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[0.82rem] text-bone/65 transition-colors hover:text-bone">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Brand, quick links, customer care and "stay connected" over a slim legal bar, on ink. */
export default function Footer() {
  const { store, homepage } = useSettings()
  const { genders } = useNavData()
  const quick = [
    { label: 'Home', href: '/' },
    ...(genders.men ? [{ label: 'Men', href: '/shop/men' }] : []),
    ...(genders.women ? [{ label: 'Women', href: '/shop/women' }] : []),
    ...(genders.kids ? [{ label: 'Kids', href: '/shop/kids' }] : []),
    { label: 'Shop all', href: '/shop' },
    { label: 'Collections', href: '/collections' },
    { label: 'Journal', href: '/journal' },
    { label: 'About', href: '/about' },
  ]
  const socials = [
    { href: store.social.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: store.social.pinterest, label: 'Pinterest', Icon: PinterestIcon },
    { href: store.social.tiktok, label: 'TikTok', Icon: TiktokIcon },
    { href: store.social.twitter, label: 'X', Icon: XIcon },
  ].filter((s) => s.href)

  return (
    <footer data-nav-theme="dark" className="relative bg-ink text-bone">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-4">
        <div>
          <Link href="/" aria-label={`${store.name} — home`}>
            <Wordmark name={store.name} variant="spaced" className="text-[1.3rem]" />
          </Link>
          {homepage.storySignature ? <p className="mt-4 text-[0.72rem] uppercase tracking-[0.22em] text-bone/70">{homepage.storySignature}</p> : null}
          {/* No street address is published: the shop is online only. */}
          <p className="mt-6 text-[0.82rem] leading-relaxed text-bone/60">
            <a href={`mailto:${store.email}`} className="transition-colors hover:text-bone">
              {store.email}
            </a>
            {store.phone ? (
              <>
                <br />
                <a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`} className="transition-colors hover:text-bone">
                  {store.phone}
                </a>
              </>
            ) : null}
          </p>
        </div>
        <nav aria-label="Quick links">
          <Column title="Quick links" links={quick} />
        </nav>
        <nav aria-label="Customer care">
          <Column title="Customer care" links={CARE} />
        </nav>
        <div>
          <p className="text-[0.8rem] font-medium text-bone">Stay connected</p>
          <p className="mt-4 max-w-xs text-[0.82rem] leading-relaxed text-bone/65">Follow us for new arrivals, style inspiration and more.</p>
          {socials.length ? (
            <div className="mt-5 flex items-center gap-4">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-bone/75 transition-colors hover:text-bone">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          ) : null}
          <NewsletterForm source="footer" className="mt-7 max-w-sm" />
        </div>
      </div>

      <div className="container-wide flex flex-wrap items-center justify-between gap-4 border-t border-bone/10 py-6 text-[0.75rem] text-bone/55">
        <p>
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <CurrencySwitcher />
          <Link href="/privacy-policy" className="transition-colors hover:text-bone">
            Privacy
          </Link>
          <Link href="/terms-of-service" className="transition-colors hover:text-bone">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}
