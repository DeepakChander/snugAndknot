'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import SplitReveal from '@/components/motion/SplitReveal'
import Reveal from '@/components/motion/Reveal'
import UnmaskImage from '@/components/motion/UnmaskImage'
import { formatDate } from '@/lib/format'
import type { JournalPost } from '@/lib/journal'

export function JournalIndex({ posts }: { posts: JournalPost[] }) {
  const [lead, ...rest] = posts
  return (
    <div className="bg-ivory pb-28 pt-nav text-ink">
      <header className="container-wide pb-14 pt-12 md:pt-20">
        <p className="text-eyebrow slash text-stone">The journal</p>
        <SplitReveal as="h1" type="chars" intro className="mt-5 text-mega">
          Notes on knitwear
        </SplitReveal>
        <Reveal delay={0.3} className="mt-8 max-w-xl text-lead text-stone">
          Fibres, stitches and the case for fewer, better things.
        </Reveal>
      </header>
      {lead ? (
        <Link href={`/journal/${lead.slug}`} className="group container-wide grid items-end gap-10 border-t border-ink/10 pt-12 lg:grid-cols-[1.4fr_1fr]" data-cursor="view" data-cursor-label="Read">
          <UnmaskImage src={lead.image} alt={lead.imageAlt} sizes="(min-width:1024px) 58vw, 100vw" className="aspect-[16/11]" />
          <div>
            <p className="text-eyebrow slash text-stone">
              {lead.tag} · {lead.readTime}
            </p>
            <h2 className="mt-4 text-headline transition-colors group-hover:text-burgundy">{lead.title}</h2>
            <p className="mt-5 text-stone">{lead.description}</p>
            <p className="mt-6 text-label">{formatDate(lead.date, 'en-US', { dateStyle: 'long' })}</p>
          </div>
        </Link>
      ) : null}
      <div className="container-wide mt-20 grid gap-12 md:grid-cols-2">
        {rest.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.08}>
            <Link href={`/journal/${p.slug}`} className="group block" data-cursor="view" data-cursor-label="Read">
              <span className="relative block aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-parchment">
                <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />
              </span>
              <span className="mt-5 block text-eyebrow slash text-stone">
                {p.tag} · {p.readTime}
              </span>
              <span className="mt-2 block font-display text-4xl leading-tight transition-colors group-hover:text-burgundy">{p.title}</span>
              <span className="mt-3 block text-stone">{p.description}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export function JournalArticle({ post, more }: { post: JournalPost; more: JournalPost[] }) {
  const hero = useRef<HTMLElement>(null)
  const body = useRef<HTMLElement>(null)
  const { scrollYProgress: heroP } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const y = useTransform(heroP, [0, 1], ['0%', '20%'])
  const { scrollYProgress } = useScroll({ target: body, offset: ['start 30%', 'end 80%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 })

  return (
    <>
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[101] h-[3px] origin-left bg-gold" aria-hidden />
      <section ref={hero} data-nav-theme="dark" className="relative h-[86svh] min-h-[560px] overflow-hidden bg-noir text-bone">
        <motion.div style={{ y }} className="absolute inset-[-8%]">
          <Image src={post.image} alt={post.imageAlt} fill priority sizes="100vw" className="object-cover opacity-70" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-noir/20" />
        <div className="container-wide relative flex h-full flex-col justify-end pb-14">
          <Link href="/journal" className="link-wipe text-eyebrow text-bone/60">
            ← Journal
          </Link>
          <p className="mt-6 text-eyebrow slash text-butter">
            {post.tag} · {post.readTime} · {formatDate(post.date, 'en-US', { dateStyle: 'long' })}
          </p>
          <SplitReveal as="h1" type="chars" intro className="mt-4 max-w-[16ch] text-display">
            {post.title}
          </SplitReveal>
        </div>
      </section>
      <article ref={body} className="bg-ivory py-20 text-ink md:py-28">
        <div className="mx-auto max-w-2xl px-gutter">
          <p className="font-display text-[clamp(1.6rem,2.4vw,2.2rem)] leading-[1.25]">{post.description}</p>
          <div className="mt-12 space-y-6 text-[1.07rem] leading-[1.8] text-ink/80">
            {post.body.map((b, i) =>
              b.type === 'h' ? (
                <h2 key={i} className="pt-6 font-display text-4xl leading-tight text-ink">
                  {b.text}
                </h2>
              ) : b.type === 'quote' ? (
                <Reveal key={i}>
                  <blockquote className="my-10 border-l-2 border-gold pl-6 font-display text-[clamp(1.8rem,3vw,2.6rem)] italic leading-[1.15] text-burgundy">{b.text}</blockquote>
                </Reveal>
              ) : (
                <p key={i}>{b.text}</p>
              )
            )}
          </div>
        </div>
      </article>
      {more.length ? (
        <section className="border-t border-ink/10 bg-ivory py-20 text-ink" aria-label="More from the journal">
          <div className="container-wide">
            <h2 className="text-headline">Keep reading</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-2">
              {more.map((p) => (
                <Link key={p.slug} href={`/journal/${p.slug}`} className="group grid grid-cols-[140px_1fr] items-center gap-6" data-cursor="view" data-cursor-label="Read">
                  <span className="relative aspect-square overflow-hidden rounded-2xl bg-parchment">
                    <Image src={p.image} alt="" fill sizes="140px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </span>
                  <span>
                    <span className="text-eyebrow slash text-stone">{p.tag}</span>
                    <span className="mt-2 block font-display text-3xl leading-tight group-hover:text-burgundy">{p.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
