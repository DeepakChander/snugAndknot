'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase, useGSAP)
  gsap.defaults({ ease: 'expo.out', duration: 1.2 })
  // "Silk" — slow start, long glide: the house curve for big reveals.
  CustomEase.create('silk', '0.19, 1, 0.22, 1')
  CustomEase.create('curtain', '0.87, 0, 0.13, 1')
  ScrollTrigger.config({ ignoreMobileResize: true })
  // A reload opens at the top, so scroll-driven intros start from their first frame: the entry is
  // marked 'manual' as the page unloads (the browser decides whether to restore before any script on
  // the next page runs). Once a page is shown, 'auto' goes back, through ScrollTrigger, which otherwise
  // re-applies the mode it found at registration, so Back and Forward keep their scroll position.
  window.addEventListener('pagehide', () => {
    history.scrollRestoration = 'manual'
  })
  window.addEventListener('pageshow', () => ScrollTrigger.clearScrollMemory('auto'))
  if (document.readyState === 'complete') ScrollTrigger.clearScrollMemory('auto')
}

export { gsap, ScrollTrigger, SplitText, useGSAP }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches

/* ─────────────── Page-ready signal ───────────────
   Intro animations wait until the preloader or page transition has cleared,
   so nothing animates behind a curtain. */

let ready = false
const subscribers = new Set<() => void>()

export function whenPageReady(cb: () => void): () => void {
  if (ready) {
    cb()
    return () => {}
  }
  subscribers.add(cb)
  return () => subscribers.delete(cb)
}

export function setPageReady(value: boolean) {
  ready = value
  if (value) {
    const pending = [...subscribers]
    subscribers.clear()
    pending.forEach((fn) => fn())
  }
}

export function isPageReady() {
  return ready
}
