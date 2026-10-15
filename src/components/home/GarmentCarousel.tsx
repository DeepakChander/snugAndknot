'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ProductPrice } from '@/components/kit/Price'
import { ArrowLeft, ArrowRight } from '@/components/kit/icons'
import { prefersReducedMotion } from '@/lib/motion/gsap'
import type { Product } from '@/types/commerce'

export interface CarouselItem {
  key: string
  src: string
  alt: string
  product: Pick<Product, 'id' | 'handle' | 'title' | 'productType' | 'price' | 'compareAtPrice' | 'prices'>
}

const AUTO_SPEED = 7 // degrees per second when nobody is touching it
const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The hero's one 3D moment: the real pieces standing on a slowly turning carousel. The piece facing
 * you is in full light with its name and price underneath; the others recede. Drag to turn it, use
 * the arrows (or the keyboard), or tap a piece to open it. It stops turning while off screen, while
 * hovered, and entirely with reduced motion.
 */
export default function GarmentCarousel({ items }: { items: CarouselItem[] }) {
  const stage = useRef<HTMLDivElement>(null)
  const cards = useRef<(HTMLAnchorElement | null)[]>([])
  const angle = useRef(0)
  const target = useRef<number | null>(null)
  const velocity = useRef(0)
  const hovering = useRef(false)
  const visible = useRef(true)
  const drag = useRef<{ x: number; moved: number; at: number } | null>(null)
  const idleUntil = useRef(0)
  const [front, setFront] = useState(0)
  const n = items.length
  const step = 360 / n

  // Places every card on the ring for the current angle; dims and recedes the ones turned away.
  const layout = useCallback(() => {
    const el = stage.current
    if (!el) return
    const w = el.clientWidth
    const cardW = Math.min(240, Math.max(150, w * 0.34))
    const radius = (cardW * n) / (2 * Math.PI) / 0.9
    let best = 0
    let bestDepth = -2
    cards.current.forEach((card, i) => {
      if (!card) return
      const theta = i * step + angle.current
      const rad = (theta * Math.PI) / 180
      const depth = Math.cos(rad)
      card.style.width = `${cardW}px`
      card.style.transform = `translate(-50%, -50%) rotateY(${theta}deg) translateZ(${radius}px)`
      card.style.opacity = String(0.18 + 0.82 * Math.pow((depth + 1) / 2, 1.6))
      card.style.zIndex = String(Math.round(depth * 100) + 100)
      card.style.pointerEvents = depth > 0.2 ? 'auto' : 'none'
      if (depth > bestDepth) {
        bestDepth = depth
        best = i
      }
    })
    setFront((f) => (f === best ? f : best))
  }, [n, step])

  // The turning: a little auto-rotation, drag inertia, and easing to a target when an arrow is used.
  useEffect(() => {
    const reduced = prefersReducedMotion()
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (visible.current) {
        if (target.current !== null) {
          const diff = target.current - angle.current
          angle.current += reduced ? diff : diff * Math.min(1, dt * 7)
          if (Math.abs(diff) < 0.05) target.current = null
        } else if (!drag.current) {
          angle.current += velocity.current * dt
          velocity.current *= Math.pow(0.04, dt)
          if (!reduced && !hovering.current && now > idleUntil.current && Math.abs(velocity.current) < 2) angle.current -= AUTO_SPEED * dt
        }
        layout()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0 })
    if (stage.current) io.observe(stage.current)
    const onResize = () => layout()
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [layout])

  // Brings piece `i` round to the front, the short way.
  const turnTo = useCallback(
    (i: number) => {
      const wanted = -i * step
      const current = angle.current
      const diff = ((((wanted - current) % 360) + 540) % 360) - 180
      target.current = current + diff
      idleUntil.current = performance.now() + 4000
    },
    [step]
  )
  const next = () => turnTo((front + 1) % n)
  const prev = () => turnTo((front - 1 + n) % n)

  const current = items[front]?.product

  return (
    <div className="relative">
      <div
        ref={stage}
        className="relative h-[clamp(340px,48vw,560px)] touch-pan-y select-none [perspective:1600px]"
        onPointerEnter={(e) => e.pointerType === 'mouse' && (hovering.current = true)}
        onPointerLeave={() => (hovering.current = false)}
        onPointerDown={(e) => {
          drag.current = { x: e.clientX, moved: 0, at: performance.now() }
          target.current = null
          velocity.current = 0
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d) return
          const dx = e.clientX - d.x
          const dt = Math.max(1, performance.now() - d.at) / 1000
          d.moved += Math.abs(dx)
          d.x = e.clientX
          d.at = performance.now()
          angle.current += dx * 0.3
          velocity.current = (dx * 0.3) / dt
        }}
        onPointerUp={() => {
          idleUntil.current = performance.now() + 3000
          // A drag released over a card must not also open it; the click handler reads `moved`.
          setTimeout(() => (drag.current = null), 0)
        }}
        onPointerCancel={() => (drag.current = null)}
        aria-hidden
      >
        {/* A soft floor under the pieces, so they stand somewhere. */}
        <div className="absolute inset-x-[12%] bottom-[4%] h-[14%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(22,21,19,0.16),transparent)] blur-md" />
        <div className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(-4deg)]">
          {items.map((it, i) => (
            <Link
              key={it.key}
              ref={(el) => {
                cards.current[i] = el
              }}
              href={`/product/${it.product.handle}`}
              tabIndex={-1}
              draggable={false}
              onClick={(e) => {
                if ((drag.current?.moved ?? 0) > 6) e.preventDefault()
              }}
              className="absolute left-1/2 top-1/2 block aspect-[3/4] overflow-hidden rounded-[1.1rem] bg-parchment shadow-[0_30px_60px_-30px_rgba(22,16,14,0.55)] ring-1 ring-ink/5 [backface-visibility:hidden] will-change-transform"
            >
              <Image src={it.src} alt="" fill sizes="240px" draggable={false} priority={i < 3} className="object-cover" />
            </Link>
          ))}
        </div>
      </div>

      {/* The piece facing you: what it is and what it costs, with arrows to turn the carousel. */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <button type="button" onClick={prev} aria-label="Previous piece" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-colors hover:border-ink hover:bg-ink hover:text-bone">
          <ArrowLeft size={16} />
        </button>
        <div className="relative h-[3.25rem] min-w-0 flex-1 overflow-hidden text-center sm:max-w-xs" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            {current ? (
              <motion.div key={items[front].key} initial={{ y: '100%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="absolute inset-0">
                <Link href={`/product/${current.handle}`} className="block truncate text-[0.98rem] font-medium hover:text-burgundy">
                  {current.title}
                </Link>
                <span className="mt-0.5 flex items-center justify-center gap-2 text-xs text-stone">
                  <span>{current.productType}</span>
                  <span aria-hidden>·</span>
                  <ProductPrice product={current} showCompareAt={false} className="text-xs" />
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <button type="button" onClick={next} aria-label="Next piece" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/15 transition-colors hover:border-ink hover:bg-ink hover:text-bone">
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
