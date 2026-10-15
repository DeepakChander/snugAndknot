'use client'

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import SplitReveal from '@/components/motion/SplitReveal'
import { ButtonLink } from '@/components/kit/Button'
import { ProductPrice } from '@/components/kit/Price'
import { hasWebGL, useInView } from '@/hooks/use-in-view'
import { ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import type { RingItem } from '@/components/three/ProductRing'
import type { Product } from '@/types/commerce'

const ProductRing = dynamic(() => import('@/components/three/ProductRing'), { ssr: false })
const EASE = [0.16, 1, 0.3, 1] as const

/**
 * "New in" — the pieces on a turning ring in 3D. The piece facing you is in full colour,
 * the others fall back to grey; its name, fibre and price swap in underneath.
 */
export default function NewInRing({ products }: { products: Product[] }) {
  const router = useRouter()
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const scroll = useRef(0)
  const inView = useInView(section, '100px 0px')
  // three.js, the canvas and the textures load only once the section is within a screen and a half.
  const near = useInView(section, '150% 0px', true)
  // Keyboard focus inside the facing piece's bar holds the ring still.
  const hold = useRef<HTMLDivElement>(null)
  const [gl, setGl] = useState<boolean | null>(null)
  const [active, setActive] = useState(0)

  // Two photographs per piece so the ring reads as a ring even with a short catalogue.
  const pieces = products.filter((p) => p.images[0])
  const items: (RingItem & { product: Product })[] = []
  for (let round = 0; round < 2; round++) {
    for (const p of pieces) {
      const img = p.images[round] ?? p.images[0]
      items.push({ src: img.src, title: p.title, subtitle: p.productType, href: `/product/${p.handle}`, product: p })
    }
  }

  useEffect(() => {
    setGl(hasWebGL() && !prefersReducedMotion() && items.length >= 5)
  }, [items.length])

  // A gentle tilt of the ring as the section passes through the viewport.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => (scroll.current = (self.progress - 0.5) * 0.6),
      })
    },
    { scope: section }
  )

  const setCursor = useCallback((v: 'drag' | 'view' | 'default') => {
    const el = stage.current
    if (!el) return
    el.dataset.cursor = v === 'default' ? 'hover' : v
    el.dataset.cursorLabel = v === 'view' ? 'Open' : v === 'drag' ? 'Drag' : ''
  }, [])

  const current = items[active]?.product
  const pieceIndex = current ? pieces.findIndex((p) => p.id === current.id) : 0

  return (
    <section ref={section} data-nav-theme="dark" aria-labelledby="new-in-title" className="relative min-h-[100svh] overflow-hidden bg-ink text-bone">
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_48%,rgba(217,68,43,0.22),transparent_70%)]" aria-hidden />

      <div className="container-wide relative z-[1] grid gap-6 pt-[clamp(5rem,9vw,8rem)] md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-eyebrow slash text-butter">New in — {String(pieces.length).padStart(2, '0')} pieces</p>
          <SplitReveal as="h2" id="new-in-title" className="mt-5 text-display">
            Just off <em>the needles</em>
          </SplitReveal>
        </div>
        <div className="flex flex-col items-start gap-5 md:col-span-4 md:col-start-9 md:items-end md:justify-end md:text-right">
          <p className="max-w-xs text-bone/65">The latest pieces from the workroom. Drag the ring, or tap a piece to open it.</p>
          <ButtonLink href="/shop?sort=newest" variant="outline-light" size="sm" arrow>
            Shop all new in
          </ButtonLink>
        </div>
      </div>

      {/* The ring */}
      <div ref={stage} data-cursor="drag" data-cursor-label="Drag" className="relative z-0 h-[min(62svh,640px)] min-h-[420px]">
        {gl ? (
          near ? (
            <ProductRing
              items={items}
              scroll={scroll}
              hold={hold}
              active={inView}
              onActive={setActive}
              onOpen={(i) => router.push(items[i].href)}
              setCursor={setCursor}
            />
          ) : null
        ) : gl === false ? (
          <div className="no-scrollbar flex h-full snap-x snap-mandatory items-center gap-4 overflow-x-auto px-gutter">
            {pieces.map((p) => (
              <Link key={p.id} href={`/product/${p.handle}`} className="relative aspect-[3/4] h-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-umber">
                <Image src={p.images[0].src} alt={p.images[0].alt || p.title} fill sizes="40vh" className="object-cover" />
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {/* The piece facing you */}
      {current ? (
        <div
          ref={hold}
          className="container-wide relative z-[1] grid items-end gap-6 pb-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-12"
        >
          <div className="flex items-center gap-4 lg:col-span-3">
            <span className="whitespace-nowrap font-mono text-xs tabular-nums text-bone/55">
              {String(pieceIndex + 1).padStart(2, '0')} / {String(pieces.length).padStart(2, '0')}
            </span>
            <span className="relative h-px w-28 overflow-hidden bg-bone/15">
              <motion.span className="absolute inset-y-0 left-0 bg-signal" animate={{ width: `${((pieceIndex + 1) / pieces.length) * 100}%` }} transition={{ duration: 0.8, ease: EASE }} />
            </span>
          </div>
          <div className="relative h-[7.75rem] overflow-hidden lg:col-span-6 lg:text-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={current.id} initial={{ y: '105%' }} animate={{ y: '0%' }} exit={{ y: '-105%' }} transition={{ duration: 0.8, ease: EASE }} className="absolute inset-0">
                <p className="text-eyebrow text-bone/55">
                  {current.productType}
                  {current.details.fabric ? ` — ${current.details.fabric}` : ''}
                </p>
                <Link href={`/product/${current.handle}`} className="-mb-[0.14em] mt-2 line-clamp-2 pb-[0.14em] text-[clamp(1.8rem,3.4vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.045em] hover:text-butter">
                  {current.title}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-4 lg:col-span-3 lg:justify-end">
            <ProductPrice product={current} className="text-sm [&_s]:text-bone/40 [&_s]:opacity-100" />
            <ButtonLink href={`/product/${current.handle}`} variant="light" size="sm" arrow className="shrink-0">
              View piece
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </section>
  )
}
