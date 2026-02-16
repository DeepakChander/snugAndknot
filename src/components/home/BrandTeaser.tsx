'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import Image from 'next/image'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const storyMedia = [
  {
    src: "/images/collection-home/Artisan's.png",
    alt: 'Artisan hands binding thread to form',
    caption: 'The tension between hands and thread',
    aspect: 'aspect-[4/5]',
  },
  {
    src: '/images/collection-home/Everyday.png',
    alt: 'The rhythm of the loom in motion',
    caption: 'Where warp meets weft',
    aspect: 'aspect-video',
  },
  {
    src: '/images/collection-home/Lived-In.png',
    alt: 'Fabric settled against skin in natural light',
    caption: 'Worn in, not worn out',
    aspect: 'aspect-[3/4]',
  },
]

export default function BrandTeaser() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !quoteRef.current) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: quoteRef.current,
          pinSpacing: false,
        })

        if (dividerRef.current) {
          gsap.fromTo(
            dividerRef.current,
            { scaleY: 0, transformOrigin: 'top center' },
            {
              scaleY: 1,
              duration: 1.6,
              ease: 'expo.out',
              scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
            }
          )
        }
      })

      // Reveal media items
      const mediaItems = sectionRef.current!.querySelectorAll('.story-media-wrapper')
      mediaItems.forEach((item) => {
        gsap.fromTo(
          item,
          { clipPath: 'inset(15% 0% 15% 0%)', opacity: 0, y: 60 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: { trigger: item, start: 'top 85%' },
          }
        )

        const innerMedia = item.querySelector('.story-media')
        if (innerMedia) {
          gsap.fromTo(
            innerMedia,
            { scale: 1.15 },
            {
              scale: 1,
              duration: 1.4,
              ease: 'expo.out',
              scrollTrigger: { trigger: item, start: 'top 85%' },
            }
          )
        }
      })

      /* ── Left side 3D text animations — triggered via onEnter ── */
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          // Gold accent line draws in
          const accentLine = quoteRef.current!.querySelector('.accent-line')
          if (accentLine) {
            gsap.fromTo(
              accentLine,
              { scaleX: 0, transformOrigin: 'left center' },
              { scaleX: 1, duration: 1.4, ease: 'expo.out' }
            )
          }

          // Mono tag slides in from left with blur
          const monoTag = quoteRef.current!.querySelector('.story-tag')
          if (monoTag) {
            gsap.fromTo(
              monoTag,
              { x: -50, opacity: 0, filter: 'blur(8px)' },
              { x: 0, opacity: 1, filter: 'blur(0px)', duration: 1.0, ease: 'expo.out' }
            )
          }

          // Heading words: 3D rotation cascade
          const words = quoteRef.current!.querySelectorAll('.word-3d')
          if (words.length) {
            gsap.fromTo(
              words,
              {
                rotateX: 90,
                rotateY: -12,
                y: 50,
                opacity: 0,
                transformOrigin: 'left bottom',
              },
              {
                rotateX: 0,
                rotateY: 0,
                y: 0,
                opacity: 1,
                duration: 1.4,
                stagger: 0.07,
                ease: 'expo.out',
                delay: 0.15,
              }
            )
          }

          // Pull quote: 3D perspective slide from left
          const pullQuote = quoteRef.current!.querySelector('.pull-quote')
          if (pullQuote) {
            gsap.fromTo(
              pullQuote,
              { rotateY: 10, x: -30, opacity: 0, transformOrigin: 'left center' },
              { rotateY: 0, x: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.5 }
            )
          }

          // Body elements stagger in with 3D flip
          const bodyEls = quoteRef.current!.querySelectorAll('.story-body-element')
          bodyEls.forEach((el, i) => {
            gsap.fromTo(
              el,
              { rotateX: 15, y: 25, opacity: 0, transformOrigin: 'center top' },
              {
                rotateX: 0,
                y: 0,
                opacity: 1,
                duration: 0.9,
                ease: 'expo.out',
                delay: 0.7 + i * 0.12,
              }
            )
          })
        },
      })

      // Continuous gentle floating on heading after a delay
      const headingContainer = quoteRef.current!.querySelector('.heading-float')
      if (headingContainer) {
        gsap.to(headingContainer, {
          y: -6,
          duration: 3.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 3,
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  // Split text into word spans for 3D word-by-word animation
  const splitWords = (text: string) => {
    const wordArray = text.split(' ')
    return wordArray.map((word, i) => (
      <span
        key={i}
        className="word-3d inline-block will-change-transform"
        style={{ perspective: '600px' }}
      >
        {word}
        {i < wordArray.length - 1 && '\u00A0'}
      </span>
    ))
  }

  return (
    <section ref={sectionRef} className="relative bg-ivory">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-dust to-transparent" />

      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 relative">
          {/* Divider line */}
          <div
            ref={dividerRef}
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 z-10 opacity-10 bg-dust"
          />

          {/* ── Left side: Sticky text with 3D animations ── */}
          <div
            ref={quoteRef}
            className="flex items-center px-4 sm:px-6 lg:px-12 lg:pr-16 py-20 lg:py-32 lg:min-h-screen"
          >
            <div className="max-w-xl" style={{ perspective: '1200px' }}>
              {/* Mono tag */}
              <p className="story-tag font-mono text-xs tracking-[0.35em] uppercase mb-5 font-bold text-thread-gold"
              >
                Pulled Taut
              </p>

              {/* Gold accent line */}
              <div
                className="accent-line h-[2px] w-16 mb-8 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #D4A843, #F1E194, transparent)',
                }}
              />

              {/* 3D Animated Heading — word-by-word cascade */}
              <div className="heading-float mb-6" style={{ perspective: '800px' }}>
                <h2 className="story-heading font-heading text-4xl sm:text-5xl lg:text-6xl text-burgundy leading-[1.05]">
                  {splitWords('You have been wearing apologies.')}
                </h2>
              </div>

              {/* Pull quote with gradient gold accent word */}
              <div className="mb-8" style={{ perspective: '800px' }}>
                <p className="pull-quote text-xl sm:text-2xl lg:text-[1.75rem] font-heading text-burgundy/80 leading-snug">
                  Every thread is there because{' '}
                  <span
                    className="relative inline-block font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #D4A843, #F1E194)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    removing it
                  </span>{' '}
                  would make the whole thing less.
                </p>
              </div>

              {/* Body text */}
              <div style={{ perspective: '600px' }}>
                <p className="story-body-element text-wine text-base lg:text-lg leading-relaxed mb-6">
                  Fabric that compromises is fabric that lies against your skin and pretends.
                  We stopped pretending. Every thread in a Snug&Knot piece is there because
                  removing it would make the whole thing less.
                </p>
              </div>

              {/* Italic quote with gold border */}
              <div style={{ perspective: '600px' }}>
                <p
                  className="story-body-element text-wine/70 text-sm italic mb-10 border-l-2 pl-5 py-1"
                  style={{ borderColor: 'rgba(212, 168, 67, 0.5)' }}
                >
                  &ldquo;Feel where the warp meets the weft.
                  That resistance is intentional.&rdquo;
                </p>
              </div>

              {/* CTA */}
              <div style={{ perspective: '600px' }}>
                <Link
                  href="/about"
                  className="story-body-element group inline-flex items-center gap-3 text-sm font-semibold text-burgundy hover:text-gold transition-colors duration-300"
                >
                  <span className="border-b-2 border-burgundy/30 pb-1 group-hover:border-gold transition-colors duration-300">
                    Unravel the full story
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Right side: Scrolling media ── */}
          <div className="space-y-8 lg:space-y-10 px-4 sm:px-6 lg:pl-16 lg:pr-8 py-20 lg:py-32">
            {storyMedia.map((media, i) => (
              <div key={i} className="story-media-wrapper group">
                <div
                  className={`relative ${media.aspect} rounded-2xl overflow-hidden shadow-xl`}
                  style={{ backgroundColor: 'rgba(191, 168, 142, 0.2)' }}
                >
                  <Image
                    src={media.src}
                    alt={media.alt}
                    fill
                    quality={80}
                    priority={i === 0}
                    className="story-media object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                  <div className="absolute inset-0 bg-burgundy/0 group-hover:bg-burgundy/10 transition-colors duration-500" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <div
                      className="backdrop-blur-sm px-4 py-2 rounded-lg"
                      style={{ backgroundColor: 'rgba(253, 248, 236, 0.9)' }}
                    >
                      <p className="text-xs text-burgundy font-medium">{media.caption}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-dust to-transparent" />
    </section>
  )
}
