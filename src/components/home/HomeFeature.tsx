import Image from 'next/image'
import Link from 'next/link'
import { ButtonLink } from '@/components/kit/Button'
import { ProductPrice } from '@/components/kit/Price'
import { accent, plain } from '@/lib/accent'
import type { Collection, HomeFeature as Feature, Product } from '@/types/commerce'

/**
 * The campaign band: one collection set large on the page's one dark band, its photograph beside
 * its name, line and description, with three of its pieces underneath. Chosen in Admin → Settings →
 * Home page → Campaign band; it stays out of the page while that collection is missing.
 */
export default function HomeFeature({ feature, collection, pieces }: { feature: Feature; collection: Collection; pieces: Product[] }) {
  const image = feature.image || collection.image
  return (
    <section aria-labelledby="feature-title" className="bg-ink text-ivory">
      <div className="grid lg:grid-cols-2">
        <Link href={`/collections/${collection.handle}`} className="group relative block aspect-[4/5] overflow-hidden bg-smoke lg:aspect-auto lg:min-h-[86svh]" tabIndex={-1} aria-hidden>
          {image ? <Image src={image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover object-[50%_25%] transition-transform duration-[1600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]" unoptimized={image.startsWith('/api/media/')} /> : null}
        </Link>
        <div className="flex flex-col justify-center px-gutter py-14 md:py-20 lg:px-[clamp(2.5rem,6vw,7rem)]">
          <p className="text-eyebrow text-ivory/60">{collection.subtitle || 'The edit'}</p>
          <h2 id="feature-title" className="mt-4 font-serif text-[clamp(2.8rem,5.6vw,5.4rem)] leading-[0.95]">
            {collection.title.includes('*') ? accent(collection.title) : plain(collection.title)}
          </h2>
          {collection.description ? <p className="mt-6 max-w-md text-[1rem] leading-relaxed text-ivory/70">{collection.description}</p> : null}
          {pieces.length ? (
            <ul className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {pieces.slice(0, 3).map((p) => (
                <li key={p.id}>
                  <Link href={`/product/${p.handle}`} className="group block">
                    <span className="relative block aspect-[3/4] overflow-hidden bg-smoke">{p.images[0] ? <Image src={p.images[0].src} alt="" fill sizes="160px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" /> : null}</span>
                    <span className="mt-2 block truncate text-[0.76rem] text-ivory/80 group-hover:underline">{p.title}</span>
                    <ProductPrice product={p} showCompareAt={false} className="block text-[0.76rem] font-medium" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-10">
            <ButtonLink href={`/collections/${collection.handle}`} variant="light" arrow>
              {feature.ctaLabel || 'Shop the edit'}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
