'use client'

import type Lenis from 'lenis'

/** The single Lenis instance (set by SmoothScroll). Overlays use these helpers to lock scrolling. */
let instance: Lenis | null = null
let locks = 0

export function setLenis(l: Lenis | null) {
  instance = l
}

export function getLenis() {
  return instance
}

export function lockScroll() {
  locks += 1
  instance?.stop()
  document.documentElement.style.overflow = 'hidden'
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1)
  if (locks === 0) {
    instance?.start()
    document.documentElement.style.overflow = ''
  }
}

export function scrollToTop(immediate = true) {
  if (instance) instance.scrollTo(0, { immediate, force: true })
  else window.scrollTo(0, 0)
}

export function scrollToTarget(target: string | HTMLElement | number, offset = 0) {
  if (instance) instance.scrollTo(target, { offset, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView({ behavior: 'smooth' })
  }
}
