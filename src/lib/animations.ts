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
