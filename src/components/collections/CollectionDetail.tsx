import Image from 'next/image'
import Link from 'next/link'
import ProductCard, { type CardProduct } from '@/components/store/ProductCard'
import { ButtonLink } from '@/components/kit/Button'
import { plain } from '@/lib/accent'
import type { Collection } from '@/types/commerce'

/** A collection: its name, line and description beside its photograph, then its pieces, then the other collections. */
export default function CollectionDetail({ collection, products, others }: { collection: Collection; products: CardProduct[]; others: Collection[] }) {
  return (
    <>
      <section className="border-b border-ink/10 bg-ivory pt-nav text-ink">
        <div className="container-wide grid items-end gap-8 pb-10 pt-8 md:pt-12 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div>
            <nav aria-label="Breadcrumb" className="text-eyebrow text-stone">
              <Link href="/collections" className="hover:text-ink">
                Collections
              </Link>
              {collection.subtitle ? <> / <span className="text-ink">{collection.subtitle}</span></> : null}
            </nav>
            <h1 className="mt-4 text-display">{plain(collection.title)}</h1>
            {collection.description ? <p className="mt-5 max-w-lg text-lead text-stone">{collection.description}</p> : null}
            <p className="mt-5 text-[0.86rem] text-stone">
              {products.length} piece{products.length === 1 ? '' : 's'}
            </p>
          </div>
          {collection.image ? (
            <div className="relative aspect-[4/5] overflow-hidden bg-parchment lg:aspect-[5/6]">
              <Image src={collection.image} alt="" fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" unoptimized={collection.image.startsWith('/api/media/')} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-ivory py-10 text-ink md:py-14" aria-label="Pieces in this collection">
        <div className="container-wide">
          {products.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 2} sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw" />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-headline">New pieces are on the way.</p>
              <ButtonLink href="/shop" variant="outline" className="mt-8">
                Shop everything
              </ButtonLink>
            </div>
          )}
        </div>
      </section>

      {others.length ? (
        <section className="border-t border-ink/10 bg-bone py-14 text-ink md:py-20" aria-label="More collections">
          <div className="container-wide">
            <div className="flex items-end justify-between gap-6">
              <h2 className="text-headline">More collections</h2>
              <Link href="/collections" className="shrink-0 border-b border-ink pb-1 text-[0.74rem] font-medium uppercase tracking-[0.14em]">
                View all
              </Link>
            </div>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {others.slice(0, 3).map((c) => (
                <li key={c.id}>
                  <Link href={`/collections/${c.handle}`} className="group block">
                    <span className="relative block aspect-[4/5] overflow-hidden bg-parchment">
                      {c.image ? <Image src={c.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]" unoptimized={c.image.startsWith('/api/media/')} /> : null}
                    </span>
                    <span className="mt-4 block text-[1.05rem] font-medium group-hover:underline group-hover:underline-offset-4">{plain(c.title)}</span>
                    {c.subtitle ? <span className="mt-1 block text-[0.86rem] text-stone">{c.subtitle}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  )
}
