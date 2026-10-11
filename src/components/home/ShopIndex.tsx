'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { gsap, useGSAP, isTouch, prefersReducedMotion } from '@/lib/motion/gsap'
import SplitReveal from '@/components/motion/SplitReveal'
import { Arrow } from '@/components/kit/Button'
import { cn } from '@/lib/format'

export interface IndexRow {
  label: string
  href: string
  meta: string
  image: string
}

/**
 * "Shop by" as an editorial index. Hovering a row dims the rest and floats a photograph of
 * that department beside the cursor; it trails on a curve and tilts with the pointer's speed.
 */
export default function ShopIndex({ rows }: { rows: IndexRow[] }) {
  const root = useRef<HTMLElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)

  useGSAP(
    () => {
      const el = preview.current
      const list = root.current?.querySelector<HTMLElement>('[data-list]')
      if (!el || !list || isTouch() || prefersReducedMotion()) return
      const moveX = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' })
      const moveY = gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' })
      const tilt = gsap.quickTo(el, 'rotation', { duration: 0.6, ease: 'power3.out' })
      let lastX = 0
      const onMove = (e: PointerEvent) => {
        moveX(e.clientX + 28)
        moveY(e.clientY - el.offsetHeight * 0.55)
        tilt(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.35))
        lastX = e.clientX
      }
      const onEnter = (e: PointerEvent) => {
        gsap.set(el, { x: e.clientX + 28, y: e.clientY - el.offsetHeight * 0.55 })
        gsap.to(el, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out' })
      }
      const onLeave = () => gsap.to(el, { autoAlpha: 0, scale: 0.85, duration: 0.4, ease: 'power2.in' })
      list.addEventListener('pointermove', onMove)
      list.addEventListener('pointerenter', onEnter)
      list.addEventListener('pointerleave', onLeave)
      return () => {
        list.removeEventListener('pointermove', onMove)
        list.removeEventListener('pointerenter', onEnter)
        list.removeEventListener('pointerleave', onLeave)
      }
    },
    { scope: root }
  )

  return (
    <section ref={root} data-nav-theme="dark" aria-labelledby="shop-index-title" className="relative bg-ink py-[clamp(5rem,10vw,9rem)] text-bone">
      <div className="container-wide grid gap-6 pb-[clamp(2.5rem,5vw,4rem)] md:grid-cols-12">
        <p className="text-eyebrow slash text-butter md:col-span-4">Shop by</p>
        <SplitReveal as="h2" id="shop-index-title" className="text-headline md:col-span-8">
          Find your <em>knit</em> — by who it&apos;s for, or what it is.
        </SplitReveal>
      </div>

      <ul data-list className="container-wide border-t border-bone/15">
        {rows.map((row, i) => (
          <li key={row.href} className="border-b border-bone/15">
            <Link
              href={row.href}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              data-cursor="hover"
              className={cn(
                'group grid grid-cols-[3ch_1fr_auto] items-center gap-4 py-4 transition-[opacity,padding] duration-500 md:grid-cols-[6ch_1fr_auto_auto] md:gap-8 md:py-5',
                hovered !== null && hovered !== i && 'opacity-35',
                hovered === i && 'md:pl-4'
              )}
            >
              <span className="font-mono text-xs tabular-nums text-bone/50">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[clamp(2.6rem,8.4vw,8.6rem)] font-semibold uppercase leading-[0.86] tracking-[-0.055em]">
                {row.label}
              </span>
              <span className="hidden text-label text-bone/60 md:block">{row.meta}</span>
              <span className="flex items-center gap-3">
                <span className="relative h-14 w-11 overflow-hidden rounded-lg bg-umber md:hidden">
                  <Image src={row.image} alt="" fill sizes="44px" className="object-cover" />
                </span>
                <span className="hidden h-12 w-12 items-center justify-center rounded-full border border-bone/25 transition-colors duration-500 group-hover:border-signal group-hover:bg-signal md:flex">
                  <Arrow className="h-4 w-4" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Floating preview (desktop pointers only) */}
      <div ref={preview} aria-hidden className="pointer-events-none invisible fixed left-0 top-0 z-[60] hidden aspect-[4/5] w-[min(22vw,320px)] scale-[0.85] opacity-0 md:block">
        <div className="relative h-full w-full overflow-hidden rounded-[1.25rem] bg-umber shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
          {rows.map((row, i) => (
            <div
              key={row.href}
              className="absolute inset-0 transition-[clip-path,transform] duration-700 ease-[cubic-bezier(.16,1,.3,1)]"
              style={{
                clipPath: hovered === i ? 'inset(0% 0% 0% 0%)' : 'inset(50% 50% 50% 50%)',
                transform: hovered === i ? 'scale(1)' : 'scale(1.15)',
              }}
            >
              <Image src={row.image} alt="" fill sizes="320px" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
