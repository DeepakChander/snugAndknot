'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import SplitReveal from '@/components/motion/SplitReveal'
import Reveal from '@/components/motion/Reveal'
import ProductCard, { type CardProduct } from '@/components/store/ProductCard'
import { ButtonLink } from '@/components/kit/Button'
import type { Collection } from '@/types/commerce'

export default function CollectionDetail({
  collection,
  products,
  others,
}: {
  collection: Collection
  products: CardProduct[]
  others: Collection[]
}) {
  const hero = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.22])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <>
      <section ref={hero} data-nav-theme="dark" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-noir text-bone">
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <Image src={collection.image} alt={collection.title} fill priority sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-noir/40" />
        <motion.div style={{ opacity: fade }} className="container-wide relative flex h-full flex-col justify-end pb-14">
          <nav aria-label="Breadcrumb" className="text-eyebrow text-bone/60">
            <Link href="/collections" className="link-wipe">
              Collections
            </Link>{' '}
            / <span className="text-gold-light">{collection.subtitle}</span>
          </nav>
          <SplitReveal as="h1" type="chars" intro className="mt-5 max-w-[12ch] text-mega">
            {collection.title}
          </SplitReveal>
          <Reveal delay={0.4} className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-lg text-lead text-bone/75">{collection.description}</p>
            <span className="font-mono text-sm text-bone/60">
              {String(products.length).padStart(2, '0')} piece{products.length === 1 ? '' : 's'}
            </span>
          </Reveal>
        </motion.div>
      </section>

      <section className="bg-ivory py-20 text-ink md:py-28" aria-label="Pieces in this collection">
        <div className="container-wide">
          {products.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-6 lg:grid-cols-3">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} priority={i < 2} sizes="(min-width:1024px) 33vw, 50vw" />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-headline">New pieces are on the needles.</p>
              <ButtonLink href="/shop" variant="outline" className="mt-8" arrow>
                Browse all pieces
              </ButtonLink>
            </div>
          )}
        </div>
      </section>

      {others.length ? (
        <section data-nav-theme="dark" className="bg-noir py-20 text-bone md:py-28" aria-label="More collections">
          <div className="container-wide">
            <div className="flex items-end justify-between gap-6">
              <h2 className="text-headline">More stories</h2>
              <ButtonLink href="/collections" variant="outline-light" size="sm" arrow>
                All collections
              </ButtonLink>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {others.slice(0, 3).map((c, i) => (
                <Reveal key={c.id} delay={i * 0.08}>
                  <Link href={`/collections/${c.handle}`} className="group block" data-cursor="view" data-cursor-label="Explore">
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-umber">
                      <Image src={c.image} alt={c.title} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />
                    </span>
                    <span className="mt-4 block text-eyebrow text-gold-light">{c.subtitle}</span>
                    <span className="mt-1 block font-display text-4xl">{c.title}</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
