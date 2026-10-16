'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'

export const EASE_EXPO = [0.16, 1, 0.3, 1] as const
export const EASE_SILK = [0.19, 1, 0.22, 1] as const
export const EASE_CURTAIN = [0.87, 0, 0.13, 1] as const

type Props = HTMLMotionProps<'div'> & {
  delay?: number
  y?: number
  x?: number
  scale?: number
  blur?: boolean
  once?: boolean
  amount?: number
}

/** Fades and rises into place the first time it scrolls into view. */
export default function Reveal({ delay = 0, y = 16, x = 0, scale = 1, blur = false, once = true, amount = 0.2, children, ...rest }: Props) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, x, scale, filter: blur ? 'blur(12px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{ duration: reduce ? 0.3 : 0.6, ease: EASE_EXPO, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Container whose direct <RevealItem> children cascade in. */
export function RevealGroup({ stagger = 0.08, delay = 0, children, ...rest }: HTMLMotionProps<'div'> & { stagger?: number; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ y = 16, children, ...rest }: HTMLMotionProps<'div'> & { y?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EXPO } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
