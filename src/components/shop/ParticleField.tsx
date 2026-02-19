'use client'

import { useRef, useEffect } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/* ─── Canvas 2D Particle Field ──────────────────────────────
   Gold particles floating in ambient space - 2D canvas version
   for background ambience on shop page. Lighter weight than 3D.
   ──────────────────────────────────────────────────────────── */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  phase: number
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef<number | undefined>(undefined)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    const particleCount = window.innerWidth < 768 ? 30 : 50
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 1 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }))

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    let time = 0
    const animate = () => {
      time += 0.01

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Gentle drift
        particle.x += Math.sin(time + particle.phase) * 0.2
        particle.y += Math.cos(time + particle.phase * 0.7) * 0.15

        // Mouse attraction (subtle)
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const force = (150 - dist) / 150
          particle.x += (dx / dist) * force * 0.5
          particle.y += (dy / dist) * force * 0.5
        }

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Twinkle effect
        const twinkle = 0.7 + Math.sin(time * 2 + particle.phase) * 0.3

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(241, 225, 148, ${particle.opacity * twinkle})`
        ctx.fill()

        // Optional glow for larger particles
        if (particle.radius > 2) {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.radius * 2
          )
          gradient.addColorStop(0, `rgba(241, 225, 148, ${particle.opacity * twinkle * 0.3})`)
          gradient.addColorStop(1, 'rgba(241, 225, 148, 0)')
          ctx.fillStyle = gradient
          ctx.fill()
        }
      })

      frameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
