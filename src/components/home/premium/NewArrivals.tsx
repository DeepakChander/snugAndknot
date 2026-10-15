import Link from 'next/link'
import ProductCard, { type CardProduct } from '@/components/store/ProductCard'

/** The newest pieces, four across, with a link to the full shop. */
export default function NewArrivals({ products }: { products: CardProduct[] }) {
  if (!products.length) return null
  return (
    <section aria-labelledby="home-new-title" className="bg-bone py-[clamp(3.5rem,7vw,6rem)] text-ink">
      <div className="container-wide">
        <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
          <div>
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-stone">Just in</p>
            <h2 id="home-new-title" className="mt-3 font-serif text-[clamp(2rem,3.4vw,3rem)] font-normal leading-none">
              New arrivals
            </h2>
          </div>
          <Link href="/shop?sort=newest" className="shrink-0 border-b border-ink/40 pb-0.5 text-[0.78rem] uppercase tracking-[0.14em] transition-colors hover:border-ink">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {products.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} sizes="(min-width: 1024px) 25vw, 50vw" />
          ))}
        </div>
      </div>
    </section>
  )
}
