'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const pillars = [
  {
    number: '01',
    title: 'Source',
    subtitle: 'Ethical Origins',
    description:
      'We hand-select the finest natural fibers from ethical suppliers worldwide — premium merino wool, organic cotton, and sustainable cashmere blends.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <circle cx="12" cy="9" r="2" />
      </svg>
    ),
    gradient: 'from-terracotta/30 via-terracotta/10 to-transparent',
    glowColor: 'rgba(196, 121, 90, 0.4)',
    accentColor: '#C4795A',
  },
  {
    number: '02',
    title: 'Design',
    subtitle: 'Intentional Form',
    description:
      'Our artisans sketch each piece by hand, blending timeless silhouettes with modern sensibility. Every stitch placement and seam line is intentional.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
    gradient: 'from-sage/30 via-sage/10 to-transparent',
    glowColor: 'rgba(139, 158, 132, 0.4)',
    accentColor: '#8B9E84',
  },
  {
    number: '03',
    title: 'Craft',
    subtitle: 'Skilled Hands',
    description:
      'Small-batch production in our partner ateliers. Each garment is knitted, cut, and finished by skilled hands with meticulous attention to detail.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    gradient: 'from-blush/30 via-blush/10 to-transparent',
    glowColor: 'rgba(232, 196, 184, 0.4)',
    accentColor: '#E8C4B8',
  },
]

/* ── Animated Counter Component ── */
function AnimatedCounter({ target, inView }: { target: string; inView: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!inView || !ref.current) return

    const element = ref.current
    const isNumber = /^\d+/.test(target)

    if (isNumber) {
      const finalValue = parseInt(target.match(/\d+/)?.[0] || '0')
      let current = 0

      const interval = setInterval(() => {
        current += Math.ceil(finalValue / 30)
        if (current >= finalValue) {
          element.textContent = target
          clearInterval(interval)
        } else {
          element.textContent = current + target.replace(/\d+/, '')
        }
      }, 40)

      return () => clearInterval(interval)
    } else {
      element.textContent = target
    }
  }, [inView, target])

  return <div ref={ref} className="font-heading">{target}</div>
}

export default function BrandPhilosophy() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsInView, setStatsInView] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      // Animated top line draw
      const topLine = sectionRef.current!.querySelector('.philosophy-top-line')
      if (topLine) {
        gsap.fromTo(topLine,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
          }
        )
      }

      // Heading - char-by-char with blur
      if (headingRef.current) {
        const chars = headingRef.current.textContent?.split('') || []
        headingRef.current.innerHTML = chars.map((char, i) =>
          char === ' '
            ? '<span class="inline-block w-[0.3em]"></span>'
            : `<span class="inline-block overflow-hidden"><span class="philosophy-char inline-block" style="transform:translateY(120%);opacity:0;filter:blur(8px)">${char}</span></span>`
        ).join('')

        gsap.to('.philosophy-char', {
          y: '0%',
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.03,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
          },
        })
      }

      // Cards - advanced 3D entrance
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.philosophy-card')

        cards.forEach((card, i) => {
          // Card container entrance
          gsap.fromTo(card,
            {
              opacity: 0,
              y: 120,
              rotateX: 25,
              rotateY: -15,
              scale: 0.85,
              filter: 'blur(10px)',
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 1.5,
              delay: i * 0.25,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: cardsRef.current,
                start: 'top 70%',
              },
            }
          )

          // Icon scale + rotation
          const icon = card.querySelector('.card-icon')
          if (icon) {
            gsap.fromTo(icon,
              { scale: 0, rotation: -180, opacity: 0 },
              {
                scale: 1,
                rotation: 0,
                opacity: 1,
                duration: 1.2,
                delay: 0.3 + i * 0.25,
                ease: 'back.out(2)',
                scrollTrigger: {
                  trigger: cardsRef.current,
                  start: 'top 70%',
                },
              }
            )
          }

          // Number reveal
          const number = card.querySelector('.card-number')
          if (number) {
            gsap.fromTo(number,
              { opacity: 0, scale: 1.5, filter: 'blur(20px)' },
              {
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                duration: 1,
                delay: 0.5 + i * 0.25,
                ease: 'expo.out',
                scrollTrigger: {
                  trigger: cardsRef.current,
                  start: 'top 70%',
                },
              }
            )
          }

          // Line draw
          const line = card.querySelector('.card-line')
          if (line) {
            gsap.fromTo(line,
              { scaleX: 0, transformOrigin: 'left center' },
              {
                scaleX: 1,
                duration: 1.2,
                delay: 0.8 + i * 0.25,
                ease: 'expo.out',
                scrollTrigger: {
                  trigger: cardsRef.current,
                  start: 'top 70%',
                },
              }
            )
          }

          // Text content fade
          const content = card.querySelector('.card-content')
          if (content) {
            gsap.fromTo(content,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 1,
                delay: 1 + i * 0.25,
                ease: 'expo.out',
                scrollTrigger: {
                  trigger: cardsRef.current,
                  start: 'top 70%',
                },
              }
            )
          }

          // Hover effect - 3D tilt
          const cardEl = card as HTMLElement
          const handleMouseMove = (e: Event) => {
            const mouseEvent = e as unknown as MouseEvent
            const rect = cardEl.getBoundingClientRect()
            const x = mouseEvent.clientX - rect.left
            const y = mouseEvent.clientY - rect.top
            const centerX = rect.width / 2
            const centerY = rect.height / 2
            const rotateX = (y - centerY) / 10
            const rotateY = (centerX - x) / 10

            gsap.to(cardEl, {
              rotateX,
              rotateY,
              duration: 0.5,
              ease: 'power2.out',
            })
          }

          const handleMouseLeave = () => {
            gsap.to(cardEl, {
              rotateX: 0,
              rotateY: 0,
              duration: 0.8,
              ease: 'elastic.out(1, 0.5)',
            })
          }

          cardEl.addEventListener('mousemove', handleMouseMove)
          cardEl.addEventListener('mouseleave', handleMouseLeave)
        })
      }

      // Stats counter trigger
      if (statsRef.current) {
        ScrollTrigger.create({
          trigger: statsRef.current,
          start: 'top 85%',
          onEnter: () => setStatsInView(true),
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative py-32 lg:py-48 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at top, #2C2420 0%, #1A1210 40%, #0f0d0b 100%)',
      }}
    >
      {/* Animated ambient orbs - larger and more vibrant */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { size: 600, color: 'rgba(196,121,90,0.25)', top: '5%', left: '-10%', duration: 20 },
          { size: 500, color: 'rgba(139,158,132,0.18)', bottom: '5%', right: '-10%', duration: 25 },
          { size: 450, color: 'rgba(232,196,184,0.15)', top: '40%', left: '50%', duration: 22 },
        ].map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-[150px]"
            style={{
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              top: orb.top,
              left: orb.left,
              bottom: orb.bottom,
              right: orb.right,
              animation: `float-complex ${orb.duration}s ease-in-out infinite`,
              animationDelay: `${i * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Animated diagonal lines */}
      <div className="absolute inset-0 opacity-[0.03]">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              top: `${i * 8}%`,
              left: '-10%',
              right: '-10%',
              transform: `rotate(-2deg)`,
              animation: `line-slide ${15 + i * 2}s linear infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      {/* Particle dots */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        animation: 'dots-pulse 4s ease-in-out infinite',
      }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top animated line */}
        <div className="philosophy-top-line h-[2px] bg-gradient-to-r from-transparent via-terracotta/60 to-transparent mb-24 lg:mb-32 shadow-[0_0_20px_rgba(196,121,90,0.3)]" />

        {/* Section header */}
        <div className="text-center mb-24 lg:mb-32">
          <div className="inline-block mb-8">
            <div className="flex items-center gap-4 px-5 py-2 bg-white/[0.03] border border-terracotta/20 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              <p className="font-mono text-xs text-terracotta tracking-[0.5em] uppercase font-bold">
                Our Philosophy
              </p>
              <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            </div>
          </div>

          <div ref={headingRef}>
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-8xl xl:text-[9rem] text-cream leading-[1] mb-8 tracking-tight">
              From Fiber to Fashion
            </h2>
          </div>

          <p className="text-base sm:text-lg lg:text-xl text-cream/90 max-w-2xl mx-auto leading-relaxed font-light">
            Every Snug&Knot garment is a journey — from ethically sourced fibers
            to the moment it becomes part of your wardrobe.
          </p>
        </div>

        {/* Pillar cards - completely redesigned */}
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 mb-28 perspective-[1500px]">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.number}
              className="philosophy-card group relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="relative rounded-3xl p-10 lg:p-12 h-full border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-md transition-all duration-700 hover:border-white/15 hover:bg-white/[0.08] hover:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)]">
                {/* Animated top glow */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                  style={{
                    boxShadow: `0 0 20px ${pillar.glowColor}`,
                  }}
                />

                {/* Corner accent - animated */}
                <div className="absolute -top-1 -left-1 w-6 h-6">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-white/20 to-transparent" />
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-white/20 to-transparent" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6">
                  <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-white/20 to-transparent" />
                  <div className="absolute top-0 right-0 w-[2px] h-full bg-gradient-to-b from-white/20 to-transparent" />
                </div>

                {/* Number - large background */}
                <div className="card-number absolute top-6 right-6 font-mono text-[8rem] lg:text-[10rem] font-black text-white/[0.06] leading-none group-hover:text-white/[0.12] transition-all duration-500">
                  {pillar.number}
                </div>

                {/* Icon with animated glow */}
                <div className="card-icon relative mb-8">
                  <div
                    className="relative z-10 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-cream group-hover:bg-white/15 group-hover:text-terracotta transition-all duration-500 group-hover:scale-110"
                    style={{
                      boxShadow: `0 10px 40px -10px ${pillar.glowColor}`,
                    }}
                  >
                    {pillar.icon}
                  </div>
                  {/* Pulsing ring */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: `0 0 0 0 ${pillar.glowColor}`,
                      animation: 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
                    }}
                  />
                </div>

                {/* Title */}
                <h3
                  className="font-heading text-4xl lg:text-5xl text-cream mb-3 transition-all duration-500 group-hover:text-terracotta group-hover:translate-x-1"
                  style={{
                    textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {pillar.title}
                </h3>

                {/* Subtitle */}
                <p className="font-mono text-xs text-terracotta uppercase tracking-[0.3em] mb-6 font-bold">
                  {pillar.subtitle}
                </p>

                {/* Animated line */}
                <div className="card-line h-[1px] bg-gradient-to-r from-white/30 via-white/50 to-transparent mb-8" />

                {/* Description */}
                <div className="card-content">
                  <p className="text-sm lg:text-base text-cream leading-[1.9] font-normal transition-colors duration-500">
                    {pillar.description}
                  </p>
                </div>

                {/* Hover glow effect */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${pillar.glowColor}, transparent 70%)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stats row - completely redesigned */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 max-w-5xl mx-auto mb-20">
          {[
            { value: '100+', label: 'Unique Pieces', color: 'terracotta' },
            { value: '12', label: 'Partner Ateliers', color: 'sage' },
            { value: '97%', label: 'Organic Fibers', color: 'blush' },
            { value: '0', label: 'Compromises', color: 'terracotta' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="group relative text-center"
              style={{
                animation: `float-stat 3s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            >
              {/* Glow background */}
              <div className="absolute -inset-4 bg-white/[0.02] rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="text-5xl lg:text-6xl text-cream font-heading mb-3 group-hover:scale-110 transition-transform duration-500">
                  <AnimatedCounter target={stat.value} inView={statsInView} />
                </div>
                <div className="h-[1px] bg-gradient-to-r from-transparent via-terracotta/40 to-transparent mb-3 scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                <p className="text-[11px] text-cream/80 uppercase tracking-[0.25em] font-mono group-hover:text-terracotta transition-colors duration-500">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom tagline with animated borders */}
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center gap-6 justify-center py-6 px-8 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-terracotta/60" />
              <span className="text-xs text-cream/80 uppercase tracking-[0.3em] font-mono">
                Ethically sourced
              </span>
            </div>
            <div className="w-[1px] h-4 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-sage/60" />
              <span className="text-xs text-cream/80 uppercase tracking-[0.3em] font-mono">
                Handcrafted with care
              </span>
            </div>
            <div className="w-[1px] h-4 bg-white/10 hidden lg:block" />
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blush/60" />
              <span className="text-xs text-cream/80 uppercase tracking-[0.3em] font-mono">
                Built to last
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float-complex {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(40px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-30px, 40px) scale(0.9);
          }
          75% {
            transform: translate(30px, 30px) scale(1.05);
          }
        }

        @keyframes line-slide {
          0% {
            transform: translateX(-100%) rotate(-2deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%) rotate(-2deg);
            opacity: 0;
          }
        }

        @keyframes dots-pulse {
          0%, 100% {
            opacity: 0.04;
            transform: scale(1);
          }
          50% {
            opacity: 0.08;
            transform: scale(1.02);
          }
        }

        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 var(--glow-color);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(0, 0, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
          }
        }

        @keyframes float-stat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </section>
  )
}
