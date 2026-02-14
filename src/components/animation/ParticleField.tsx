'use client'

import { useRef, useEffect } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | undefined>(undefined)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    const particleCount = 50
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.3 + 0.1,
      })
    }
    particlesRef.current = particles

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Move particle
        particle.x += particle.vx
        particle.y += particle.vy

        // Mouse interaction - repel particles
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 150) {
          const force = (150 - dist) / 150
          particle.vx -= (dx / dist) * force * 0.2
          particle.vy -= (dy / dist) * force * 0.2
        }

        // Apply friction
        particle.vx *= 0.99
        particle.vy *= 0.99

        // Boundaries
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(196, 121, 90, ${particle.opacity})`
        ctx.fill()

        // Draw connections
        particlesRef.current.forEach((other) => {
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            const opacity = (1 - dist / 100) * 0.15
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(196, 121, 90, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-40"
    />
  )
}
