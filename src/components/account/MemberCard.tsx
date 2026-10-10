'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import Wordmark from '@/components/chrome/Wordmark'
import { TIER_LABEL, TIERS } from '@/lib/format'
import type { PublicUser } from '@/types/commerce'

/** A membership card that tilts in 3D under the pointer, with a light sheen that follows it. */
export default function MemberCard({ user }: { user: PublicUser }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const rx = useSpring(useTransform(my, [0, 1], [12, -12]), { stiffness: 160, damping: 18 })
  const ry = useSpring(useTransform(mx, [0, 1], [-16, 16]), { stiffness: 160, damping: 18 })
  const glare = useTransform([mx, my] as const, ([x, y]: number[]) => `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,240,210,.45), transparent 45%)`)

  const idx = TIERS.findIndex((t) => t.id === user.tier)
  const next = TIERS[idx + 1]
  const progress = next ? Math.min(1, (user.points - TIERS[idx].min) / (next.min - TIERS[idx].min)) : 1

  return (
    <div className="[perspective:1200px]">
      <motion.div
        ref={ref}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect()
          mx.set((e.clientX - r.left) / r.width)
          my.set((e.clientY - r.top) / r.height)
        }}
        onPointerLeave={() => {
          mx.set(0.5)
          my.set(0.5)
        }}
        style={{ rotateX: rx, rotateY: ry }}
        className="relative aspect-[1.6/1] w-full max-w-md overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#221915_0%,#3d0a0e_55%,#16100e_100%)] p-6 text-bone shadow-[0_40px_80px_-40px_rgba(22,16,14,0.8)] [transform-style:preserve-3d] md:p-8"
      >
        <div className="knit-texture pointer-events-none absolute inset-0 text-bone opacity-30" />
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: glare }} />
        <div className="relative flex h-full flex-col justify-between" style={{ transform: 'translateZ(40px)' }}>
          <div className="flex items-start justify-between">
            <Wordmark className="text-2xl" />
            <span className="rounded-full border border-gold/40 px-3 py-1 text-eyebrow text-gold-light">{TIER_LABEL[user.tier]}</span>
          </div>
          <div>
            <p className="font-display text-5xl leading-none md:text-6xl">{user.points.toLocaleString()}</p>
            <p className="mt-1 text-eyebrow text-bone/60">points</p>
          </div>
          <div>
            <div className="h-1 overflow-hidden rounded-full bg-bone/15">
              <motion.div className="h-full rounded-full bg-gold" initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-bone/60">
              <span>{user.name}</span>
              <span>{next ? `${(next.min - user.points).toLocaleString()} to ${next.name}` : 'Highest tier'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
