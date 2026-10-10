'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import PageHero from './PageHero'
import { AccordionItem } from '@/components/kit/Accordion'
import { ButtonLink } from '@/components/kit/Button'
import { SearchIcon } from '@/components/kit/icons'
import { cn } from '@/lib/format'
import type { FaqGroup } from '@/lib/faq'

export default function FaqView({ groups }: { groups: FaqGroup[] }) {
  const [q, setQ] = useState('')
  const [group, setGroup] = useState<string | null>(null)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return groups
      .filter((g) => !group || g.name === group)
      .map((g) => ({ ...g, items: g.items.filter((i) => !term || i.q.toLowerCase().includes(term) || i.a.toLowerCase().includes(term)) }))
      .filter((g) => g.items.length)
  }, [groups, q, group])

  return (
    <>
      <PageHero eyebrow="Client care" title="Questions, answered" intro="Everything about ordering, delivery, sizing and returns. Can’t find it? Write to us — a person will reply." />
      <div className="bg-ivory pb-28 text-ink">
        <div className="container-wide border-t border-ink/10 pt-12">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <label className="flex max-w-md flex-1 items-center gap-3 rounded-full border border-ink/15 px-5 py-3 focus-within:border-ink/60">
              <SearchIcon size={18} className="text-stone" />
              <span className="sr-only">Search questions</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions" className="min-w-0 flex-1 bg-transparent outline-none" />
            </label>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {[null, ...groups.map((g) => g.name)].map((g) => (
                <button key={g ?? 'all'} type="button" onClick={() => setGroup(g)} className={cn('shrink-0 rounded-full border px-4 py-2 text-sm transition-colors', group === g ? 'border-ink bg-ink text-ivory' : 'border-ink/15 hover:border-ink/40')}>
                  {g ?? 'All'}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-x-20">
            {filtered.map((g, gi) => (
              <motion.section key={g.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: (gi % 2) * 0.08 }}>
                <h2 className="font-display text-4xl">{g.name}</h2>
                <div className="mt-4">
                  {g.items.map((it) => (
                    <AccordionItem key={it.q} title={it.q} defaultOpen={!!q.trim()}>
                      <p>{it.a}</p>
                    </AccordionItem>
                  ))}
                </div>
              </motion.section>
            ))}
            {!filtered.length ? <p className="text-stone">No questions match “{q}”.</p> : null}
          </div>
          <div className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-noir p-10 text-bone">
            <p className="font-display text-4xl">Still wondering?</p>
            <ButtonLink href="/contact" variant="light" arrow>
              Write to us
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  )
}
