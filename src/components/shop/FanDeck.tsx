'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/format'

/**
 * Three photographs of the pieces fanned like a hand of cards in 3D. They spread on hover
 * and the whole deck tilts toward the pointer.
 */
export default function FanDeck({ images, className }: { images: { src: string; alt: string }[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const spread = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 18 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 18 })
  const s = useSpring(spread, { stiffness: 140, damping: 20 })
  const cards = images.slice(0, 3)
  const rotations = cards.length === 3 ? [-11, 0, 11] : cards.length === 2 ? [-7, 7] : [0]
  const offsets = cards.length === 3 ? [-1, 0, 1] : cards.length === 2 ? [-0.5, 0.5] : [0]

  return (
    <div
      ref={ref}
      className={cn('relative [perspective:1200px]', className)}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onPointerEnter={() => spread.set(1)}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
        spread.set(0)
      }}
      aria-hidden
    >
      <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative h-full w-full [transform-style:preserve-3d]">
        {cards.map((img, i) => (
          <FanCard key={img.src} src={img.src} index={i} rotation={rotations[i]} offset={offsets[i]} spread={s} center={offsets[i] === 0} />
        ))}
      </motion.div>
    </div>
  )
}

function FanCard({ src, index, rotation, offset, spread, center }: { src: string; index: number; rotation: number; offset: number; spread: ReturnType<typeof useSpring>; center: boolean }) {
  const x = useTransform(spread, [0, 1], [`${offset * 26}%`, `${offset * 44}%`])
  const rot = useTransform(spread, [0, 1], [rotation, rotation * 1.5])
  const z = useTransform(spread, [0, 1], [center ? 40 : 0, center ? 90 : 20])
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 + index * 0.1 }}
      style={{ x, rotate: rot, z, zIndex: center ? 3 : index }}
      className="absolute inset-y-0 left-1/2 aspect-[3/4] -translate-x-1/2 overflow-hidden rounded-[1.25rem] bg-parchment shadow-[0_40px_70px_-35px_rgba(22,16,14,0.55)] ring-1 ring-ink/5"
    >
      <Image src={src} alt="" fill sizes="22vw" className="object-cover" priority={center} />
    </motion.div>
  )
}
