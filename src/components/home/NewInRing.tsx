'use client'

import Image from 'next/image'
import Link from 'next/link'
import SplitReveal from '@/components/motion/SplitReveal'
import { ButtonLink } from '@/components/kit/Button'
import { ProductPrice } from '@/components/kit/Price'
import type { Product } from '@/types/commerce'

/**
 * "New in" — the latest pieces in a row you can swipe, each with its name and price. (The 3D lives
 * in the hero only; this section stays flat so the page does not turn in 3D at every scroll.)
 */
export default function NewInRing({ products }: { products: Product[] }) {
  const pieces = products.filter((p) => p.images[0])
  if (!pieces.length) return null
  return (
    <section data-nav-theme="dark" aria-labelledby="new-in-title" className="relative overflow-hidden bg-ink py-[clamp(4.5rem,9vw,8rem)] text-bone">
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_48%,rgba(217,68,43,0.18),transparent_70%)]" aria-hidden />

      <div className="container-wide relative grid gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="text-eyebrow slash text-butter">New in — {String(pieces.length).padStart(2, '0')} pieces</p>
          <SplitReveal as="h2" id="new-in-title" className="mt-5 text-display">
            Just off <em>the needles</em>
          </SplitReveal>
        </div>
        <div className="flex flex-col items-start gap-5 md:col-span-4 md:col-start-9 md:items-end md:justify-end md:text-right">
          <p className="max-w-xs text-bone/65">The latest pieces from the workroom.</p>
          <ButtonLink href="/shop?sort=newest" variant="outline-light" size="sm" arrow>
            Shop all new in
          </ButtonLink>
        </div>
      </div>

      <ul className="no-scrollbar relative mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter md:gap-6">
        {pieces.map((p) => (
          <li key={p.id} className="w-[64vw] shrink-0 snap-start sm:w-[40vw] md:w-[28vw] lg:w-[22vw]">
            <Link href={`/product/${p.handle}`} className="group block">
              <span className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-umber">
                <Image src={p.images[0].src} alt={p.images[0].alt || p.title} fill sizes="(min-width:1024px) 22vw, (min-width:768px) 28vw, 64vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
              </span>
              <span className="mt-4 block text-eyebrow text-bone/55">{p.productType}</span>
              <span className="mt-1.5 flex items-start justify-between gap-3">
                <span className="font-display text-[1.15rem] font-semibold leading-tight tracking-[-0.03em] group-hover:text-butter">{p.title}</span>
                <ProductPrice product={p} showCompareAt={false} className="shrink-0 pt-0.5 text-sm text-bone/80" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
