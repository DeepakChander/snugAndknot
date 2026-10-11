'use client'

import { useRef } from 'react'
import Image, { type ImageProps } from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { cn } from '@/lib/format'

type Props = Omit<ImageProps, 'fill'> & {
  className?: string
  imgClassName?: string
  /** How far in (percent) the rounded window starts. */
  inset?: number
  radius?: string
  parallax?: number
}

/**
 * Editorial image that opens from a rounded window to full bleed as it scrolls in,
 * while the photograph inside settles from a slight zoom.
 */
export default function UnmaskImage({ className, imgClassName, inset = 10, radius = '2.25rem', parallax = 8, alt, ...img }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const open = useTransform(scrollYProgress, [0, 0.45], [inset, 0], { clamp: true })
  const clipPath = useTransform(open, (v) => `inset(${v}% ${v * 0.8}% ${v}% ${v * 0.8}% round ${radius})`)
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.28, 1.04])
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`])

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div className="absolute inset-0 overflow-hidden" style={reduce ? undefined : { clipPath }}>
        <motion.div className="absolute inset-[-10%]" style={reduce ? undefined : { scale, y }}>
          <Image alt={alt} fill className={cn('object-cover', imgClassName)} {...img} />
        </motion.div>
      </motion.div>
    </div>
  )
}
