'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import SplitReveal from '@/components/motion/SplitReveal'
import Reveal from '@/components/motion/Reveal'
import { cn } from '@/lib/format'
import { accent } from '@/lib/accent'

/**
 * Editorial page header: eyebrow, split-reveal title, intro and an optional parallax photograph.
 * `title` may mark one word as the italic accent with *asterisks*. The scale is sized so the
 * longest word of a three-word title still fits beside the photograph.
 */
export default function PageHero({
  eyebrow,
  title,
  intro,
  image,
  tone = 'light',
  children,
}: {
  eyebrow: string
  title: string
  intro?: string
  image?: string
  tone?: 'light' | 'dark'
  children?: React.ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const dark = tone === 'dark'
  return (
    <section ref={ref} data-nav-theme={dark ? 'dark' : undefined} className={cn('relative overflow-hidden pt-nav', dark ? 'bg-noir text-bone' : 'bg-ivory text-ink')}>
      <div className={cn('container-wide grid items-end gap-10 pb-16 pt-12 md:pb-24 md:pt-20', image && 'lg:grid-cols-[1.2fr_1fr]')}>
        <div>
          <p className={cn('text-eyebrow slash', dark ? 'text-butter' : 'text-stone')}>{eyebrow}</p>
          <SplitReveal
            as="h1"
            type="words"
            intro
            className="mt-5 font-display text-[clamp(2.75rem,10.5vw,5.5rem)] font-[650] uppercase leading-[0.86] tracking-[-0.055em] lg:text-[clamp(4rem,7vw,8rem)]"
          >
            {accent(title)}
          </SplitReveal>
          {intro ? (
            <Reveal delay={0.35} className={cn('mt-8 max-w-xl text-lead', dark ? 'text-bone/65' : 'text-stone')}>
              {intro}
            </Reveal>
          ) : null}
          {children}
        </div>
        {image ? (
          <motion.div initial={{ clipPath: 'inset(100% 0 0 0 round 2rem)' }} animate={{ clipPath: 'inset(0% 0 0 0 round 2rem)' }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] lg:block">
            <motion.div style={{ y }} className="absolute inset-[-10%]">
              <Image src={image} alt="" fill priority sizes="40vw" className="object-cover" />
            </motion.div>
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}
