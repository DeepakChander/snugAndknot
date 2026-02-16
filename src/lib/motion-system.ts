/**
 * SNUG & KNOT — MOTION DESIGN SYSTEM
 *
 * Single source of truth for motion timing and easing.
 * Brand metaphor: WOVEN CLOTH under controlled tension.
 *
 * Core rules:
 *   1. NOTHING SNAPS — every state change has a transition.
 *   2. NOTHING BOUNCES — textiles settle, they don't bounce.
 *   3. LARGE THINGS MOVE SLOWLY, small things move quickly.
 *   4. REDUCED MOTION IS FIRST-CLASS.
 */


// ================================================================
// EASING LIBRARY — Seven named textile-metaphor curves
// ================================================================

/** YARN PULL — Signature curve. Slow start, fast middle, gentle settle. */
export const EASE_YARN_PULL: [number, number, number, number] = [0.22, 0.68, 0.36, 1.0]
export const EASE_YARN_PULL_CSS = 'cubic-bezier(0.22, 0.68, 0.36, 1.0)'
export const EASE_YARN_PULL_GSAP = 'M0,0 C0.22,0.68 0.36,1 1,1'

/** LOOM SETTLE — For exits and elements coming to rest. Sharper deceleration. */
export const EASE_LOOM_SETTLE: [number, number, number, number] = [0.16, 1.0, 0.3, 1.0]
export const EASE_LOOM_SETTLE_CSS = 'cubic-bezier(0.16, 1.0, 0.3, 1.0)'
export const EASE_LOOM_SETTLE_GSAP = 'expo.out'

/** WARP TENSION — For bidirectional transitions. Symmetric curve. */
export const EASE_WARP_TENSION: [number, number, number, number] = [0.76, 0.0, 0.24, 1.0]
export const EASE_WARP_TENSION_CSS = 'cubic-bezier(0.76, 0.0, 0.24, 1.0)'
export const EASE_WARP_TENSION_GSAP = 'quart.inOut'

/** NEEDLE THREAD — For small, precise movements. Quick and deliberate. */
export const EASE_NEEDLE_THREAD: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0]
export const EASE_NEEDLE_THREAD_CSS = 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
export const EASE_NEEDLE_THREAD_GSAP = 'power1.out'

/** FIBER DRIFT — For continuous, ambient motion. Nearly linear with subtle wobble. */
export const EASE_FIBER_DRIFT: [number, number, number, number] = [0.45, 0.05, 0.55, 0.95]
export const EASE_FIBER_DRIFT_CSS = 'cubic-bezier(0.45, 0.05, 0.55, 0.95)'
export const EASE_FIBER_DRIFT_GSAP = 'sine.inOut'

/** SELVAGE SNAP — For spring-back / magnetic effects. Slight overshoot. */
export const EASE_SELVAGE_SNAP: [number, number, number, number] = [0.34, 1.56, 0.64, 1.0]
export const EASE_SELVAGE_SNAP_CSS = 'cubic-bezier(0.34, 1.56, 0.64, 1.0)'
export const EASE_SELVAGE_SNAP_GSAP = 'back.out(1.7)'

/** WEFT WHISPER — For fade-only transitions. Extremely gentle. */
export const EASE_WEFT_WHISPER: [number, number, number, number] = [0.4, 0.0, 0.2, 1.0]
export const EASE_WEFT_WHISPER_CSS = 'cubic-bezier(0.4, 0.0, 0.2, 1.0)'
export const EASE_WEFT_WHISPER_GSAP = 'power2.out'


// ================================================================
// DURATION SCALE
// ================================================================

export const DURATION = {
  /** 120ms — micro: dot indicators, checkbox ticks, icon swaps */
  micro: 0.12,
  /** 200ms — swift: button color changes, link underlines */
  swift: 0.2,
  /** 350ms — brisk: small element entrances, tooltip show, dropdown */
  brisk: 0.35,
  /** 550ms — measured: card entrances, image reveals, drawer open */
  measured: 0.55,
  /** 800ms — deliberate: heading reveals, section entrances */
  deliberate: 0.8,
  /** 1100ms — grand: hero entrance, page transitions, full-bleed reveals */
  grand: 1.1,
  /** 1500ms — ceremony: preloader exit, initial page load sequence */
  ceremony: 1.5,
} as const


// ================================================================
// PAGE TRANSITION VARIANTS (Framer Motion)
// ================================================================

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.brisk + 0.1,
      ease: EASE_YARN_PULL,
      delay: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: DURATION.brisk,
      ease: EASE_WARP_TENSION,
    },
  },
}


// ================================================================
// TENSION THREAD SCROLL INDICATOR
// ================================================================

export const TENSION_THREAD = {
  position: 'fixed right-0 top-0 bottom-0',
  width: 48,
  strokeWidth: 1.5,
  bowAtRest: 40,
  bowAtEnd: 0,
  sway: {
    amplitude: 2,
    duration: 6,
    ease: EASE_FIBER_DRIFT_GSAP,
  },
  pluck: {
    cycles: 3,
    amplitude: 2,
    duration: 0.4,
    ease: 'sine.out',
  },
  color: {
    start: 'rgba(241, 225, 148, 0.3)',
    mid: 'rgba(241, 225, 148, 0.6)',
    end: 'rgba(241, 225, 148, 1.0)',
  },
} as const


// ================================================================
// REDUCED MOTION UTILITIES
// ================================================================

export const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
  exit: { opacity: 0, transition: { duration: 0.01 } },
}
