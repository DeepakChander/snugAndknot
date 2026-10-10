'use client'

import { useRef } from 'react'
import { gsap, useGSAP, isTouch, prefersReducedMotion } from '@/lib/motion/gsap'
import { cn } from '@/lib/format'

/** Pulls its child toward the pointer with an elastic settle; the child's content lags for depth. */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const el = ref.current
      if (!el || isTouch() || prefersReducedMotion()) return
      const inner = el.firstElementChild as HTMLElement | null
      const ease = 'elastic.out(1, 0.4)'
      const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease })
      const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.9, ease }) : null
      const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.9, ease }) : null
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const x = e.clientX - (r.left + r.width / 2)
        const y = e.clientY - (r.top + r.height / 2)
        xTo(x * strength)
        yTo(y * strength)
        ixTo?.(x * strength * 0.35)
        iyTo?.(y * strength * 0.35)
      }
      const leave = () => {
        xTo(0)
        yTo(0)
        ixTo?.(0)
        iyTo?.(0)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    },
    { scope: ref }
  )
  return (
    <div ref={ref} className={cn('inline-block will-change-transform', className)}>
      {children}
    </div>
  )
}
