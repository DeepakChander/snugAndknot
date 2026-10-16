import Image from 'next/image'
import Link from 'next/link'
import { plain } from '@/lib/accent'
import type { Collection } from '@/types/commerce'

/** Every collection as a photograph tile with its name, its line, a short description and how many pieces it holds. */
export default function CollectionsIndex({ collections }: { collections: (Collection & { count: number })[] }) {
  return (
    <div className="bg-ivory pb-24 pt-nav text-ink">
      <header className="container-wide border-b border-ink/10 pb-10 pt-10 md:pb-14 md:pt-14">
        <p className="text-eyebrow text-stone">Collections</p>
        <h1 className="mt-4 text-display">Edits to shop together</h1>
        <p className="mt-5 max-w-xl text-lead text-stone">Each collection gathers pieces made to be worn together.</p>
      </header>

      <ul className="container-wide mt-10 grid gap-x-4 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((c, i) => (
          <li key={c.id}>
            <Link href={`/collections/${c.handle}`} className="group block">
              <span className="relative block aspect-[4/5] overflow-hidden bg-parchment">
                {c.image ? (
                  <Image src={c.image} alt="" fill priority={i < 3} sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]" unoptimized={c.image.startsWith('/api/media/')} />
                ) : null}
              </span>
              <span className="mt-4 flex items-baseline justify-between gap-4">
                <span className="text-[1.15rem] font-medium group-hover:underline group-hover:underline-offset-4">{plain(c.title)}</span>
                <span className="shrink-0 text-[0.72rem] uppercase tracking-[0.12em] text-stone">
                  {c.count} piece{c.count === 1 ? '' : 's'}
                </span>
              </span>
              {c.subtitle ? <span className="mt-1 block text-[0.86rem] text-stone">{c.subtitle}</span> : null}
              {c.description ? <span className="mt-2 line-clamp-2 block text-[0.9rem] text-ink/70">{c.description}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
