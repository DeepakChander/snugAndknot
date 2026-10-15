'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import Reveal, { RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/kit/Button'

/*
 * The About page: the wording of the original Snug&Knot story page (hero, numbers, values,
 * philosophy, milestones, closing), set in the same calm language as the home hero: ivory, the
 * serif headline, hairlines and quiet entrances. Flat on purpose; the 3D lives in the home hero.
 */

const STATS = [
  { value: 142, suffix: '+', label: 'Artisan partners' },
  { value: 35, suffix: 'K+', label: 'Happy customers' },
  { value: 98, suffix: '%', label: 'Sustainable materials' },
  { value: 12, suffix: '', label: 'Countries shipped' },
]

const VALUES = [
  {
    title: 'Thoughtfully Designed',
    body: 'Every piece begins with intention. We design for real life, creating garments that move with you from morning to evening.',
  },
  {
    title: 'Sustainably Sourced',
    body: 'We partner with responsible mills and suppliers to ensure our materials meet the highest environmental standards.',
  },
  {
    title: 'Crafted with Care',
    body: 'Our artisan partners bring decades of expertise to every stitch, ensuring each garment meets our exacting quality standards.',
  },
  {
    title: 'Made to Last',
    body: 'We believe in buying less but better. Our pieces are designed to endure, both in construction and in style.',
  },
]

const PILLARS = [
  {
    title: 'Material over material',
    subtitle: 'Substance first',
    body: 'We do not choose fibers for their name. We choose them for their nerve — the way they resist, yield, and remember the shape of a life lived fully.',
    stat: { value: '100%', label: 'Natural fibers' },
  },
  {
    title: 'The knot, not the bow',
    subtitle: 'Function before ornament',
    body: 'A bow is decoration. A knot is decision. Every seam, every stitch placement exists because removing it would make the piece less. Nothing is ornamental.',
    stat: { value: '47', label: 'Stitch points per inch' },
  },
  {
    title: 'Wear is not damage',
    subtitle: 'Time as collaborator',
    body: 'A garment that cannot age was never alive. Our textiles are designed to develop patina — to become more yours with every wearing, not less ours.',
    stat: { value: '∞', label: 'Wears by design' },
  },
]

const TIMELINE = [
  {
    year: '2020',
    event: 'Founded with a small collection of 12 essential pieces.',
  },
  {
    year: '2021',
    event: 'Expanded to 5 categories. Launched sustainable packaging initiative.',
  },
  { year: '2022', event: 'Opened our flagship studio in SoHo, New York.' },
  {
    year: '2023',
    event: 'Reached 25,000 customers worldwide. Partnered with 100+ artisans.',
  },
  {
    year: '2024',
    event: 'Launched our certified carbon-neutral shipping program.',
  },
  {
    year: '2025',
    event: 'Introduced our AW25 collection, our most ambitious yet.',
  },
]

/** Counts up once when it scrolls into view. Renders the real number first, so it is never wrong without JS. */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const started = useRef(false)

  // Writes straight to the text node, so the count does not re-render React sixty times a second.
  useEffect(() => {
    const el = ref.current
    if (!el || reduce || started.current) return
    if (!inView) {
      el.textContent = `0${suffix}`
      return
    }
    started.current = true
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`),
    })
    return () => controls.stop()
  }, [inView, reduce, value, suffix])

  return (
    <span ref={ref} className="tabular-nums">
      {`${value}${suffix}`}
    </span>
  )
}

function Eyebrow({ children, className = 'text-stone' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[0.72rem] font-medium uppercase tracking-[0.3em] md:text-[0.78rem] ${className}`}>{children}</p>
}

export default function AboutView({ storeName }: { storeName: string }) {
  return (
    <>
      {/* Our story — the headline and the founding story beside the studio photograph. */}
      <section data-nav-theme="light" className="relative overflow-hidden bg-ivory pb-20 pt-[calc(var(--nav-h)+var(--announce-h,0px)+2.5rem)] text-ink md:pb-28">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="order-2 lg:order-1 lg:col-span-6 lg:pr-10">
            <Eyebrow className="sk-rise text-ink/70">Our story</Eyebrow>
            <h1 className="sk-rise mt-4 font-serif text-[clamp(2.8rem,6vw,5.5rem)] font-normal leading-[1.0] tracking-[-0.01em] [animation-delay:120ms]">
              Woven with <em>intention</em>
            </h1>
            <div className="sk-rise mt-8 max-w-lg space-y-5 leading-relaxed text-ink/75 [animation-delay:220ms]">
              <p className="text-[1.05rem] md:text-lg">
                {storeName} was born from a simple belief: that the clothes we wear should feel as good as they look. Founded in 2020, we set out to create a fashion brand that honors craft, celebrates simplicity, and
                respects the world we live in.
              </p>
              <p className="text-stone">
                Every piece in our collection is thoughtfully designed to be versatile, enduring, and effortlessly elegant. We work with artisan partners around the world who share our commitment to quality and
                sustainability.
              </p>
            </div>
            <div className="sk-rise mt-9 [animation-delay:320ms]">
              <ButtonLink href="/collections" size="lg" arrow>
                Explore collections
              </ButtonLink>
            </div>
          </div>

          <div className="sk-rise order-1 lg:order-2 lg:col-span-5 lg:col-start-8 [animation-delay:160ms]">
            <figure className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[1.5rem] bg-parchment shadow-[0_40px_80px_-45px_rgba(22,16,14,0.55)] ring-1 ring-ink/5 lg:max-w-none">
              <Image src="/images/about/about-hero.png" alt={`${storeName} founder in the studio`} fill priority sizes="(min-width:1024px) 40vw, 90vw" className="sk-settle object-cover object-[50%_40%]" />
            </figure>
          </div>
        </div>
      </section>

      {/* The numbers. */}
      <section data-nav-theme="light" aria-label="In numbers" className="border-y border-ink/10 bg-bone text-ink">
        <RevealGroup className="container-wide grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <RevealItem
              key={s.label}
              className={`px-4 py-10 text-center md:py-14 ${i % 2 ? 'border-l border-ink/10' : ''} ${i === 2 ? 'border-t border-ink/10 lg:border-l lg:border-t-0' : ''} ${i === 3 ? 'border-t border-ink/10 lg:border-t-0' : ''}`}
            >
              <p className="font-serif text-[clamp(2.6rem,5vw,4.25rem)] leading-none text-burgundy">
                <Counter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-stone">{s.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* What we believe — the four values. */}
      <section data-nav-theme="light" aria-labelledby="about-values" className="section-pad bg-ivory text-ink">
        <div className="container-wide">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <Reveal className="md:col-span-7">
              <Eyebrow>Our principles</Eyebrow>
              <h2 id="about-values" className="mt-4 font-serif text-[clamp(2.3rem,4.6vw,4rem)] font-normal leading-[1.02]">
                What we <em>believe</em>
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-4 md:col-start-9">
              <p className="text-stone">Four guiding threads that weave through everything we create.</p>
            </Reveal>
          </div>
          <RevealGroup className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <RevealItem key={v.title} className="border-t border-ink/15 pt-6">
                <p className="font-mono text-xs text-burgundy">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.1]">{v.title}</h3>
                <p className="mt-3 leading-relaxed text-stone">{v.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Philosophy — the three knots, on the one dark band of the page. */}
      <section data-nav-theme="dark" aria-labelledby="about-philosophy" className="section-pad bg-ink text-bone">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-3xl text-center">
            <Eyebrow className="text-gold">Philosophy</Eyebrow>
            <h2 id="about-philosophy" className="mt-4 font-serif text-[clamp(2.3rem,4.6vw,4rem)] font-normal leading-[1.05]">
              Three knots that hold <em>everything together</em>
            </h2>
          </Reveal>
          <RevealGroup className="mt-16 grid gap-px overflow-hidden rounded-[1.5rem] bg-bone/10 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <RevealItem key={p.title} className="flex flex-col bg-ink p-8 md:p-10">
                <p className="font-mono text-xs text-gold/80">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-8 text-[0.7rem] font-medium uppercase tracking-[0.26em] text-bone/50">{p.subtitle}</p>
                <h3 className="mt-3 font-serif text-[clamp(1.8rem,2.6vw,2.3rem)] font-normal leading-[1.08]">{p.title}</h3>
                <p className="mt-4 flex-1 leading-relaxed text-bone/65">{p.body}</p>
                <div className="mt-10 flex items-baseline gap-3 border-t border-bone/10 pt-6">
                  <span className="font-serif text-[2.4rem] leading-none text-gold">{p.stat.value}</span>
                  <span className="text-[0.72rem] uppercase tracking-[0.22em] text-bone/50">{p.stat.label}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal className="mt-16 text-center">
            <p className="font-serif text-[clamp(1.3rem,2vw,1.6rem)] italic text-bone/55">&ldquo;What frays was never truly bound.&rdquo;</p>
          </Reveal>
        </div>
      </section>

      {/* Milestones — a single thread with the years along it. */}
      <section data-nav-theme="light" aria-labelledby="about-journey" className="section-pad bg-ivory text-ink">
        <div className="container-wide grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+3rem)]">
              <Eyebrow>Milestones</Eyebrow>
              <h2 id="about-journey" className="mt-4 font-serif text-[clamp(2.3rem,4.6vw,4rem)] font-normal leading-[1.02]">
                Our <em>journey</em>
              </h2>
            </div>
          </Reveal>
          <div className="relative lg:col-span-7 lg:col-start-6">
            <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-ink/15" />
            <ol>
              {TIMELINE.map((t, i) => (
                <li key={t.year} className="pb-10 last:pb-0">
                  <Reveal delay={i * 0.05} y={24} className="relative grid gap-1 pl-10 sm:grid-cols-[7rem_1fr] sm:gap-6">
                    <span aria-hidden className="absolute left-0 top-[0.55rem] h-[11px] w-[11px] rounded-full border border-burgundy bg-ivory" />
                    <span className="font-serif text-[1.9rem] leading-none text-burgundy">{t.year}</span>
                    <p className="leading-relaxed text-ink/75 sm:pt-1.5">{t.event}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Join the story. */}
      <section data-nav-theme="light" aria-labelledby="about-join" className="bg-ivory pb-[clamp(4.5rem,9vw,8rem)] text-ink">
        <div className="container-wide">
          <Reveal className="rounded-[2rem] border border-ink/10 bg-bone px-6 py-16 text-center md:px-16 md:py-24">
            <Eyebrow>Join the story</Eyebrow>
            <h2 id="about-join" className="mx-auto mt-4 max-w-3xl font-serif text-[clamp(2.4rem,5vw,4.5rem)] font-normal leading-[1.02]">
              Every knot tells <em>a story</em>
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-stone">We are still weaving our story, and we would love for you to be part of it. Discover pieces crafted with care, designed to endure.</p>
            <div className="mt-9 flex justify-center">
              <ButtonLink href="/shop" size="lg" arrow>
                Shop the collection
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
