import Link from 'next/link'
import ProductCard, { type CardProduct } from '@/components/store/ProductCard'

/** "New in": the latest pieces in a plain grid, four across on a desktop and two on a phone. */
export default function NewIn({ products }: { products: CardProduct[] }) {
  if (!products.length) return null
  return (
    <section aria-labelledby="new-in-title" className="bg-ivory py-[clamp(3.5rem,7vw,6rem)] text-ink">
      <div className="container-wide">
        <div className="flex items-end justify-between gap-6">
          <h2 id="new-in-title" className="text-headline">
            New in
          </h2>
          <Link href="/shop?sort=newest" className="shrink-0 border-b border-ink pb-1 text-[0.74rem] font-medium uppercase tracking-[0.14em]">
            View all
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-4 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 2} sizes="(min-width: 1024px) 25vw, 50vw" />
          ))}
        </div>
      </div>
    </section>
  )
}
