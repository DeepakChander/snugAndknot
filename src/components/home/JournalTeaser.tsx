'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gsap, useGSAP, isTouch } from '@/lib/motion/gsap'
import { TextLink } from '@/components/kit/Button'
import type { JournalPost } from '@/lib/journal'

/** Journal list with a photograph that trails the cursor (desktop) — the classic editorial hover. */
export default function JournalTeaser({ posts }: { posts: JournalPost[] }) {
  const root = useRef<HTMLElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)

  useGSAP(
    () => {
      const el = preview.current
      if (!el || isTouch()) return
      const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' })
      const yTo = gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' })
      const move = (e: PointerEvent) => {
        xTo(e.clientX + 24)
        yTo(e.clientY - 120)
      }
      window.addEventListener('pointermove', move, { passive: true })
      return () => window.removeEventListener('pointermove', move)
    },
    { scope: root }
  )

  return (
    <section ref={root} className="section-pad bg-ivory text-ink" aria-label="From the journal">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-headline">
            From the <em className="text-burgundy">journal</em>
          </h2>
          <TextLink href="/journal" className="text-label">
            All stories
          </TextLink>
        </div>
        <ul className="mt-12 border-t border-ink/10" onMouseLeave={() => setHover(null)}>
          {posts.map((p, i) => (
            <li key={p.slug} onMouseEnter={() => setHover(i)}>
              <Link href={`/journal/${p.slug}`} className="group grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2 border-b border-ink/10 py-7 md:grid-cols-[6rem_1fr_auto_auto] md:py-9" data-cursor="view" data-cursor-label="Read">
                <span className="font-mono text-xs text-stone">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-[clamp(1.8rem,3.6vw,3.4rem)] leading-[1] tracking-[-0.02em] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-4">{p.title}</span>
                <span className="col-start-2 text-label text-burgundy md:col-start-auto">{p.tag}</span>
                <span className="hidden text-sm text-stone md:block">{p.readTime}</span>
                <span className="relative col-span-2 mt-3 block aspect-[16/9] overflow-hidden rounded-xl md:hidden">
                  <Image src={p.image} alt="" fill sizes="100vw" className="object-cover" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div ref={preview} className="pointer-events-none fixed left-0 top-0 z-40 hidden h-56 w-44 md:block" aria-hidden>
        <AnimatePresence>
          {hover !== null && posts[hover] ? (
            <motion.div
              key={posts[hover].slug}
              initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 overflow-hidden rounded-xl shadow-2xl"
            >
              <Image src={posts[hover].image} alt="" fill sizes="176px" className="object-cover" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  )
}
