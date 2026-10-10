'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import SplitReveal from '@/components/motion/SplitReveal'

const STEPS = [
  {
    n: '01',
    title: 'The fibre',
    body: 'Merino, cashmere blends and long-staple cotton — chosen by hand for softness, strength and the way they age.',
    image: '/images/collection-home/Material-Intimacy.png',
  },
  {
    n: '02',
    title: 'The knit',
    body: 'Cables, diamonds and fine-gauge jersey, knitted in short runs so every panel gets the attention it needs.',
    image: '/images/Collections-Hero/Artisan.png',
  },
  {
    n: '03',
    title: 'The finish',
    body: 'Seams pressed, natural buttons sewn on one at a time, every piece checked before it is folded.',
    image: '/images/about/about-hero.png',
  },
  {
    n: '04',
    title: 'The life after',
    body: 'Made to be worn, washed and worn again — and to look better for it. Care notes come with every piece.',
    image: '/images/collection-home/Lived-In.png',
  },
]

function Card({ step, i, total, progress }: { step: (typeof STEPS)[number]; i: number; total: number; progress: MotionValue<number> }) {
  // Earlier cards shrink and darken as later ones stack on top of them.
  const start = i / total
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - i) * 0.04])
  const dim = useTransform(progress, [start, Math.min(1, start + 1 / total)], [0, i === total - 1 ? 0 : 0.45])
  return (
    <div className="sticky" style={{ top: `calc(var(--nav-h) + 1.5rem + ${i * 1.25}rem)` }}>
      <motion.article style={{ scale }} className="relative grid origin-top overflow-hidden rounded-[2rem] bg-umber text-bone md:h-[72svh] md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto">
          <Image src={step.image} alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col gap-8 p-8 md:p-12">
          <div className="flex items-center justify-between">
            <span className="text-eyebrow text-gold">Fibre to finish</span>
            <span className="font-mono text-sm text-bone/50">
              {step.n} / {String(total).padStart(2, '0')}
            </span>
          </div>
          <div>
            <h3 className="text-[clamp(2.6rem,5vw,5rem)] leading-[0.9]">{step.title}</h3>
            <p className="mt-6 max-w-md text-lead text-bone/70">{step.body}</p>
          </div>
          <span className="mt-auto font-display text-[clamp(6rem,12vw,11rem)] leading-none text-bone/[0.06]" aria-hidden>
            {step.n}
          </span>
        </div>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-noir" />
      </motion.article>
    </div>
  )
}

export default function CraftStack() {
  const root = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end end'] })
  return (
    <section data-nav-theme="dark" className="section-pad relative bg-noir" aria-label="How it is made">
      <div className="container-wide">
        <div className="mb-14 grid gap-6 text-bone md:grid-cols-2 md:items-end">
          <SplitReveal as="h2" className="text-headline">
            From fibre to finish, nothing is rushed.
          </SplitReveal>
          <p className="max-w-md text-bone/60 md:justify-self-end">Four quiet steps between a skein of yarn and the piece you will reach for every cold morning.</p>
        </div>
        <div ref={root} className="space-y-8 pb-[8vh]">
          {STEPS.map((s, i) => (
            <Card key={s.n} step={s} i={i} total={STEPS.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  )
}
