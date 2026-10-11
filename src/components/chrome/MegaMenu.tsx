'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useMoney, useNavData } from '@/components/providers/SettingsProvider'
import { Arrow } from '@/components/kit/Button'
import { cn } from '@/lib/format'

export type MegaKind = 'shop' | 'collections'

const EASE = [0.16, 1, 0.3, 1] as const

const GENDER_IMAGES: Record<string, string> = {
  women: '/images/products/women/ivory-cable-cardigan-1.jpg',
  men: '/images/products/men/navy-tan-colorblock-tee-1.jpg',
  kids: '/images/lookbook/soft-focus-2.png',
  all: '/images/products/women/terracotta-textured-cardigan-2.jpg',
}

function Preview({ src, label, from }: { src: string; label: string; from: 'top' | 'bottom' }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-parchment">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={src}
          className="absolute inset-0"
          // The new photo wipes in from the side the pointer is travelling towards.
          initial={{ clipPath: from === 'top' ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)', scale: 1.4 }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
          exit={{ opacity: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <Image src={src} alt="" fill sizes="(min-width: 1024px) 30vw, 0px" className="object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-noir/55 via-transparent to-transparent" />
      <motion.span key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="absolute bottom-5 left-5 font-display text-4xl font-semibold uppercase tracking-[-0.05em] text-bone">
        {label}
      </motion.span>
    </div>
  )
}

function Item({
  href,
  title,
  meta,
  index,
  onHover,
  onNavigate,
  active,
}: {
  href: string
  title: string
  meta?: string
  index: number
  onHover: () => void
  onNavigate: () => void
  active: boolean
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.08 + index * 0.05 }}
    >
      <Link
        href={href}
        onMouseEnter={onHover}
        onFocus={onHover}
        onClick={onNavigate}
        className="group flex items-baseline justify-between gap-6 border-b border-ink/10 py-3"
      >
        <span className={cn('font-display text-[2.7rem] font-semibold uppercase leading-[0.9] tracking-[-0.055em] transition-all duration-500', active ? 'translate-x-3 text-signal' : 'text-ink')}>
          {title}
        </span>
        {meta ? <span className="text-label text-stone">{meta}</span> : null}
      </Link>
    </motion.li>
  )
}

export default function MegaMenu({
  kind,
  onEnter,
  onLeave,
  onNavigate,
}: {
  kind: MegaKind | null
  onEnter: () => void
  onLeave: () => void
  onNavigate: () => void
}) {
  const nav = useNavData()
  const money = useMoney()
  const [hovered, setHovered] = useState<string>('women')
  const [from, setFrom] = useState<'top' | 'bottom'>('bottom')
  const lastY = useRef(0)
  const track = (e: React.MouseEvent) => {
    if (Math.abs(e.clientY - lastY.current) > 2) setFrom(e.clientY > lastY.current ? 'top' : 'bottom')
    lastY.current = e.clientY
  }

  useEffect(() => {
    if (kind === 'shop') setHovered('women')
    if (kind === 'collections') setHovered(nav.collections[0]?.handle ?? '')
  }, [kind, nav.collections])

  const genders = [
    { id: 'women', title: 'Women', href: '/shop/women', count: nav.genders.women },
    { id: 'men', title: 'Men', href: '/shop/men', count: nav.genders.men },
    { id: 'kids', title: 'Kids', href: '/shop/kids', count: nav.genders.kids },
    { id: 'all', title: 'All pieces', href: '/shop', count: nav.genders.women + nav.genders.men + nav.genders.kids },
  ]

  const collection = nav.collections.find((c) => c.handle === hovered) ?? nav.collections[0]

  return (
    <AnimatePresence>
      {kind ? (
        <motion.div
          key="mega"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.75, ease: EASE }}
          onMouseMove={track}
          className="absolute inset-x-0 top-full hidden bg-ivory text-ink shadow-[0_30px_60px_-30px_rgba(15,14,13,0.35)] lg:block"
        >
          <div className="mx-auto grid h-[min(66vh,560px)] max-w-[1920px] grid-cols-12 gap-8 px-gutter pb-10 pt-6">
            {kind === 'shop' ? (
              <>
                <div className="col-span-5 flex flex-col">
                  <p className="mb-4 text-eyebrow slash text-stone">Shop by</p>
                  <ul>
                    {genders.map((g, i) => (
                      <Item
                        key={g.id}
                        index={i}
                        href={g.href}
                        title={g.title}
                        meta={g.count ? `${g.count} piece${g.count === 1 ? '' : 's'}` : 'Coming soon'}
                        active={hovered === g.id}
                        onHover={() => setHovered(g.id)}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </ul>
                </div>
                <div className="col-span-3 flex flex-col gap-8 pt-9">
                  <div>
                    <p className="mb-4 text-eyebrow slash text-stone">Categories</p>
                    <ul className="space-y-2.5">
                      {nav.categories.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/shop/${c.slug}`} onClick={onNavigate} className="link-wipe font-display text-[1.05rem] font-medium tracking-[-0.02em] text-ink/80 hover:text-ink">
                            {c.title}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href="/shop?sort=newest" onClick={onNavigate} className="link-wipe font-display text-[1.05rem] font-medium tracking-[-0.02em] text-ink/80 hover:text-ink">
                          New arrivals
                        </Link>
                      </li>
                    </ul>
                  </div>
                  {nav.spotlight[0] ? (
                    <Link href={`/product/${nav.spotlight[0].handle}`} onClick={onNavigate} className="group mt-auto flex items-center gap-4 rounded-2xl border border-ink/10 bg-bone/60 p-3 transition-colors hover:border-signal/40">
                      <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-parchment">
                        {nav.spotlight[0].images[0] ? (
                          <Image src={nav.spotlight[0].images[0].src} alt="" fill sizes="64px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className="text-eyebrow slash text-burgundy">Spotlight</span>
                        <span className="mt-1 block truncate font-display text-lg font-semibold leading-tight tracking-[-0.03em]">{nav.spotlight[0].title}</span>
                        <span className="font-mono text-xs text-stone">{money(nav.spotlight[0].price)}</span>
                      </span>
                    </Link>
                  ) : null}
                </div>
                <div className="col-span-4">
                  <Preview from={from} src={GENDER_IMAGES[hovered] ?? GENDER_IMAGES.all} label={genders.find((g) => g.id === hovered)?.title ?? ''} />
                </div>
              </>
            ) : (
              <>
                <div className="col-span-7 flex flex-col">
                  <p className="mb-4 text-eyebrow slash text-stone">Collections</p>
                  <ul>
                    {nav.collections.map((c, i) => (
                      <Item
                        key={c.handle}
                        index={i}
                        href={`/collections/${c.handle}`}
                        title={c.title}
                        meta={c.subtitle}
                        active={hovered === c.handle}
                        onHover={() => setHovered(c.handle)}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </ul>
                  <Link href="/collections" onClick={onNavigate} className="group mt-6 inline-flex items-center gap-2 text-label text-ink">
                    <span className="link-wipe">View every collection</span>
                    <Arrow />
                  </Link>
                </div>
                <div className="col-span-5">{collection ? <Preview from={from} src={collection.image} label={collection.title} /> : null}</div>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
