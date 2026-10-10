'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import { ButtonLink } from '@/components/kit/Button'
import Price from '@/components/kit/Price'
import { WishlistButton, type CardProduct } from '@/components/store/ProductCard'
import SplitReveal from '@/components/motion/SplitReveal'
import type { ProductDetails } from '@/types/commerce'

type EditProduct = CardProduct & { details: ProductDetails; description: string }

/**
 * Pinned horizontal gallery of the pieces. On large screens vertical scroll drives the
 * rail sideways; on touch it is a native swipe rail with snap points.
 */
export default function TheEdit({ products }: { products: EditProduct[] }) {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        if (prefersReducedMotion() || !track.current || !root.current) return
        const distance = () => track.current!.scrollWidth - window.innerWidth
        const tween = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
        // Images drift inside their frames as the rail moves.
        root.current.querySelectorAll<HTMLElement>('[data-drift]').forEach((img) => {
          gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
        })
        const bar = root.current.querySelector<HTMLElement>('[data-progress]')
        if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, scrub: true } })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [products.length] }
  )

  return (
    <section ref={root} data-nav-theme="dark" className="relative overflow-hidden bg-noir text-bone" aria-label="The edit">
      <div className="flex h-auto items-center lg:h-[100svh]">
        <div ref={track} className="no-scrollbar flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto px-gutter py-24 [scroll-padding-inline:var(--gutter)] lg:snap-none lg:gap-8 lg:overflow-visible lg:py-0">
          {/* Intro panel */}
          <div className="flex w-[82vw] shrink-0 snap-start flex-col justify-between sm:w-[60vw] lg:w-[34vw] lg:py-28">
            <div>
              <p className="text-eyebrow text-gold">The edit · {String(products.length).padStart(2, '0')} pieces</p>
              <SplitReveal as="h2" className="mt-6 text-headline">
                Made slowly, in small numbers.
              </SplitReveal>
              <p className="mt-6 max-w-md text-bone/60">
                No seasons of a hundred styles. A short list of knits we are proud of — each one knitted in a small run and finished by hand.
              </p>
            </div>
            <div className="mt-10 hidden lg:block">
              <div className="h-px w-full bg-bone/15">
                <div data-progress className="h-px origin-left bg-gold" />
              </div>
              <p className="mt-3 text-label text-bone/40">Scroll to browse</p>
            </div>
          </div>

          {products.map((p, i) => (
            <article key={p.id} className="group relative flex w-[82vw] shrink-0 snap-start flex-col sm:w-[55vw] lg:h-[78svh] lg:w-[min(40vw,560px)]">
              <Link href={`/product/${p.handle}`} className="relative block aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-umber lg:aspect-auto lg:flex-1" data-cursor="view" data-cursor-label="View">
                {p.images[0] ? (
                  <Image data-drift src={p.images[0].src} alt={p.images[0].alt} fill sizes="(min-width:1024px) 40vw, 80vw" className="scale-[1.18] object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.24]" />
                ) : null}
                <span className="absolute left-5 top-4 font-display text-[5.5rem] leading-none text-bone/90 mix-blend-difference">{String(i + 1).padStart(2, '0')}</span>
              </Link>
              <WishlistButton handle={p.handle} title={p.title} tone="dark" className="absolute right-4 top-4" />
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-eyebrow text-gold">{p.productType}</p>
                  <Link href={`/product/${p.handle}`} className="mt-1 block font-display text-[2rem] leading-[1.02] hover:text-gold-light">
                    {p.title}
                  </Link>
                  {p.details.fabric ? <p className="mt-2 text-sm text-bone/50">{p.details.fabric}</p> : null}
                </div>
                <Price price={p.price} compareAt={p.compareAtPrice} className="shrink-0 pt-6 text-sm text-bone/80" />
              </div>
            </article>
          ))}

          {/* Outro panel */}
          <div className="flex w-[82vw] shrink-0 snap-start items-center justify-center sm:w-[50vw] lg:w-[30vw]">
            <div className="text-center">
              <p className="font-display text-[clamp(2.5rem,4vw,4rem)] leading-none">
                See every <em className="text-gold-light">piece</em>
              </p>
              <ButtonLink href="/shop" variant="light" size="lg" className="mt-8" arrow magnetic>
                Shop all
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
