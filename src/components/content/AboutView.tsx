'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import SplitReveal from '@/components/motion/SplitReveal'
import Reveal, { RevealGroup, RevealItem } from '@/components/motion/Reveal'
import Marquee from '@/components/motion/Marquee'
import { ButtonLink } from '@/components/kit/Button'
import { LeafIcon, NeedleIcon, SparkIcon, StarIcon } from '@/components/kit/icons'

const PRINCIPLES = [
  { Icon: LeafIcon, title: 'Natural fibres first', body: 'Merino, cotton–cashmere blends and long-staple cotton — chosen for how they feel, breathe and age.' },
  { Icon: SparkIcon, title: 'Designed for real life', body: 'Every piece begins with intention: garments that move with you from morning to evening.' },
  { Icon: NeedleIcon, title: 'Finished by hand', body: 'Buttons sewn on, seams pressed and every piece checked before it is folded.' },
  { Icon: StarIcon, title: 'Fewer, better', body: 'We would rather make a short list of pieces you keep for years than a long one you forget.' },
]

const WORKROOM = [
  { src: '/images/Collections-Hero/Artisan.png', caption: 'At the loom' },
  { src: '/images/collection-home/Material-Intimacy.png', caption: 'Reading the cable' },
  { src: "/images/collection-home/Artisan's.png", caption: 'Pressing the seams' },
  { src: '/images/blog/behind-knit.png', caption: 'Stitch by stitch' },
  { src: '/images/collection-home/Lived-In.png', caption: 'Lived in' },
]

const PHILOSOPHY = [
  { title: 'Material over material', body: 'We do not choose fibres for their name. We choose them for their nerve — the way they resist, yield and remember the shape of a life lived fully.' },
  { title: 'The knot, not the bow', body: 'A bow is decoration. A knot is decision. Every seam and every stitch exists because removing it would make the piece less.' },
  { title: 'Time as collaborator', body: 'A garment that cannot age was never alive. Our knits are made to soften and settle — to become more yours with every wear.' },
]

function ZoomHero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const width = useTransform(scrollYProgress, [0, 0.75], ['min(34vw, 420px)', '100vw'])
  const height = useTransform(scrollYProgress, [0, 0.75], ['min(46vh, 520px)', '100svh'])
  const radius = useTransform(scrollYProgress, [0, 0.75], ['1.75rem', '0rem'])
  const left = useTransform(scrollYProgress, [0, 0.6], ['0vw', '-40vw'])
  const right = useTransform(scrollYProgress, [0, 0.6], ['0vw', '40vw'])
  const fade = useTransform(scrollYProgress, [0.4, 0.65], [1, 0])
  const caption = useTransform(scrollYProgress, [0.75, 0.95], [0, 1])
  return (
    <section ref={ref} data-nav-theme="dark" className="relative h-[260svh] bg-noir text-bone" aria-label="Our story">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div style={{ width, height, borderRadius: radius }} className="relative z-[1] overflow-hidden">
          <Image src="/images/about/about-hero.png" alt="A Snug&Knot maker hand-finishing a knit at the workbench" fill priority sizes="100vw" className="object-cover" />
          <motion.div style={{ opacity: caption }} className="absolute inset-0 flex items-end bg-gradient-to-t from-noir/80 via-transparent to-transparent p-[var(--gutter)] pb-14">
            <p className="max-w-2xl font-display text-[clamp(2rem,4vw,4rem)] leading-[1.02]">Clothes should feel as good as they look.</p>
          </motion.div>
        </motion.div>
        <motion.div style={{ opacity: fade }} className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-between px-[var(--gutter)] text-[clamp(3rem,9vw,10rem)] font-display leading-none tracking-[-0.04em] mix-blend-difference">
          <motion.span style={{ x: left }}>Woven</motion.span>
          <motion.span style={{ x: right }} className="italic">
            with intention
          </motion.span>
        </motion.div>
        <motion.p style={{ opacity: fade }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-eyebrow text-bone/50">
          Scroll
        </motion.p>
      </div>
    </section>
  )
}

function Workroom() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        if (prefersReducedMotion() || !track.current) return
        const dist = () => track.current!.scrollWidth - window.innerWidth
        gsap.to(track.current, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } })
      })
      return () => mm.revert()
    },
    { scope: root }
  )
  return (
    <section ref={root} data-nav-theme="dark" className="overflow-hidden bg-noir text-bone" aria-label="The workroom">
      <div className="flex min-h-[100svh] items-center">
        <div ref={track} className="no-scrollbar flex snap-x snap-mandatory items-center gap-6 overflow-x-auto px-gutter py-20 [scroll-padding-inline:var(--gutter)] lg:snap-none lg:overflow-visible">
          <div className="w-[80vw] shrink-0 snap-start sm:w-[50vw] lg:w-[32vw]">
            <p className="text-eyebrow text-gold">The workroom</p>
            <SplitReveal as="h2" className="mt-6 text-headline">
              Slow hands, small runs.
            </SplitReveal>
            <p className="mt-6 max-w-sm text-bone/60">Every piece passes through hands that care about the details nobody else will notice — and that you will feel every time you wear it.</p>
          </div>
          {WORKROOM.map((w, i) => (
            <figure key={w.src} className={`relative w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30vw] ${i % 2 ? 'lg:mt-32' : 'lg:-mt-24'}`}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-umber">
                <Image src={w.src} alt={w.caption} fill sizes="(min-width:1024px) 30vw, 80vw" className="object-cover" />
              </div>
              <figcaption className="mt-3 flex justify-between text-sm text-bone/60">
                <span>{w.caption}</span>
                <span className="font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AboutView({ values, storeName }: { values: string[]; storeName: string }) {
  return (
    <>
      <ZoomHero />

      <section className="section-pad bg-ivory text-ink">
        <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <p className="text-eyebrow text-burgundy">Our story</p>
          <div>
            <SplitReveal as="p" className="text-[clamp(2rem,3.6vw,3.4rem)] font-display leading-[1.08] tracking-[-0.02em]">
              {`${storeName} was born from a simple belief: that the clothes we wear should feel as good as they look.`}
            </SplitReveal>
            <Reveal className="mt-10 grid gap-8 text-stone md:grid-cols-2">
              <p>We set out to make knitwear that honours craft, celebrates simplicity and respects the people who wear it. Every piece is designed to be versatile, enduring and effortlessly elegant.</p>
              <p>That means natural fibres, honest construction and finishing done by hand — and a collection kept deliberately small, so each piece gets the attention it deserves.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-ivory pb-28 text-ink" aria-label="Principles">
        <RevealGroup className="container-wide grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map(({ Icon, title, body }, i) => (
            <RevealItem key={title} className="group relative overflow-hidden rounded-[1.75rem] border border-ink/10 p-8 transition-colors duration-500 hover:border-transparent hover:bg-noir hover:text-bone">
              <span className="font-mono text-xs text-gold-deep group-hover:text-gold">{String(i + 1).padStart(2, '0')}</span>
              <Icon size={30} className="mt-10 text-burgundy transition-colors group-hover:text-gold" />
              <h3 className="mt-6 font-display text-3xl leading-tight">{title}</h3>
              <p className="mt-3 text-sm text-stone transition-colors group-hover:text-bone/70">{body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {values.length ? (
        <section className="border-y border-ink/10 bg-bone py-10 text-ink" aria-label="What we believe">
          <Marquee speed={0.6}>
            {values.map((v) => (
              <span key={v} className="flex items-center whitespace-nowrap px-8 font-display text-[clamp(2rem,4vw,3.6rem)] italic">
                {v}
                <span className="ml-16 h-2 w-2 rounded-full bg-gold" />
              </span>
            ))}
          </Marquee>
        </section>
      ) : null}

      <Workroom />

      <section className="section-pad bg-ivory text-ink" aria-label="Philosophy">
        <div className="container-wide">
          <SplitReveal as="h2" className="max-w-3xl text-headline">
            Three knots that hold everything together.
          </SplitReveal>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {PHILOSOPHY.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1} className="border-t border-ink/15 pt-6">
                <p className="font-mono text-xs text-gold-deep">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-4 font-display text-3xl">{p.title}</h3>
                <p className="mt-4 leading-relaxed text-stone">{p.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-24 flex flex-col items-start gap-8 rounded-[2rem] bg-burgundy p-10 text-ivory md:flex-row md:items-center md:justify-between md:p-14">
            <p className="max-w-xl font-display text-[clamp(2.2rem,4vw,3.6rem)] leading-[1.02]">Every knot tells a story. Begin yours.</p>
            <ButtonLink href="/shop" variant="light" size="lg" arrow magnetic>
              Shop the collection
            </ButtonLink>
          </Reveal>
        </div>
      </section>
    </>
  )
}
