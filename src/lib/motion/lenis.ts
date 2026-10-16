'use client'

/** Scroll helpers for overlays: lock the page behind a dialog, jump or glide to a point. */
let locks = 0

export function lockScroll() {
  locks += 1
  document.documentElement.style.overflow = 'hidden'
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1)
  if (locks === 0) document.documentElement.style.overflow = ''
}

export function scrollToTop(immediate = true) {
  window.scrollTo({ top: 0, behavior: immediate ? 'auto' : 'smooth' })
}

export function scrollToTarget(target: string | HTMLElement | number, offset = 0) {
  if (typeof target === 'number') {
    window.scrollTo({ top: target + offset, behavior: 'smooth' })
    return
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' })
}
