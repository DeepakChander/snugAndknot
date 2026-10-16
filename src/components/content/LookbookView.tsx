import Image from 'next/image'
import Link from 'next/link'
import { ButtonLink } from '@/components/kit/Button'
import { ProductPrice } from '@/components/kit/Price'
import type { PriceBook } from '@/types/commerce'
import { accent, plain } from '@/lib/accent'
import { cn } from '@/lib/format'

export interface Spread {
  id: string
  title: string
  subtitle: string
  description: string
  season: string
  /** Kept in the data; every chapter is set on the same calm page now. */
  tone: string
  images: { src: string; alt: string }[]
  pieces: { handle: string; title: string; price: number; compareAtPrice: number | null; prices: PriceBook; image: string }[]
}

/**
 * The lookbook: a short header with links to each chapter, then the chapters one under the other,
 * each with its words and the pieces from the shop beside its photographs. Still and readable.
 */
export default function LookbookView({ spreads }: { spreads: Spread[] }) {
  return (
    <>
      <section className="border-b border-ink/10 bg-ivory pt-nav text-ink">
        <div className="container-wide pb-10 pt-10 md:pb-14 md:pt-14">
          <p className="text-eyebrow text-stone">Lookbook</p>
          <h1 className="mt-4 text-display">The lookbook</h1>
          <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-xl text-lead text-stone">The pieces worn where they belong, with everything in each chapter a click away in the shop.</p>
            <ol className="flex flex-wrap gap-2">
              {spreads.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex items-center gap-2 border border-ink/15 px-3.5 py-2 text-[0.8rem] hover:border-ink">
                    <span className="text-stone">{String(i + 1).padStart(2, '0')}</span>
                    {plain(s.title)}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {spreads.map((s, i) => (
        <section key={s.id} id={s.id} aria-label={plain(s.title)} className={cn('scroll-mt-[calc(var(--nav-h)+1rem)] py-14 text-ink md:py-20', i % 2 ? 'bg-bone' : 'bg-ivory')}>
          <div className="container-wide grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className={cn('lg:col-span-4', i % 2 === 1 && 'lg:order-2 lg:col-start-9')}>
              <p className="text-eyebrow text-stone">
                {String(i + 1).padStart(2, '0')} · {s.subtitle} · {s.season}
              </p>
              <h2 className="mt-3 text-headline">{accent(s.title)}</h2>
              <p className="mt-4 max-w-sm leading-relaxed text-stone">{s.description}</p>

              {s.pieces.length ? (
                <div className="mt-8">
                  <p className="text-eyebrow text-stone">In this chapter</p>
                  <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
                    {s.pieces.map((p) => (
                      <li key={p.handle}>
                        <Link href={`/product/${p.handle}`} className="group flex items-center gap-3 py-2.5">
                          <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-parchment">{p.image ? <Image src={p.image} alt="" fill sizes="44px" className="object-cover" /> : null}</span>
                          <span className="min-w-0 flex-1 truncate text-[0.9rem] group-hover:underline">{p.title}</span>
                          <ProductPrice product={p} showCompareAt={false} className="text-[0.84rem] font-medium" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <ButtonLink href="/shop" variant="outline" size="sm" className="mt-8">
                  Shop the pieces
                </ButtonLink>
              )}
            </div>

            <div className={cn('grid grid-cols-2 gap-3 md:gap-4 lg:col-span-8', i % 2 === 1 && 'lg:order-1 lg:col-start-1')}>
              {s.images.slice(0, 3).map((img, j) => (
                <div key={img.src} className={cn('relative overflow-hidden bg-parchment', j === 2 ? 'col-span-2 aspect-[16/9]' : 'aspect-[3/4]')}>
                  <Image src={img.src} alt={img.alt} fill sizes={j === 2 ? '(min-width:1024px) 60vw, 100vw' : '(min-width:1024px) 30vw, 50vw'} className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
