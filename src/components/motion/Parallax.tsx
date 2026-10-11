'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type HTMLMotionProps } from 'motion/react'

/** Moves its children against the scroll by `speed` (fraction of viewport). Negative = opposite direction. */
export default function Parallax({ speed = 0.15, children, style, ...rest }: HTMLMotionProps<'div'> & { speed?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}vh`, `${-speed * 100}vh`])
  return (
    <motion.div ref={ref} style={reduce ? style : { ...style, y }} {...rest}>
      {children}
    </motion.div>
  )
}
