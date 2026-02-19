'use client'

import { useRef, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getCollectionByHandle, getCollectionProducts } from '@/lib/data'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import FloatingProductCard from '@/components/shop/FloatingProductCard'
import CurtainReveal from '@/components/shop/CurtainReveal'
import MaterialTransitions from '@/components/shop/MaterialTransitions'
import ParticleField from '@/components/shop/ParticleField'

// Dynamic import for 3D canvas (client-side only)
const ShopHeroCanvas = dynamic(() => import('@/components/3d/ShopHeroCanvas'), {
  ssr: false,
})

gsap.registerPlugin(ScrollTrigger)

export default function CollectionPage() {
  const params = useParams()
  const handle = params.slug as string
  const collection = getCollectionByHandle(handle)
  const products = getCollectionProducts(handle)

  // Parallax for hero
  const heroRef = useRef<HTMLDivElement>(null)
  const heroImageRef = useRef<HTMLDivElement>(null)
  const heroOverlayRef = useRef<HTMLDivElement>(null)
  const heroAccentRef = useRef<HTMLDivElement>(null)
  const heroLabelRef = useRef<HTMLParagraphElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const heroDescRef = useRef<HTMLParagraphElement>(null)
  const heroPillRef = useRef<HTMLDivElement>(null)

  // Editorial image clip-path reveal
  const editorialRef = useRef<HTMLDivElement>(null)
  const [editorialRevealed, setEditorialRevealed] = useState(false)

  // 3D canvas scroll progress and ready state
  const [scrollProgress, setScrollProgress] = useState(0)
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
    if (!editorialRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEditorialRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(editorialRef.current)
    return () => observer.disconnect()
  }, [])

  // Track scroll progress for 3D animations
  useEffect(() => {
    setCanvasReady(true)

    const handleScroll = () => {
      if (!heroRef.current) return
      const heroHeight = heroRef.current.offsetHeight
      const scrolled = window.scrollY
      const progress = Math.min(scrolled / heroHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // GSAP hero parallax + entrance animations
  useEffect(() => {
    if (!heroRef.current) return
    const hero = heroRef.current

    // Parallax: image layer scrolls slower (0-20%)
    if (heroImageRef.current) {
      gsap.fromTo(
        heroImageRef.current,
        { yPercent: 0 },
        {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      )
    }

    // Overlay opacity increases from 0.6 to 0.9
    if (heroOverlayRef.current) {
      gsap.fromTo(
        heroOverlayRef.current,
        { opacity: 0.6 },
        {
          opacity: 0.9,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'center top',
            scrub: true,
          },
        }
      )
    }

    // Entrance animations
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    if (heroAccentRef.current) {
      tl.fromTo(
        heroAccentRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.2 },
        0.2
      )
    }
    if (heroLabelRef.current) {
      tl.fromTo(
        heroLabelRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.35
      )
    }
    if (heroTitleRef.current) {
      tl.fromTo(
        heroTitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9 },
        0.45
      )
    }
    if (heroDescRef.current) {
      tl.fromTo(
        heroDescRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.6
      )
    }
    if (heroPillRef.current) {
      tl.fromTo(
        heroPillRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.6 },
        0.8
      )
    }

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === hero) t.kill()
      })
    }
  }, [])

  if (!collection) {
    return (
      <div className="pt-32 pb-20 text-center bg-ivory">
        <h1
          className="font-heading text-4xl mb-4 text-burgundy"
        >
          Collection Not Found
        </h1>
        <p className="mb-6 text-wine">
          The collection you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 text-sm font-medium rounded-full transition-all duration-300 hover:shadow-lg bg-burgundy text-ivory"
        >
          Back to Shop
        </Link>
      </div>
    )
  }

  // Split products: first 2 for large feature, rest for grid
  const featuredProducts = products.slice(0, 2)
  const gridProducts = products.slice(2)

  return (
    <>
      {/* Material transition backgrounds */}
      <MaterialTransitions />

      {/* Ambient particle field */}
      <ParticleField />

      <div className="pb-0 bg-transparent">
        {/* ═══════════════════════════════════════════════════════════
            HERO — Enhanced with 3D canvas, parallax, burgundy overlay
            ═══════════════════════════════════════════════════════════ */}
        <div
          ref={heroRef}
          className="relative w-full overflow-hidden"
          style={{ height: '60vh', minHeight: '420px' }}
        >
          {/* 3D Canvas with cloth, threads, and particles */}
          <ShopHeroCanvas scrollProgress={scrollProgress} isReady={canvasReady} />

          {/* Parallax image layer — 0.8x scroll speed */}
          <div
            ref={heroImageRef}
            className="absolute inset-0 w-full z-[2]"
            style={{
              height: '125%',
              top: '-12.5%',
            }}
          >
            <Image
              src={collection.image}
              alt={collection.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>

          {/* Burgundy gradient overlay: from burgundy-deep/80 to burgundy/60 */}
          <div
            ref={heroOverlayRef}
            className="absolute inset-0 z-[3]"
            style={{
              background: `linear-gradient(
                to top,
                rgba(61, 10, 14, 0.80) 0%,
                rgba(91, 14, 20, 0.60) 40%,
                rgba(91, 14, 20, 0.30) 70%,
                rgba(61, 10, 14, 0.15) 100%
              )`,
              opacity: 0.6,
            }}
          />

          {/* Decorative knit texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none knit-pattern-gold z-[4]"
            style={{ opacity: 0.25 }}
          />

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-[10]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pb-10 sm:pb-14 lg:pb-20">
            {/* Gold accent line */}
            <div
              ref={heroAccentRef}
              className="mb-5 origin-left bg-gold"
              style={{
                width: '48px',
                height: '2px',
                transform: 'scaleX(0)',
              }}
            />

            {/* Collection label */}
            <p
              ref={heroLabelRef}
              className="text-xs font-semibold uppercase tracking-[0.35em] mb-4 opacity-0 text-gold"
            >
              Collection
            </p>

            {/* Title */}
            <h1
              ref={heroTitleRef}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mb-4 opacity-0 text-ivory"
              style={{ lineHeight: 1.05 }}
            >
              {collection.title}
            </h1>

            {/* Description */}
            <p
              ref={heroDescRef}
              className="max-w-lg text-base sm:text-lg leading-relaxed opacity-0"
              style={{ color: 'rgba(253, 248, 236, 0.80)' }}
            >
              {collection.description}
            </p>

            {/* Product count pill */}
            <div
              ref={heroPillRef}
              className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase opacity-0 text-gold"
              style={{
                backgroundColor: 'rgba(241, 225, 148, 0.15)',
                border: '1px solid rgba(241, 225, 148, 0.25)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-gold"
              />
              {products.length} {products.length === 1 ? 'Piece' : 'Pieces'}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          EDITORIAL INTRO — Gold tag, burgundy heading, wine body
          ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative py-20 sm:py-28 bg-ivory"
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 pointer-events-none knit-pattern" />

        <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center">
          {/* Gold tag / label */}
          <FadeIn delay={0.1}>
            <span
              className="inline-block px-5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.25em] mb-6 text-gold-muted"
              style={{
                backgroundColor: 'rgba(241, 225, 148, 0.20)',
                border: '1px solid rgba(212, 196, 125, 0.30)',
              }}
            >
              Curated Selection
            </span>
          </FadeIn>

          {/* Burgundy heading */}
          <FadeIn delay={0.2}>
            <h2
              className="font-heading text-3xl sm:text-4xl lg:text-5xl mb-6 text-burgundy"
              style={{ lineHeight: 1.15 }}
            >
              Every piece, chosen with intention
            </h2>
          </FadeIn>

          {/* Wine body text */}
          <FadeIn delay={0.35}>
            <p
              className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-wine"
            >
              A thoughtfully curated selection of {products.length} pieces that embody the spirit
              of this collection. Each item has been chosen to complement the others perfectly,
              creating a wardrobe that feels both considered and effortless.
            </p>
          </FadeIn>

          {/* Decorative divider */}
          <FadeIn delay={0.5}>
            <div className="flex items-center justify-center gap-3 mt-10">
              <div
                className="h-px w-12 bg-gold-muted"
              />
              <div
                className="w-2 h-2 rotate-45 border border-gold-muted"
              />
              <div
                className="h-px w-12 bg-gold-muted"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MIXED GRID — First 2 products large split, rest 4-col grid
          ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-20">
          {/* Featured pair — large split layout with curtain reveals */}
          {featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* First featured product — flush left */}
              <CurtainReveal index={0}>
                <FloatingProductCard product={featuredProducts[0]} index={0} priority />
              </CurtainReveal>

              {/* Second featured product — offset down for editorial feel */}
              {featuredProducts[1] && (
                <div className="lg:pt-20">
                  <CurtainReveal index={1} delay={0.15}>
                    <FloatingProductCard product={featuredProducts[1]} index={1} />
                  </CurtainReveal>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              EDITORIAL IMAGE BREAK — Full-width with clip-path reveal
              ═══════════════════════════════════════════════════════════ */}
          {gridProducts.length > 0 && (
            <div
              ref={editorialRef}
              className="relative w-full overflow-hidden rounded-lg"
              style={{
                height: '320px',
                clipPath: editorialRevealed
                  ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
                  : 'polygon(5% 15%, 95% 15%, 95% 85%, 5% 85%)',
                transition: 'clip-path 1.2s cubic-bezier(0.22, 0.68, 0.36, 1.0)',
              }}
            >
              <Image
                src={collection.image}
                alt={`${collection.title} editorial`}
                fill
                className="object-cover"
                style={{
                  filter: 'saturate(0.8) brightness(0.65)',
                }}
                sizes="100vw"
              />
              {/* Burgundy overlay with texture */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(
                    135deg,
                    rgba(61, 10, 14, 0.85) 0%,
                    rgba(91, 14, 20, 0.60) 50%,
                    rgba(74, 26, 32, 0.70) 100%
                  )`,
                }}
              />
              <div className="absolute inset-0 knit-pattern-gold" style={{ opacity: 0.04 }} />

              {/* Quote / brand moment */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <FadeIn delay={0.5}>
                  <p
                    className="font-heading text-2xl sm:text-3xl lg:text-4xl italic max-w-2xl text-gold-pale"
                    style={{ lineHeight: 1.3 }}
                  >
                    &ldquo;Where tension becomes tenderness.&rdquo;
                  </p>
                </FadeIn>
                <FadeIn delay={0.9}>
                  <div
                    className="mt-5 origin-center mx-auto bg-gold"
                    style={{
                      width: '40px',
                      height: '1.5px',
                    }}
                  />
                </FadeIn>
                <FadeIn delay={1.2}>
                  <p
                    className="mt-4 text-xs font-medium uppercase tracking-[0.3em]"
                    style={{ color: 'rgba(241, 225, 148, 0.6)' }}
                  >
                    Snug &amp; Knot
                  </p>
                </FadeIn>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              REMAINING PRODUCTS — 4-column grid
              ═══════════════════════════════════════════════════════════ */}
          {gridProducts.length > 0 && (
            <div>
              {/* Section subheading */}
              <FadeIn>
                <div className="flex items-center gap-4 mb-10">
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: 'rgba(212, 196, 125, 0.30)' }}
                  />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.25em] px-3 text-gold-muted"
                  >
                    Explore the collection
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: 'rgba(212, 196, 125, 0.30)' }}
                  />
                </div>
              </FadeIn>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {gridProducts.map((product, i) => (
                  <CurtainReveal key={product.id} index={i + 2}>
                    <FloatingProductCard product={product} index={i + 2} />
                  </CurtainReveal>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            FOOTER CTA — Back to all collections / shop
            ═══════════════════════════════════════════════════════════ */}
        <div className="py-20 sm:py-28">
          <FadeIn>
            <div className="text-center">
              {/* Decorative element */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div
                  className="h-px w-16"
                  style={{ backgroundColor: 'rgba(212, 196, 125, 0.30)' }}
                />
                <div
                  className="w-1.5 h-1.5 rounded-full bg-gold-muted"
                />
                <div
                  className="h-px w-16"
                  style={{ backgroundColor: 'rgba(212, 196, 125, 0.30)' }}
                />
              </div>

              <p
                className="text-sm mb-6 tracking-wide text-wine"
              >
                Continue exploring
              </p>

              <Link
                href="/shop"
                className="group inline-flex items-center gap-3 text-sm font-medium transition-all duration-300 text-burgundy"
              >
                <span
                  className="relative pb-1 border-b-[1.5px] border-burgundy"
                >
                  Shop All Products
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="transition-transform duration-300 group-hover:translate-x-1 text-gold-muted"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM BRAND STRIP — Full-width burgundy-deep
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden py-16 sm:py-20 bg-burgundy-deep"
      >
        <div className="absolute inset-0 knit-pattern-gold" style={{ opacity: 0.03 }} />
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 text-center relative z-10">
          <FadeIn>
            <p
              className="font-heading text-2xl sm:text-3xl italic mb-3 text-gold-pale"
            >
              Every thread earns its place.
            </p>
            <p
              className="text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: 'rgba(241, 225, 148, 0.45)' }}
            >
              Snug &amp; Knot
            </p>
          </FadeIn>
        </div>
      </div>
      </div>
    </>
  )
}
