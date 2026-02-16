'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getAllLookbookSpreads } from '@/lib/data'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import ClipRevealImage from '@/components/ui/ClipRevealImage'
import GoldDivider from '@/components/ui/GoldDivider'

gsap.registerPlugin(ScrollTrigger)

/* ──────────────────────────────────────
   Single spread section (full viewport)
   ────────────────────────────────────── */
function SpreadSection({
  spread,
  index,
}: {
  spread: ReturnType<typeof getAllLookbookSpreads>[number]
  index: number
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const imagesRef = useRef<HTMLDivElement>(null)

  const isEven = index % 2 === 0

  useEffect(() => {
    if (!sectionRef.current) return
    const el = sectionRef.current

    // Opacity: fade in from 0.4, full at 20%-80%, fade to 0.4 at end
    gsap.fromTo(
      el,
      { opacity: 0.4 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'top 80%',
          scrub: true,
        },
      }
    )
    gsap.to(el, {
      opacity: 0.4,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'bottom 20%',
        end: 'bottom top',
        scrub: true,
      },
    })

    // Parallax Y on images grid
    if (imagesRef.current) {
      gsap.fromTo(
        imagesRef.current,
        { y: 60 },
        {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [])

  // Determine clip-path reveal directions based on image position
  const getRevealDirection = (position: string, imgIdx: number): 'left' | 'right' | 'up' | 'center' => {
    if (position === 'full') return 'center'
    if (position === 'left') return 'left'
    if (position === 'right') return 'right'
    return imgIdx % 2 === 0 ? 'left' : 'right'
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center py-20 lg:py-28"
    >
      {/* Subtle gold knit pattern overlay */}
      <div className="pointer-events-none absolute inset-0 knit-pattern-gold" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Spread number & season */}
        <FadeIn>
          <div className={`mb-6 flex items-center gap-4 ${isEven ? '' : 'justify-end'}`}>
            <span
              className="text-xs font-mono tracking-[0.4em] uppercase text-gold-muted"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="h-px w-12 bg-wine" />
            <span
              className="text-xs font-semibold uppercase tracking-[0.3em] text-wine"
            >
              {spread.season}
            </span>
          </div>
        </FadeIn>

        {/* Spread title */}
        <div className={`mb-4 ${isEven ? 'text-left' : 'text-right'}`}>
          <TextReveal
            as="h2"
            className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-gold-pale"
          >
            {spread.title}
          </TextReveal>
          <FadeIn delay={0.15}>
            <p
              className="mt-2 text-sm italic tracking-wide text-blush-wine"
            >
              {spread.subtitle}
            </p>
          </FadeIn>
        </div>

        <GoldDivider className="my-8" />

        {/* Images grid with clip-path reveals */}
        <div ref={imagesRef} className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-5">
          {spread.images.map((img, imgIndex) => (
            <div
              key={imgIndex}
              className={img.position === 'full' ? 'md:col-span-2' : ''}
            >
              <ClipRevealImage
                src={img.src}
                alt={img.alt}
                aspectClass={
                  img.position === 'full'
                    ? 'aspect-[21/9] rounded-sm'
                    : 'aspect-[3/4] rounded-sm'
                }
                sizes={img.position === 'full' ? '100vw' : '50vw'}
                direction={getRevealDirection(img.position, imgIndex)}
                delay={imgIndex * 0.12}
              />
            </div>
          ))}
        </div>

        {/* Description + CTA */}
        <div className={`mt-10 max-w-2xl ${isEven ? '' : 'ml-auto text-right'}`}>
          <FadeIn delay={0.1}>
            <p className="text-dust leading-relaxed mb-6 text-base lg:text-lg">
              {spread.description}
            </p>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-300 text-gold"
            >
              <span className="relative">
                Shop this look
                <span
                  className="absolute left-0 -bottom-1 h-px w-0 transition-all duration-500 group-hover:w-full bg-gold"
                />
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </FadeIn>
        </div>
      </div>

      {/* Bottom spread divider: thin wine line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] max-w-3xl">
        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #8B2E35, transparent)' }} />
      </div>
    </section>
  )
}

/* ──────────────────────────────────────
   Main Lookbook Page
   ────────────────────────────────────── */
export default function LookbookPage() {
  const spreads = getAllLookbookSpreads()
  const heroRef = useRef<HTMLDivElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)
  const heroEditorialRef = useRef<HTMLParagraphElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const heroLineLeftRef = useRef<HTMLDivElement>(null)
  const heroLineRightRef = useRef<HTMLDivElement>(null)
  const heroDiamondRef = useRef<HTMLDivElement>(null)
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const scrollLineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current || !heroContentRef.current) return
    const hero = heroRef.current
    const content = heroContentRef.current

    // Hero parallax: content moves up + fades out as you scroll past
    gsap.to(content, {
      y: 120,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })

    // Entrance animations for hero elements
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })

    tl.fromTo(
      heroEditorialRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.2
    )
    tl.fromTo(
      heroTitleRef.current,
      { opacity: 0, y: 60, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2 },
      0.4
    )
    tl.fromTo(
      heroLineLeftRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.6 },
      1.0
    )
    tl.fromTo(
      heroLineRightRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.6 },
      1.0
    )
    tl.fromTo(
      heroDiamondRef.current,
      { scale: 0, rotation: 45 },
      { scale: 1, rotation: 45, duration: 0.6 },
      1.6
    )
    tl.fromTo(
      heroSubtitleRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.0 },
      1.8
    )
    tl.fromTo(
      scrollIndicatorRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.0 },
      2.4
    )

    // Bouncing scroll line
    if (scrollLineRef.current) {
      gsap.to(scrollLineRef.current, {
        y: 8,
        duration: 1,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    }

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === hero) t.kill()
      })
    }
  }, [])

  return (
    <div className="bg-noir text-ivory min-h-screen">
      {/* ═══════════════════════════════════
          HERO: Full-screen noir background
          ═══════════════════════════════════ */}
      <div ref={heroRef} className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background texture */}
        <div className="pointer-events-none absolute inset-0 knit-pattern-gold" />

        {/* Gradient vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, #0F0A0B 80%)',
          }}
        />

        {/* Hero content */}
        <div
          ref={heroContentRef}
          className="relative z-10 text-center px-4"
        >
          {/* Top accent */}
          <p
            ref={heroEditorialRef}
            className="text-xs font-semibold uppercase tracking-[0.5em] mb-6 opacity-0 text-gold-muted"
          >
            Editorial
          </p>

          {/* Main title */}
          <h1
            ref={heroTitleRef}
            className="font-heading text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] leading-none opacity-0 text-gold-pale"
          >
            Lookbook
          </h1>

          {/* Horizontal gold line animation */}
          <div className="flex items-center justify-center mt-10">
            <div
              ref={heroLineLeftRef}
              className="h-px w-full max-w-xs sm:max-w-sm origin-left bg-gold"
              style={{ transform: 'scaleX(0)' }}
            />
            <div
              ref={heroDiamondRef}
              className="mx-5 h-2.5 w-2.5 shrink-0 bg-gold"
              style={{ transform: 'scale(0) rotate(45deg)' }}
            />
            <div
              ref={heroLineRightRef}
              className="h-px w-full max-w-xs sm:max-w-sm origin-right bg-gold"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>

          {/* Subtitle */}
          <p
            ref={heroSubtitleRef}
            className="mt-8 text-base sm:text-lg max-w-lg mx-auto leading-relaxed opacity-0 text-dust"
          >
            Explore our latest editorial collections. Each spread tells a story
            through the lens of modern fashion.
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-0"
        >
          <span
            className="text-[10px] uppercase tracking-[0.4em] font-medium text-gold-muted"
          >
            Scroll
          </span>
          <div
            ref={scrollLineRef}
            className="w-px h-8 bg-gold-muted"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════
          SPREADS: Full viewport sections
          ═══════════════════════════════════ */}
      <div
        className="relative"
        style={{
          background: 'linear-gradient(180deg, #0F0A0B 0%, #3D0A0E 30%, #5B0E14 60%, #3D0A0E 85%, #0F0A0B 100%)',
        }}
      >
        {spreads.map((spread, spreadIndex) => (
          <SpreadSection
            key={spread.id}
            spread={spread}
            index={spreadIndex}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════
          FOOTER CODA
          ═══════════════════════════════════ */}
      <div className="relative py-32 flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-noir">
        <div className="pointer-events-none absolute inset-0 knit-pattern-gold" />

        <GoldDivider className="mb-12" />

        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-[0.5em] mb-4 text-gold-muted"
          >
            Continue the story
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h3
            className="font-heading text-4xl sm:text-5xl lg:text-6xl mb-6 text-gold-pale"
          >
            Shop the Edit
          </h3>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-dust max-w-md mx-auto mb-10 leading-relaxed">
            Every piece in our lookbook is available now. Discover the full
            collections and find your next statement.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Link
            href="/shop"
            className="group relative inline-flex items-center gap-3 px-10 py-4 text-sm font-medium uppercase tracking-[0.25em] transition-all duration-500 overflow-hidden rounded-none border border-gold text-gold"
          >
            <span
              className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 bg-gold"
            />
            <span className="relative z-10 transition-colors duration-500 group-hover:text-noir">
              Explore Collections
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="relative z-10 transition-all duration-500 group-hover:translate-x-1 group-hover:text-noir"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </FadeIn>

        <GoldDivider className="mt-16" />
      </div>
    </div>
  )
}
