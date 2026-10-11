'use client'

import { useEffect, useState } from 'react'
import PageHero from './PageHero'
import { scrollToTarget } from '@/lib/motion/lenis'
import { cn } from '@/lib/format'
import type { LegalSection } from '@/lib/legal'

export default function LegalView({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  const [active, setActive] = useState(sections[0]?.id)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [sections])

  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro} />
      <div className="bg-ivory pb-28 text-ink">
        <div className="container-wide grid gap-12 border-t border-ink/10 pt-14 lg:grid-cols-[260px_1fr] lg:gap-20">
          <nav aria-label="On this page" className="hidden lg:block">
            <ol className="sticky top-[calc(var(--nav-offset)+2rem)] space-y-1">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => scrollToTarget(`#${s.id}`, -120)}
                    className={cn('flex w-full items-baseline gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors', active === s.id ? 'bg-ink text-ivory' : 'text-stone hover:text-ink')}
                  >
                    <span className="font-mono text-[0.65rem] opacity-60">{String(i + 1).padStart(2, '0')}</span>
                    {s.title}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <article className="max-w-2xl space-y-14">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-32">
                <p className="font-mono text-xs text-burgundy">{String(i + 1).padStart(2, '0')}</p>
                <h2 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.5rem)] font-semibold leading-[1] tracking-[-0.04em]">{s.title}</h2>
                <div className="mt-5 space-y-4 leading-relaxed text-stone">
                  {s.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </>
  )
}
