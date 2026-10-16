import Image from 'next/image'
import { cn } from '@/lib/format'
import { accent } from '@/lib/accent'

/**
 * Page header for the information pages: a small label, the title, a short intro and, on wide
 * screens, an optional photograph beside them. `title` may mark one word as the italic accent with
 * *asterisks*. Light and still; `tone` is accepted for older call sites (every header is light now).
 */
export default function PageHero({
  eyebrow,
  title,
  intro,
  image,
  tone,
  children,
}: {
  eyebrow: string
  title: string
  intro?: string
  image?: string
  tone?: 'light' | 'dark'
  children?: React.ReactNode
}) {
  void tone
  return (
    <section className="border-b border-ink/10 bg-ivory pt-nav text-ink">
      <div className={cn('container-wide grid items-end gap-10 pb-12 pt-10 md:pb-16 md:pt-14', image && 'lg:grid-cols-[1.3fr_1fr]')}>
        <div>
          <p className="text-eyebrow text-stone">{eyebrow}</p>
          <h1 className="mt-4 text-display">{accent(title)}</h1>
          {intro ? <p className="mt-5 max-w-xl text-lead text-stone">{intro}</p> : null}
          {children}
        </div>
        {image ? (
          <div className="relative hidden aspect-[4/5] overflow-hidden bg-parchment lg:block">
            <Image src={image} alt="" fill priority sizes="40vw" className="object-cover" />
          </div>
        ) : null}
      </div>
    </section>
  )
}
