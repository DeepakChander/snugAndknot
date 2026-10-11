import Image from 'next/image'
import Link from 'next/link'
import SplitReveal from '@/components/motion/SplitReveal'
import { ButtonLink } from '@/components/kit/Button'
import { formatDate } from '@/lib/format'
import type { JournalPost } from '@/lib/journal'

/** Three stories as editorial cards: the frame draws in while the photograph leans forward. */
export default function JournalCards({ posts }: { posts: JournalPost[] }) {
  if (!posts.length) return null
  return (
    <section data-nav-theme="light" aria-labelledby="journal-title" className="bg-bone py-[clamp(5rem,10vw,9rem)] text-ink">
      <div className="container-wide">
        <div className="grid gap-6 pb-[clamp(2.5rem,5vw,4rem)] md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="text-eyebrow slash text-stone">Journal</p>
            <SplitReveal as="h2" id="journal-title" className="mt-5 text-display">
              Notes from <em>the workroom</em>
            </SplitReveal>
          </div>
          <div className="flex items-end md:col-span-4 md:justify-end">
            <ButtonLink href="/journal" variant="outline" size="sm" arrow>
              All stories
            </ButtonLink>
          </div>
        </div>

        <ul className="grid gap-x-5 gap-y-12 md:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <li key={p.slug}>
              <Link href={`/journal/${p.slug}`} className="group block" data-cursor="view" data-cursor-label="Read">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-parchment transition-transform duration-1000 ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[0.96]">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 32vw, 92vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.4,0,.2,1)] group-hover:scale-[1.1]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-bone/85 px-3 py-1.5 text-label backdrop-blur">{p.tag}</span>
                  <span className="absolute bottom-4 left-4 flex translate-y-[160%] items-center gap-2 rounded-full bg-ink px-4 py-2 font-display text-sm font-medium text-bone transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0">
                    Read the story <span aria-hidden>→</span>
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between text-label text-stone">
                  <span className="tabular-nums">{String(i + 1).padStart(2, '0')} — {formatDate(p.date)}</span>
                  <span>{p.readTime}</span>
                </div>
                <h3 className="mt-3 text-[clamp(1.5rem,2.3vw,2.3rem)] font-semibold leading-[1] tracking-[-0.04em] transition-colors group-hover:text-signal">{p.title}</h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
