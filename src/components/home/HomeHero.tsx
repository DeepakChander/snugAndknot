'use client'

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import SplitReveal from '@/components/motion/SplitReveal'
import { ButtonLink } from '@/components/kit/Button'
import { useSettings } from '@/components/providers/SettingsProvider'
import { hasWebGL, useInView } from '@/hooks/use-in-view'
import { prefersReducedMotion, whenPageReady } from '@/lib/motion/gsap'
import type { RingItem } from '@/components/three/ProductRing'

const ProductRing = dynamic(() => import('@/components/three/ProductRing'), { ssr: false })

const EASE = [0.16, 1, 0.3, 1] as const

function splitTitle(title: string): [string, string] {
  const m = title.match(/^(.+?[.!?])\s+(.+)$/)
  return m ? [m[1], m[2]] : [title, '']
}

export default function HomeHero({ items }: { items: RingItem[] }) {
  const { homepage } = useSettings()
  const router = useRouter()
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const scroll = useRef(0)
  const inView = useInView(section, '0px')
  const [gl, setGl] = useState<boolean | null>(null)
  const [ready, setReady] = useState(false)
  const [active, setActive] = useState(0)
  const [first, second] = splitTitle(homepage.heroTitle)

  useEffect(() => {
    setGl(hasWebGL() && !prefersReducedMotion() && items.length >= 5)
    return whenPageReady(() => setReady(true))
  }, [items.length])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end start'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => (scroll.current = v))
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-35%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const stageOpacity = useTransform(scrollYProgress, [0.3, 1], [1, 0.2])

  const setCursor = useCallback((v: 'drag' | 'view' | 'default') => {
    const el = stage.current
    if (!el) return
    el.dataset.cursor = v === 'default' ? 'hover' : v
    el.dataset.cursorLabel = v === 'view' ? 'Open' : v === 'drag' ? 'Drag' : ''
  }, [])

  const current = items[active]

  return (
    <section ref={section} data-nav-theme="dark" className="relative h-[100svh] min-h-[680px] overflow-hidden bg-noir text-bone" aria-label="Introduction">
      <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_42%,rgba(122,27,34,0.5),transparent_72%),radial-gradient(35%_25%_at_50%_92%,rgba(201,163,92,0.10),transparent_70%)]" />

      {/* 3D ring of the actual pieces */}
      <motion.div
        ref={stage}
        style={{ opacity: stageOpacity }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={ready ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1.6, ease: EASE }}
        data-cursor="drag"
        data-cursor-label="Drag"
        className="absolute inset-0"
      >
        {gl ? (
          <ProductRing
            items={items}
            scroll={scroll}
            active={inView}
            onActive={setActive}
            onOpen={(i) => router.push(items[i].href)}
            setCursor={setCursor}
          />
        ) : gl === false ? (
          <div className="absolute inset-0 flex items-center justify-center gap-4 px-gutter">
            {items.slice(0, 3).map((it, i) => (
              <Link key={it.src} href={it.href} className={`relative aspect-[3/4] w-[26vw] max-w-[300px] overflow-hidden rounded-2xl ${i === 1 ? '' : 'hidden opacity-60 md:block'}`}>
                <Image src={it.src} alt={it.title} fill sizes="300px" className="object-cover" priority={i === 1} />
              </Link>
            ))}
          </div>
        ) : null}
      </motion.div>

      <motion.div style={{ y: textY, opacity: textOpacity }} className="container-wide pointer-events-none relative flex h-full flex-col justify-between pb-7 pt-[calc(var(--nav-h)+var(--announce-h)+1.25rem)] md:pb-10">
        {/* Headline */}
        <div className="text-center">
          <motion.p initial={{ opacity: 0, y: 14 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease: EASE }} className="flex items-center justify-center gap-3 text-eyebrow text-gold-light">
            <span className="h-px w-8 bg-gold" /> {homepage.heroEyebrow} <span className="h-px w-8 bg-gold" />
          </motion.p>
          <h1 className="mx-auto mt-4 text-[clamp(2.6rem,6.2vw,6.6rem)] leading-[0.88] tracking-[-0.035em] [text-shadow:0_10px_60px_rgba(13,10,9,0.7)]">
            <SplitReveal as="span" type="chars" intro delay={0.2} className="inline-block">
              {first}
            </SplitReveal>{' '}
            {second ? (
              <SplitReveal as="span" type="chars" intro delay={0.45} className="inline-block italic text-gold-light">
                {second}
              </SplitReveal>
            ) : null}
          </h1>
        </div>

        {/* CTAs + caption for the piece facing the viewer */}
        <div className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1.1, ease: EASE, delay: 0.85 }} className="pointer-events-auto">
            <p className="mb-5 hidden max-w-sm text-sm text-bone/60 md:block">{homepage.heroSubtitle}</p>
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href={homepage.primaryCtaHref || '/shop'} variant="light" size="lg" arrow magnetic>
                {homepage.primaryCtaLabel || 'Shop the collection'}
              </ButtonLink>
              {homepage.secondaryCtaLabel ? (
                <ButtonLink href={homepage.secondaryCtaHref || '/about'} variant="outline-light" size="lg" className="hidden sm:inline-flex">
                  {homepage.secondaryCtaLabel}
                </ButtonLink>
              ) : null}
            </div>
          </motion.div>

          {current ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1.1, ease: EASE, delay: 1 }} className="pointer-events-auto hidden w-80 md:mr-14 md:block md:text-right">
              <div className="flex items-center gap-3 md:justify-end">
                <span className="font-mono text-xs tabular-nums text-bone/50">
                  {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
                <span className="relative h-px w-24 overflow-hidden bg-bone/15">
                  <motion.span className="absolute inset-y-0 left-0 bg-gold" animate={{ width: `${((active + 1) / items.length) * 100}%` }} transition={{ duration: 0.8, ease: EASE }} />
                </span>
              </div>
              <div className="relative mt-3 h-[4.6rem] overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div key={active} initial={{ y: '100%' }} animate={{ y: '0%' }} exit={{ y: '-100%' }} transition={{ duration: 0.7, ease: EASE }} className="absolute inset-0">
                    <p className="text-eyebrow text-gold">{current.subtitle}</p>
                    <Link href={current.href} className="mt-1 block font-display text-[1.75rem] leading-[1] hover:text-gold-light">
                      {current.title}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </section>
  )
}
