import Image from 'next/image'
import Link from 'next/link'

export interface HomeCard {
  label: string
  href: string
  image: string
  badge?: string
}

/**
 * Portrait cards, one per department or category, with the name and "Shop now" over a soft shade.
 * A row on wide screens (up to five), a swipeable strip on phones.
 */
export default function CategoryCards({ cards }: { cards: HomeCard[] }) {
  if (!cards.length) return null
  const cols = { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' }[Math.min(cards.length, 5)] ?? 'md:grid-cols-5'
  return (
    <section aria-labelledby="home-cards-title" className="bg-bone py-[clamp(2.5rem,5vw,4.5rem)] text-ink">
      <h2 id="home-cards-title" className="sr-only">
        Shop by category
      </h2>
      <ul className={`container-wide no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto md:grid md:gap-5 md:overflow-visible ${cols}`}>
        {cards.map((c) => (
          <li key={c.href} className="w-[46vw] shrink-0 snap-start sm:w-[34vw] md:w-auto">
            <Link href={c.href} className="group relative block aspect-[4/5] overflow-hidden bg-parchment">
              {c.image ? (
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 20vw, 46vw"
                  className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] motion-safe:group-hover:scale-[1.04]"
                  unoptimized={c.image.startsWith('/api/media/')}
                />
              ) : null}
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-4 text-bone md:p-5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.95rem] font-medium uppercase tracking-[0.14em] md:text-[1.02rem]">{c.label}</span>
                  {c.badge ? <span className="border border-bone/60 px-1.5 py-0.5 text-[0.58rem] uppercase tracking-[0.1em]">{c.badge}</span> : null}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-[0.8rem] text-bone/85">
                  Shop now
                  <svg viewBox="0 0 16 16" aria-hidden className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
