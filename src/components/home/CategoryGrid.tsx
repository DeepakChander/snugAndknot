import Image from 'next/image'
import Link from 'next/link'
import { ButtonLink } from '@/components/kit/Button'

export interface CategoryTile {
  slug: string
  title: string
  badge: string
  image: string
}

/**
 * "Shop by category": a bordered grid of tiles, each with the category name in capitals, an
 * optional small pill, and the garment centred below on a plain ground. Images are contained,
 * not cropped, so a transparent cut-out and an ordinary photograph both sit well in the tile.
 * Fed by the categories marked "Show on home page" that have active pieces, in their admin order.
 */
export default function CategoryGrid({ tiles }: { tiles: CategoryTile[] }) {
  if (!tiles.length) return null
  return (
    <section data-nav-theme="light" aria-labelledby="category-grid-title" className="relative bg-bone py-[clamp(3.5rem,7vw,6rem)] text-ink">
      <div className="container-wide">
        <h2 id="category-grid-title" className="text-eyebrow slash mb-[clamp(1.25rem,2.5vw,2rem)] text-ink/70">
          Shop by category
        </h2>

        {/* Each tile draws its own hairline and overlaps its neighbours by a pixel, so lines never double
            up and a short last row is centred and boxed instead of trailing an open edge. */}
        <ul className="flex flex-wrap justify-center pl-px pt-px">
          {tiles.map((t) => (
            <li key={t.slug} className="-ml-px -mt-px basis-1/2 border border-ink/15 md:basis-1/3 lg:basis-1/4">
              <Link href={`/shop/${t.slug}`} data-cursor="hover" className="group flex h-full flex-col gap-3 p-3 transition-colors duration-500 hover:bg-ivory focus-visible:bg-ivory sm:p-4 lg:p-5">
                <span className="flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-display text-[clamp(0.8rem,1.05vw,1rem)] font-semibold uppercase leading-tight tracking-[0.01em]">{t.title}</span>
                  {t.badge ? (
                    <span className="rounded-full border border-ink/40 px-2 py-0.5 font-mono text-[0.58rem] font-medium uppercase leading-none tracking-[0.06em] text-ink/80">
                      {t.badge}
                    </span>
                  ) : null}
                </span>
                <span className="relative mt-auto block aspect-[4/5] w-full">
                  {t.image ? (
                    <Image
                      src={t.image}
                      alt=""
                      fill
                      sizes="(min-width: 1760px) 440px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-contain p-[8%] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] motion-safe:group-hover:-translate-y-2"
                      unoptimized={t.image.startsWith('/api/media/')}
                    />
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(1.5rem,3vw,2.5rem)] flex justify-center">
          <ButtonLink href="/shop" variant="outline" size="sm" arrow>
            Shop all
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
