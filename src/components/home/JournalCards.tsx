import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/format'
import type { JournalPost } from '@/lib/journal'

/** The three latest Journal stories as photograph cards with their tag, date and title. */
export default function JournalCards({ posts }: { posts: JournalPost[] }) {
  if (!posts.length) return null
  return (
    <section aria-labelledby="journal-title" className="bg-ivory py-[clamp(3.5rem,7vw,6rem)] text-ink">
      <div className="container-wide">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-eyebrow text-stone">Stories</p>
            <h2 id="journal-title" className="mt-3 text-headline">
              The <em>journal</em>
            </h2>
          </div>
          <Link href="/journal" className="shrink-0 border-b border-ink pb-1 text-[0.74rem] font-medium uppercase tracking-[0.14em]">
            All stories
          </Link>
        </div>
        <ul className="mt-8 grid gap-x-4 gap-y-10 md:grid-cols-3">
          {posts.slice(0, 3).map((p) => (
            <li key={p.slug}>
              <Link href={`/journal/${p.slug}`} className="group block">
                <span className="relative block aspect-[4/3] overflow-hidden bg-parchment">
                  <Image src={p.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]" />
                </span>
                <span className="mt-4 flex gap-3 text-[0.7rem] uppercase tracking-[0.12em] text-stone">
                  <span>{p.tag}</span>
                  <span aria-hidden>·</span>
                  <span>{formatDate(p.date)}</span>
                  <span aria-hidden>·</span>
                  <span>{p.readTime}</span>
                </span>
                <h3 className="mt-2 text-[1.15rem] leading-snug group-hover:underline group-hover:underline-offset-4">{p.title}</h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
