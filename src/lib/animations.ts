// GSAP animation configurations
export const EASE = {
  outExpo: 'expo.out',
  outQuart: 'quart.out',
  inOutQuart: 'quart.inOut',
  outCubic: 'cubic.out',
  inOutCubic: 'cubic.inOut',
} as const

export const DURATION = {
  fast: 0.3,
  normal: 0.6,
  slow: 0.9,
  xslow: 1.2,
  reveal: 1.5,
} as const

export const STAGGER = {
  fast: 0.05,
  normal: 0.08,
  slow: 0.12,
} as const

// Easing curves
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]

// Framer Motion variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
}

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeOutExpo } },
}

const easeInOutQuart: [number, number, number, number] = [0.76, 0, 0.24, 1]

export const slideInRight = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { duration: 0.5, ease: easeOutExpo } },
  exit: { x: '100%', transition: { duration: 0.4, ease: easeInOutQuart } },
}

export const slideInLeft = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.5, ease: easeOutExpo } },
  exit: { x: '-100%', transition: { duration: 0.4, ease: easeInOutQuart } },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
}

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOutExpo } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
}
