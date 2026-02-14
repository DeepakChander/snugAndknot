'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import Image from 'next/image'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const storyImages = [
  { src: '/images/collection-home/Artisan\'s.png', alt: 'Artisan crafting garment', caption: 'The hands behind every piece' },
  { src: '/images/collection-home/Material-Intimacy.png', alt: 'Premium fabric detail', caption: 'Materials that matter' },
  { src: '/images/collection-home/Lived-In.png', alt: 'Model in natural setting', caption: 'Moments between moments' },
]

export default function BrandTeaser() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !quoteRef.current) return

    const ctx = gsap.context(() => {
      // Pin the quote side while images scroll (desktop only)
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px)', () => {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: quoteRef.current,
          pinSpacing: false,
        })
      })

      // Reveal images as they scroll into view
      const images = sectionRef.current!.querySelectorAll('.story-image-wrapper')
      images.forEach((img, i) => {
        gsap.fromTo(img,
          {
            clipPath: 'inset(15% 0% 15% 0%)',
            opacity: 0,
            y: 60,
          },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: img,
              start: 'top 85%',
            },
          }
        )

        // Image scale on scroll
        const innerImg = img.querySelector('.story-image')
        if (innerImg) {
          gsap.fromTo(innerImg,
            { scale: 1.15 },
            {
              scale: 1,
              duration: 1.4,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: img,
                start: 'top 85%',
              },
            }
          )
        }
      })

      // Simple heading fade in
      const heading = quoteRef.current!.querySelector('.story-heading')
      if (heading) {
        gsap.fromTo(heading,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="relative bg-cream">
      {/* Top divider */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-beige to-transparent" />

      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Sticky quote side */}
          <div ref={quoteRef} className="flex items-center px-4 sm:px-6 lg:px-12 py-20 lg:py-32 lg:min-h-screen">
            <div className="max-w-xl">
              <p className="font-mono text-xs text-terracotta tracking-[0.35em] uppercase mb-6 font-bold">
                Our Story
              </p>
              <h2 className="story-heading font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-6 leading-[1.05]">
                Fashion that feels like home
              </h2>
              <p className="text-walnut text-base lg:text-lg leading-relaxed mb-6">
                Every stitch tells a story. We believe in creating pieces that aren&apos;t just worn,
                but lived in &mdash; garments that become part of your story.
              </p>
              <p className="text-earth text-sm italic mb-10 border-l-2 border-terracotta/40 pl-5 py-1">
                &ldquo;We design for the moments between moments &mdash;
                the quiet mornings, the long walks, the gentle evenings.&rdquo;
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 text-sm font-semibold text-charcoal hover:text-terracotta transition-colors"
              >
                <span className="border-b-2 border-charcoal/30 pb-1 group-hover:border-terracotta transition-colors">
                  Our Story
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

          {/* Scrolling images side */}
          <div className="space-y-8 lg:space-y-10 px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            {storyImages.map((img, i) => (
              <div key={i} className="story-image-wrapper group">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-sand shadow-xl">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    quality={100}
                    priority={i === 0}
                    className="story-image object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500" />

                  {/* Caption on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <p className="text-xs text-charcoal font-medium">{img.caption}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-beige to-transparent" />
    </section>
  )
}
