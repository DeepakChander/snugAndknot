'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import ProductCard, { type CardProduct } from '@/components/store/ProductCard'
import SplitReveal from '@/components/motion/SplitReveal'
import Parallax from '@/components/motion/Parallax'
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store'
import { useHydrated } from '@/hooks/use-hydrated'
import { api } from '@/lib/api'
import { ProductPrice } from '@/components/kit/Price'
import type { PriceBook, Product, ProductDetails } from '@/types/commerce'

/** Editorial band about the yarn, using the product's own fabric details. */
export function FabricStory({ details, image, title }: { details: ProductDetails; image: string; title: string }) {
  if (!details.fabric && !details.sustainability) return null
  return (
    <section data-nav-theme="dark" className="relative overflow-hidden bg-noir py-24 text-bone md:py-36" aria-label="The fabric">
      <div className="container-wide grid items-center gap-12 md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
          <Parallax speed={-0.06} className="absolute inset-[-12%]">
            <Image src={image} alt={`${title} — fabric detail`} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </Parallax>
        </div>
        <div>
          <p className="text-eyebrow text-gold">The yarn</p>
          {details.fabric ? (
            <SplitReveal as="h2" className="mt-6 text-display">
              {details.fabric}
            </SplitReveal>
          ) : null}
          {details.sustainability ? <p className="mt-8 max-w-md text-lead text-bone/70">{details.sustainability}.</p> : null}
          {details.fit ? <p className="mt-4 max-w-md text-bone/50">{details.fit}.</p> : null}
        </div>
      </div>
    </section>
  )
}

export function Related({ products, title = 'Complete the look' }: { products: CardProduct[]; title?: string }) {
  if (!products.length) return null
  return (
    <section className="bg-ivory py-20 text-ink md:py-28" aria-label={title}>
      <div className="container-wide">
        <h2 className="text-headline">{title}</h2>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Pieces this visitor looked at recently (stored in their browser). */
export function RecentlyViewed({ current }: { current: string }) {
  const hydrated = useHydrated()
  const handles = useRecentlyViewedStore((s) => s.handles)
  const [products, setProducts] = useState<Product[]>([])
  const wanted = hydrated ? handles.filter((h) => h !== current).slice(0, 4) : []
  const key = wanted.join(',')

  useEffect(() => {
    if (!key) return
    let alive = true
    api<{ products: Product[] }>('/api/products')
      .then(({ products: all }) => {
        if (!alive) return
        const order = key.split(',')
        setProducts(all.filter((p) => order.includes(p.handle)).sort((a, b) => order.indexOf(a.handle) - order.indexOf(b.handle)))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [key])

  if (!products.length) return null
  return <Related products={products} title="Recently viewed" />
}

/** Mobile buy bar that appears once the main button scrolls away. */
export function StickyBuyBar({ title, product, image, targetId }: { title: string; product: { price: number; compareAtPrice: number | null; prices: PriceBook }; image: string; targetId: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [targetId])
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-3 z-[105] flex items-center gap-3 rounded-full bg-noir p-2 pr-2 text-bone shadow-2xl lg:hidden"
        >
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-umber">
            {image ? <Image src={image} alt="" fill sizes="44px" className="object-cover" /> : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{title}</span>
            <ProductPrice product={product} showCompareAt={false} className="text-xs text-bone/60" />
          </span>
          <button
            type="button"
            onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="shrink-0 rounded-full bg-bone px-5 py-3 text-sm text-ink"
          >
            Choose size
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
