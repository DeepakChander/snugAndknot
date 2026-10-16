'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import ProductCard, { type CardProduct } from '@/components/store/ProductCard'
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store'
import { useHydrated } from '@/hooks/use-hydrated'
import { api } from '@/lib/api'
import { ProductPrice } from '@/components/kit/Price'
import type { PriceBook, Product } from '@/types/commerce'

export function Related({ products, title = 'Complete the look' }: { products: CardProduct[]; title?: string }) {
  if (!products.length) return null
  return (
    <section className="bg-ivory py-14 text-ink md:py-20" aria-label={title}>
      <div className="container-wide">
        <h2 className="text-[1.35rem] font-medium">{title}</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-4 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} sizes="(min-width: 1024px) 25vw, 50vw" />
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
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-x-0 bottom-0 z-[105] flex items-center gap-3 border-t border-ink/10 bg-ivory px-3 py-2.5 text-ink lg:hidden"
        >
          <span className="relative h-12 w-9 shrink-0 overflow-hidden bg-bone">
            {image ? <Image src={image} alt="" fill sizes="44px" className="object-cover" /> : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{title}</span>
            <ProductPrice product={product} showCompareAt={false} className="text-xs font-medium" />
          </span>
          <button
            type="button"
            onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="shrink-0 bg-ink px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-ivory"
          >
            Choose size
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
