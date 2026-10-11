'use client'

import Link from 'next/link'
import SplitReveal from '@/components/motion/SplitReveal'
import UnmaskImage from '@/components/motion/UnmaskImage'
import Reveal from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/kit/Button'
import type { Collection } from '@/types/commerce'
import { cn } from '@/lib/format'

export default function CollectionsIndex({ collections }: { collections: (Collection & { count: number })[] }) {
  return (
    <div data-nav-theme="dark" className="bg-noir pb-24 text-bone">
      <header className="container-wide pb-16 pt-[calc(var(--nav-h)+var(--announce-h)+4rem)]">
        <p className="text-eyebrow text-gold">Collections · {String(collections.length).padStart(2, '0')}</p>
        <SplitReveal as="h1" type="chars" intro className="mt-6 text-mega">
          Stories in wool
        </SplitReveal>
        <Reveal delay={0.3} className="mt-8 max-w-xl text-lead text-bone/60">
          Each collection gathers pieces around a feeling — a cold morning, a long walk, a quiet evening in.
        </Reveal>
      </header>

      <div className="container-wide space-y-24 md:space-y-36">
        {collections.map((c, i) => (
          <article key={c.id} className={cn('grid items-center gap-8 md:grid-cols-12 md:gap-12')}>
            <Link href={`/collections/${c.handle}`} className={cn('block md:col-span-7', i % 2 === 1 && 'md:order-2 md:col-start-6')} data-cursor="view" data-cursor-label="Explore">
              <UnmaskImage src={c.image} alt={c.title} sizes="(min-width:768px) 58vw, 100vw" className="aspect-[4/5] md:aspect-[5/6]" />
            </Link>
            <div className={cn('md:col-span-5', i % 2 ? 'md:order-1 md:col-start-1' : '')}>
              <Reveal>
                <p className="font-mono text-sm text-gold">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-4 text-eyebrow text-taupe">{c.subtitle}</p>
                <h2 className="mt-3 text-headline uppercase">{c.title}</h2>
                <p className="mt-6 max-w-md text-bone/60">{c.description}</p>
                <div className="mt-8 flex items-center gap-6">
                  <ButtonLink href={`/collections/${c.handle}`} variant="light" arrow>
                    Explore
                  </ButtonLink>
                  <span className="text-label text-bone/50">
                    {c.count} piece{c.count === 1 ? '' : 's'}
                  </span>
                </div>
              </Reveal>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
