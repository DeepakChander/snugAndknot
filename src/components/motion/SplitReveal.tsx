'use client'

import { createElement, useRef, type ElementType, type ComponentPropsWithoutRef } from 'react'
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion, whenPageReady } from '@/lib/motion/gsap'
import { cn } from '@/lib/format'

type Props<T extends ElementType> = {
  as?: T
  /** lines: masked lines rise · words: word-by-word · chars: letter-by-letter drum roll */
  type?: 'lines' | 'words' | 'chars'
  /** Play once the preloader / page transition has cleared instead of on scroll. */
  intro?: boolean
  delay?: number
  stagger?: number
  start?: string
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

/**
 * Masked text reveal. Lines (or words / letters) rise out of a clipping mask.
 * Re-splits responsively; respects prefers-reduced-motion.
 */
export default function SplitReveal<T extends ElementType = 'div'>({
  as,
  type = 'lines',
  intro = false,
  delay = 0,
  stagger,
  start = 'top 88%',
  className,
  children,
  ...rest
}: Props<T>) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (prefersReducedMotion()) {
        el.classList.remove('split-pending')
        return
      }
      let played = false
      let trigger: ScrollTrigger | undefined
      let unsub = () => {}

      const split = SplitText.create(el, {
        type: type === 'chars' ? 'lines,chars' : type === 'words' ? 'lines,words' : 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          const targets = type === 'chars' ? self.chars : type === 'words' ? self.words : self.lines
          el.classList.remove('split-pending')
          trigger?.kill()
          unsub()
          if (played) {
            gsap.set(targets, { yPercent: 0, rotate: 0 })
            return
          }
          gsap.set(targets, { yPercent: 118, rotate: type === 'lines' ? 2.5 : 0 })
          const tween = gsap.to(targets, {
            yPercent: 0,
            rotate: 0,
            duration: type === 'chars' ? 1.1 : 1.35,
            ease: 'expo.out',
            stagger: stagger ?? (type === 'chars' ? 0.022 : type === 'words' ? 0.045 : 0.1),
            delay,
            paused: true,
            onStart: () => {
              played = true
            },
          })
          if (intro) unsub = whenPageReady(() => tween.play())
          else trigger = ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => tween.play() })
          return tween
        },
      })

      return () => {
        unsub()
        trigger?.kill()
        split.revert()
      }
    },
    { scope: ref }
  )

  return createElement(Tag, { ref, className: cn('split-pending', className), ...rest }, children)
}
