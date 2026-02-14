'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/* ── Particle System - Floating geometric shapes ── */
function ParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string
      rotation: number
      rotationSpeed: number
    }

    const particles: Particle[] = []
    const particleCount = 30

    const colors = [
      'rgba(196, 121, 90, 0.4)', // terracotta
      'rgba(232, 196, 184, 0.3)', // blush
      'rgba(139, 158, 132, 0.35)', // sage
    ]

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      })
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY
        p.rotation += p.rotationSpeed

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = p.opacity

        // Draw diamond shape
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.moveTo(0, -p.size)
        ctx.lineTo(p.size, 0)
        ctx.lineTo(0, p.size)
        ctx.lineTo(-p.size, 0)
        ctx.closePath()
        ctx.fill()

        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

/* ── Animated Mesh Gradient Blob ── */
function MeshBlob({ delay = 0, color = 'terracotta' }: { delay?: number; color?: string }) {
  const blobRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!blobRef.current) return

    const element = blobRef.current
    const tl = gsap.timeline({ repeat: -1, yoyo: true, delay })

    tl.to(element, {
      x: gsap.utils.random(-150, 150),
      y: gsap.utils.random(-150, 150),
      scale: gsap.utils.random(1, 1.5),
      rotate: gsap.utils.random(-180, 180),
      duration: gsap.utils.random(8, 15),
      ease: 'sine.inOut',
    })

    return () => {
      tl.kill()
    }
  }, [delay])

  const colorMap: Record<string, string> = {
    terracotta: 'rgba(196, 121, 90, 0.2)',
    blush: 'rgba(232, 196, 184, 0.18)',
    sage: 'rgba(139, 158, 132, 0.15)',
  }

  return (
    <div
      ref={blobRef}
      className="absolute rounded-full blur-[100px]"
      style={{
        width: 500,
        height: 500,
        background: `radial-gradient(circle, ${colorMap[color] || colorMap.terracotta}, transparent 70%)`,
      }}
    />
  )
}

/* ── Morphing SVG Pattern ── */
function MorphingPattern() {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (!pathRef.current) return

    const paths = [
      'M0,50 Q25,20 50,50 T100,50',
      'M0,50 Q25,80 50,50 T100,50',
      'M0,50 Q25,30 50,50 T100,50',
      'M0,50 Q25,70 50,50 T100,50',
    ]

    let index = 0

    const interval = setInterval(() => {
      if (!pathRef.current) return
      index = (index + 1) % paths.length

      gsap.to(pathRef.current, {
        attr: { d: paths[index] },
        duration: 3,
        ease: 'sine.inOut',
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C4795A" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#8B9E84" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#E8C4B8" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d="M0,50 Q25,20 50,50 T100,50"
        stroke="url(#wave-gradient)"
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/* ── Magnetic button with advanced effects ── */
function MagneticButton({ href, children, variant = 'primary' }: { href: string; children: React.ReactNode; variant?: 'primary' | 'secondary' }) {
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(button, {
        x: x * 0.4,
        y: y * 0.4,
        duration: 0.3,
        ease: 'power2.out',
      })

      // Move inner glow
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.5,
          ease: 'power2.out',
        })
      }
    }

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.6)',
      })

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.6)',
        })
      }
    }

    button.addEventListener('mousemove', handleMouseMove)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      button.removeEventListener('mousemove', handleMouseMove)
      button.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (variant === 'primary') {
    return (
      <Link
        ref={buttonRef}
        href={href}
        className="group relative inline-flex items-center gap-3 px-14 py-5 bg-charcoal text-cream text-sm font-bold rounded-full overflow-hidden transition-all duration-500 hover:shadow-[0_30px_80px_-20px_rgba(196,121,90,0.6)]"
      >
        {/* Inner animated glow */}
        <div
          ref={glowRef}
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-terracotta/50 via-terracotta-dark/50 to-terracotta/50 animate-pulse" />
        </div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1.5s] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Radial glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(196,121,90,0.4),transparent_70%)]" />

        <span className="relative z-10 tracking-wide uppercase text-xs">{children}</span>

        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="relative z-10 transition-transform duration-500 group-hover:translate-x-3 group-hover:scale-110"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    )
  }

  return (
    <Link
      ref={buttonRef}
      href={href}
      className="group relative inline-flex items-center gap-3 px-14 py-5 border-2 border-charcoal/30 text-charcoal text-sm font-bold rounded-full overflow-hidden transition-all duration-500 hover:border-terracotta hover:shadow-[0_20px_60px_-20px_rgba(196,121,90,0.4)]"
    >
      {/* Expanding background */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-espresso to-charcoal scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />

      <span className="relative z-10 tracking-wide uppercase text-xs group-hover:text-cream transition-colors duration-500">
        {children}
      </span>

      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="relative z-10 transition-all duration-500 group-hover:translate-x-3 group-hover:text-cream group-hover:scale-110"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const cursorGlowRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  // Cursor glow effect
  useEffect(() => {
    if (!sectionRef.current || !cursorGlowRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!cursorGlowRef.current) return

      gsap.to(cursorGlowRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.8,
        ease: 'power2.out',
      })
    }

    sectionRef.current.addEventListener('mousemove', handleMouseMove)
    return () => {
      sectionRef.current?.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 })

      // Tag - slide + blur reveal
      if (tagRef.current) {
        gsap.set(tagRef.current, { x: -120, opacity: 0, filter: 'blur(12px)', scale: 0.9 })
        tl.to(tagRef.current, {
          x: 0,
          opacity: 1,
          filter: 'blur(0px)',
          scale: 1,
          duration: 1.2,
          ease: 'expo.out',
        }, 0)
      }

      // Heading - 3D rotation reveal
      if (headingRef.current) {
        const words = headingRef.current.querySelectorAll('.hero-word')
        gsap.set(words, {
          rotateX: 90,
          opacity: 0,
          y: 50,
          transformOrigin: 'center bottom',
          transformPerspective: 800,
        })
        tl.to(words, {
          rotateX: 0,
          opacity: 1,
          y: 0,
          duration: 1.4,
          stagger: 0.12,
          ease: 'expo.out',
        }, 0.3)
      }

      // Subtitle - scale + blur reveal
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { opacity: 0, y: 50, scale: 0.93, filter: 'blur(8px)' })
        tl.to(subtitleRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'expo.out',
        }, 0.7)
      }

      // CTA buttons - staggered bounce
      if (ctaRef.current) {
        const buttons = ctaRef.current.querySelectorAll('a')
        gsap.set(buttons, { opacity: 0, y: 80, scale: 0.9 })
        tl.to(buttons, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          stagger: 0.2,
          ease: 'back.out(1.4)',
        }, 1)
      }

      // Parallax layers on mouse move
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e
        const xPercent = (clientX / window.innerWidth - 0.5) * 2
        const yPercent = (clientY / window.innerHeight - 0.5) * 2

        gsap.to('.parallax-layer-1', {
          x: xPercent * 40,
          y: yPercent * 40,
          rotation: xPercent * 5,
          duration: 1.2,
          ease: 'power2.out',
        })

        gsap.to('.parallax-layer-2', {
          x: xPercent * 25,
          y: yPercent * 25,
          duration: 1,
          ease: 'power2.out',
        })

        gsap.to('.parallax-text', {
          x: xPercent * 12,
          y: yPercent * 12,
          duration: 0.8,
          ease: 'power2.out',
        })
      }

      sectionRef.current!.addEventListener('mousemove', handleMouseMove)
      return () => sectionRef.current?.removeEventListener('mousemove', handleMouseMove)
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #F5EDE6 0%, #E8D5C4 25%, #F5EDE6 50%, #DCC9BA 75%, #F5EDE6 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 15s ease infinite',
      }}
    >
      {/* Animated gradient blobs */}
      <div className="parallax-layer-1 absolute inset-0">
        <MeshBlob delay={0} color="terracotta" />
        <MeshBlob delay={2} color="blush" />
        <MeshBlob delay={4} color="sage" />
      </div>

      {/* Particle system */}
      <div className="parallax-layer-2">
        <ParticleSystem />
      </div>

      {/* Animated gradient mesh overlay */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 20% 30%, rgba(196,121,90,0.15), transparent 40%), radial-gradient(circle at 80% 70%, rgba(139,158,132,0.12), transparent 40%), radial-gradient(circle at 50% 50%, rgba(232,196,184,0.1), transparent 50%)',
            animation: 'mesh-move 20s ease-in-out infinite',
          }}
        />
      </div>

      {/* Morphing SVG pattern */}
      <MorphingPattern />

      {/* Interactive cursor glow */}
      <div
        ref={cursorGlowRef}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-0 hover:opacity-20 transition-opacity"
        style={{
          background: 'radial-gradient(circle, rgba(196,121,90,0.4), transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Animated grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.8) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(0,0,0,0.8) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '80px 80px',
          animation: 'grid-flow 30s linear infinite',
        }}
      />

      {/* Floating accent lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-terracotta/20 to-transparent"
          style={{ animation: 'line-float 8s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-1/3 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sage/15 to-transparent"
          style={{ animation: 'line-float 10s ease-in-out infinite reverse' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Season tag */}
          <div ref={tagRef} className="mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl border border-terracotta/30 rounded-full shadow-[0_10px_40px_-10px_rgba(196,121,90,0.3)]">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-terracotta" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-terracotta animate-ping" />
              </div>
              <span className="font-mono text-xs sm:text-sm text-terracotta uppercase tracking-[0.35em] font-bold">
                New Season — AW25
              </span>
            </div>
          </div>

          {/* Main heading */}
          <div ref={headingRef} className="parallax-text mb-10 sm:mb-12">
            <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl lg:text-[11rem] leading-[0.88] tracking-[-0.03em] mb-4">
              <div className="flex flex-wrap justify-center gap-x-8 mb-2">
                <span className="hero-word inline-block text-charcoal drop-shadow-sm">Woven</span>
                <span className="hero-word inline-block text-charcoal drop-shadow-sm">with</span>
              </div>
              <div className="flex justify-center">
                <span
                  className="hero-word inline-block bg-gradient-to-r from-terracotta via-terracotta-dark to-charcoal bg-clip-text text-transparent drop-shadow-lg"
                  style={{
                    backgroundSize: '200% auto',
                    animation: 'gradient-flow 8s ease infinite',
                  }}
                >
                  Intention
                </span>
              </div>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="parallax-text text-lg sm:text-xl md:text-2xl text-charcoal/75 max-w-3xl mx-auto mb-14 sm:mb-16 leading-relaxed"
          >
            Timeless pieces crafted with care, designed to be cherished.
            <br className="hidden sm:block" />
            <span className="text-terracotta font-semibold">Discover our new collection of premium essentials.</span>
          </p>

          {/* CTA buttons */}
          <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <MagneticButton href="/shop" variant="primary">
              Shop Collection
            </MagneticButton>
            <MagneticButton href="/lookbook" variant="secondary">
              View Lookbook
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* Corner accent frames - animated */}
      <div className="absolute top-8 left-8 w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-charcoal/15 to-transparent" style={{ animation: 'expand-h 3s ease-in-out infinite' }} />
        <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-charcoal/15 to-transparent" style={{ animation: 'expand-v 3s ease-in-out infinite' }} />
      </div>
      <div className="absolute top-8 right-8 w-20 h-20">
        <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-charcoal/15 to-transparent" style={{ animation: 'expand-h 3s ease-in-out infinite 0.5s' }} />
        <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-charcoal/15 to-transparent" style={{ animation: 'expand-v 3s ease-in-out infinite 0.5s' }} />
      </div>
      <div className="absolute bottom-8 left-8 w-20 h-20">
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-charcoal/15 to-transparent" style={{ animation: 'expand-h 3s ease-in-out infinite 1s' }} />
        <div className="absolute bottom-0 left-0 w-[2px] h-full bg-gradient-to-t from-charcoal/15 to-transparent" style={{ animation: 'expand-v 3s ease-in-out infinite 1s' }} />
      </div>
      <div className="absolute bottom-8 right-8 w-20 h-20">
        <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-l from-charcoal/15 to-transparent" style={{ animation: 'expand-h 3s ease-in-out infinite 1.5s' }} />
        <div className="absolute bottom-0 right-0 w-[2px] h-full bg-gradient-to-t from-charcoal/15 to-transparent" style={{ animation: 'expand-v 3s ease-in-out infinite 1.5s' }} />
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes mesh-move {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }

        @keyframes gradient-flow {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 200% center; }
        }

        @keyframes grid-flow {
          0% { transform: translate(0, 0); }
          100% { transform: translate(80px, 80px); }
        }

        @keyframes line-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes expand-h {
          0%, 100% { width: 80px; opacity: 0.15; }
          50% { width: 100%; opacity: 0.3; }
        }

        @keyframes expand-v {
          0%, 100% { height: 80px; opacity: 0.15; }
          50% { height: 100%; opacity: 0.3; }
        }
      `}</style>
    </section>
  )
}
