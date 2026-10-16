import Image from 'next/image'
import Link from 'next/link'
import { plain } from '@/lib/accent'
import type { Collection, Product } from '@/types/commerce'

/**
 * The featured collections as large photograph tiles (up to three), each with its name, a line
 * about it and how many pieces it holds. Managed in Admin → Collections: the featured ones, in order.
 */
export default function Collections({ collections, products }: { collections: Collection[]; products: Product[] }) {
  const live = new Set(products.map((p) => p.id))
  const shown = collections
    .filter((c) => c.featured || collections.length <= 3)
    .filter((c) => c.image)
    .slice(0, 3)
  if (!shown.length) return null

  return (
    <section aria-labelledby="collections-title" className="bg-bone py-[clamp(3.5rem,7vw,6rem)] text-ink">
      <div className="container-wide">
        <div className="flex items-end justify-between gap-6">
          <h2 id="collections-title" className="text-headline">
            Collections
          </h2>
          <Link href="/collections" className="shrink-0 border-b border-ink pb-1 text-[0.74rem] font-medium uppercase tracking-[0.14em]">
            View all
          </Link>
        </div>
        <ul className={`mt-8 grid gap-3 md:gap-4 ${shown.length === 1 ? '' : shown.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
          {shown.map((c) => {
            const count = c.productIds.filter((id) => live.has(id)).length
            return (
              <li key={c.id}>
                <Link href={`/collections/${c.handle}`} className="group block">
                  <span className="relative block aspect-[4/5] overflow-hidden bg-parchment">
                    <Image src={c.image} alt="" fill sizes={`(min-width: 768px) ${Math.round(100 / shown.length)}vw, 100vw`} className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]" unoptimized={c.image.startsWith('/api/media/')} />
                  </span>
                  <span className="mt-4 flex items-baseline justify-between gap-4">
                    <span className="text-[1.05rem] font-medium group-hover:underline group-hover:underline-offset-4">{plain(c.title)}</span>
                    {count ? <span className="shrink-0 text-[0.72rem] uppercase tracking-[0.12em] text-stone">{count} piece{count === 1 ? '' : 's'}</span> : null}
                  </span>
                  {c.subtitle ? <span className="mt-1 block text-[0.86rem] text-stone">{c.subtitle}</span> : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
