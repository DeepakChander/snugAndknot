'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, isTouch, prefersReducedMotion } from '@/lib/motion/gsap'

/**
 * Dot + trailing ring. Elements opt into states with data attributes:
 *   data-cursor="hover" | "view" | "drag" | "hidden"   and   data-cursor-label="Shop"
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return
    document.documentElement.classList.add('has-cursor')
    const d = dot.current
    const r = ring.current
    gsap.set([d, r], { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2, opacity: 0 })
    const dx = gsap.quickTo(d, 'x', { duration: 0.08, ease: 'power3' })
    const dy = gsap.quickTo(d, 'y', { duration: 0.08, ease: 'power3' })
    const rx = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3' })
    const ry = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3' })
    let state = ''

    const apply = (variant: string, label: string) => {
      const key = `${variant}|${label}`
      if (key === state) return
      state = key
      r.dataset.variant = variant
      d.dataset.variant = variant
      if (labelRef.current) labelRef.current.textContent = label
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      gsap.to([d, r], { opacity: 1, duration: 0.3, overwrite: 'auto' })
    }
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (!t?.closest) return
      const host = t.closest<HTMLElement>('[data-cursor]')
      if (t.closest('input, textarea, select, [contenteditable="true"]')) return apply('text', '')
      if (host) return apply(host.dataset.cursor ?? 'hover', host.dataset.cursorLabel ?? '')
      if (t.closest('a, button, [role="button"], label, summary')) return apply('hover', '')
      apply('default', '')
    }
    const leave = () => gsap.to([d, r], { opacity: 0, duration: 0.3 })
    const down = () => gsap.to(r, { scale: 0.85, duration: 0.2 })
    const up = () => gsap.to(r, { scale: 1, duration: 0.4, ease: 'elastic.out(1,0.5)' })

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div data-chrome aria-hidden>
      <style>{`
        .sk-ring{width:38px;height:38px;border:1px solid rgba(248,243,234,.9);mix-blend-mode:difference;transition:width .5s cubic-bezier(.16,1,.3,1),height .5s cubic-bezier(.16,1,.3,1),background-color .4s,border-color .4s,opacity .3s}
        .sk-ring[data-variant=hover]{width:64px;height:64px;background:rgba(248,243,234,.95);border-color:transparent}
        .sk-ring[data-variant=view],.sk-ring[data-variant=drag]{width:96px;height:96px;background:var(--color-gold);border-color:transparent;mix-blend-mode:normal}
        .sk-ring[data-variant=hidden],.sk-ring[data-variant=text]{width:4px;height:4px;opacity:0!important}
        .sk-ring .sk-label{opacity:0;transform:scale(.6);transition:opacity .3s,transform .5s cubic-bezier(.16,1,.3,1)}
        .sk-ring[data-variant=view] .sk-label,.sk-ring[data-variant=drag] .sk-label{opacity:1;transform:scale(1)}
        .sk-dot{width:6px;height:6px;background:#f8f3ea;mix-blend-mode:difference;transition:transform .3s,opacity .3s}
        .sk-dot[data-variant=hover],.sk-dot[data-variant=view],.sk-dot[data-variant=drag],.sk-dot[data-variant=hidden]{transform:scale(0)}
        .sk-dot[data-variant=text]{width:2px;height:22px;border-radius:2px}
      `}</style>
      <div ref={ring} className="sk-ring pointer-events-none fixed left-0 top-0 z-[250] flex items-center justify-center rounded-full">
        <span ref={labelRef} className="sk-label font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink" />
      </div>
      <div ref={dot} className="sk-dot pointer-events-none fixed left-0 top-0 z-[251] rounded-full" />
    </div>
  )
}
