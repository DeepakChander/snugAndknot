'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { cn } from '@/lib/format'

/**
 * Three photographs of the pieces laid out like a fanned hand of cards. Flat on purpose: the 3D
 * lives in the home hero only. They open a little wider on hover.
 */
export default function FanDeck({ images, className }: { images: { src: string; alt: string }[]; className?: string }) {
  const cards = images.slice(0, 3)
  const rotations = cards.length === 3 ? [-9, 0, 9] : cards.length === 2 ? [-6, 6] : [0]
  const offsets = cards.length === 3 ? [-1, 0, 1] : cards.length === 2 ? [-0.5, 0.5] : [0]

  return (
    <div className={cn('group relative', className)} aria-hidden>
      {cards.map((img, i) => {
        const center = offsets[i] === 0
        return (
          <div
            key={img.src}
            style={{ zIndex: center ? 3 : i, ['--x' as string]: `${offsets[i] * 26}%`, ['--x-open' as string]: `${offsets[i] * 36}%`, ['--r' as string]: `${rotations[i]}deg` }}
            className="absolute inset-y-0 left-1/2 aspect-[3/4] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] [transform:translateX(calc(-50%_+_var(--x)))_rotate(var(--r))] group-hover:[transform:translateX(calc(-50%_+_var(--x-open)))_rotate(var(--r))]"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.08 }}
              className="relative h-full w-full overflow-hidden rounded-[1.25rem] bg-parchment shadow-[0_30px_60px_-35px_rgba(22,16,14,0.5)] ring-1 ring-ink/5"
            >
              <Image src={img.src} alt="" fill sizes="22vw" className="object-cover" priority={center} />
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
