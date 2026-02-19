'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

/* ─── Material Transition Backgrounds ────────────────────────
   Four material-inspired gradient stages that crossfade as you scroll:
   1. Canvas Weave - Natural beige texture
   2. Silk Sheen - Luxurious gold shimmer
   3. Knit Pattern - Rich burgundy warmth
   4. Velvet Depth - Deep burgundy luxury
   ──────────────────────────────────────────────────────────── */

const materials = [
  {
    name: 'canvas',
    gradient: 'radial-gradient(circle at 30% 40%, #F5EFE0 0%, #E8DCC8 25%, #D4C4A8 50%, #BFA88E 100%)',
    start: '0%',
    end: '20%',
  },
  {
    name: 'silk',
    gradient: 'radial-gradient(ellipse at 60% 30%, #FAF0C8 0%, #F1E194 20%, #D4C47D 45%, #B8A76A 100%)',
    start: '20%',
    end: '40%',
  },
  {
    name: 'knit',
    gradient: 'radial-gradient(circle at 50% 60%, #8B2E35 0%, #7A1B22 30%, #5B0E14 60%, #3D0A0E 100%)',
    start: '40%',
    end: '60%',
  },
  {
    name: 'velvet',
    gradient: 'radial-gradient(ellipse at 40% 70%, #5B0E14 0%, #3D0A0E 35%, #2A0709 70%, #0F0A0B 100%)',
    start: '60%',
    end: '100%',
  },
]

export default function MaterialTransitions() {
  const containerRef = useRef<HTMLDivElement>(null)
  const layersRef = useRef<(HTMLDivElement | null)[]>([])
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return

    const layers = layersRef.current.filter(Boolean) as HTMLDivElement[]
    const scrollTriggers: ScrollTrigger[] = []

    // Set initial state: first layer visible, others hidden
    gsap.set(layers[0], { opacity: 1 })
    gsap.set(layers.slice(1), { opacity: 0 })

    // Create crossfade animations for each transition
    materials.forEach((material, i) => {
      if (i === materials.length - 1) return // Skip last one (no transition after)

      const currentLayer = layers[i]
      const nextLayer = layers[i + 1]
      if (!currentLayer || !nextLayer) return

      // Crossfade from current to next
      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: `top+=${material.end}`,
        end: `top+=${materials[i + 1].end}`,
        scrub: 1.5,
        onUpdate: (self) => {
          const progress = self.progress
          gsap.to(currentLayer, { opacity: 1 - progress, duration: 0.1 })
          gsap.to(nextLayer, { opacity: progress, duration: 0.1 })
        },
      })

      scrollTriggers.push(st)
    })

    return () => {
      scrollTriggers.forEach((st) => st.kill())
    }
  }, [reducedMotion])

  // If reduced motion, just show canvas (first material)
  if (reducedMotion) {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{ background: materials[0].gradient }}
      />
    )
  }

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10">
      {materials.map((material, i) => (
        <div
          key={material.name}
          ref={(el) => { layersRef.current[i] = el }}
          className="absolute inset-0 transition-opacity"
          style={{
            background: material.gradient,
            opacity: i === 0 ? 1 : 0,
          }}
        />
      ))}
    </div>
  )
}
