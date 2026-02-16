'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import Image from 'next/image'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const blogPosts = [
  {
    tag: 'Origin',
    title: 'Where Cotton Learns Tension',
    description:
      'A fiber does not become thread by accident. Follow organic cotton from the field where it first resists the wind to the loom where it finds its counterpart.',
    image: '/images/blog/organic-cotton.jpg',
    href: '/blog/organic-cotton-journey',
    readTime: '6-minute thread',
  },
  {
    tag: 'Process',
    title: 'The Knot Diary',
    description:
      'Forty years between a weaver\'s fingers. We sat with three of our loom partners and asked them one question: what does the thread remember?',
    image: '/images/blog/behind-knit.jpg',
    href: '/blog/behind-the-knit',
    readTime: '8-minute thread',
  },
  {
    tag: 'Philosophy',
    title: 'Against the Wardrobe',
    description:
      'The idea of a "capsule wardrobe" is already a compromise. What if you stopped collecting and started binding? A case for fewer, tighter knots.',
    image: '/images/blog/wardrobe-essentials.jpg',
    href: '/blog/timeless-wardrobe',
    readTime: '4-minute thread',
  },
]

export default function BlogShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  // Entrance animations
  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      // Header elements entrance
      const header = sectionRef.current!.querySelector('.blog-header')
      if (header) {
        gsap.fromTo(header,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
          }
        )
      }

      // Main story card entrance (from left)
      const mainCard = sectionRef.current!.querySelector('.blog-card-main')
      if (mainCard) {
        gsap.fromTo(mainCard,
          { opacity: 0, x: -40, scaleY: 0.97 },
          {
            opacity: 1,
            x: 0,
            scaleY: 1,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )
      }

      // Secondary cards entrance (staggered from right)
      const secondaryCards = sectionRef.current!.querySelectorAll('.blog-card-secondary')
      secondaryCards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, x: 40, scaleY: 0.97 },
          {
            opacity: 1,
            x: 0,
            scaleY: 1,
            duration: 1,
            delay: i * 0.18,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )
      })

      // Animate the bottom line
      const line = sectionRef.current!.querySelector('.blog-line')
      if (line) {
        gsap.fromTo(line,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 1.5,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 90%',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  const mainPost = blogPosts[0]
  const secondaryPosts = blogPosts.slice(1)

  return (
    <section ref={sectionRef} className="relative py-28 lg:py-40 bg-parchment overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="blog-header text-center mb-16 lg:mb-20">
          <p className="font-mono text-xs text-gold tracking-[0.4em] uppercase mb-4">
            Loose Ends
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-burgundy mb-4 leading-[1.05]">
            Threads we haven&apos;t tied off yet
          </h2>
          <p className="text-wine max-w-lg mx-auto text-sm">
            Ongoing conversations about material, meaning, and making
          </p>
        </div>

        {/* L-Shaped Editorial Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {/* Main Story — Left Column: tall card */}
          <Link
            href={mainPost.href}
            className="blog-card-main group block"
          >
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden bg-silk">
              <Image
                src={mainPost.image}
                alt={mainPost.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy/60 via-burgundy/20 to-transparent" />

              {/* Read More Tag on hover */}
              <div className="absolute top-4 right-4 bg-ivory/90 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <span className="font-mono text-[10px] text-burgundy uppercase tracking-wider">
                  Follow this thread
                </span>
              </div>

              {/* Content overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                {/* Tag Badge */}
                <div className="inline-block mb-3">
                  <span className="font-mono text-[10px] text-burgundy uppercase tracking-[0.2em] px-2.5 py-1 bg-gold rounded">
                    {mainPost.tag}
                  </span>
                </div>

                {/* Title — heading-xl overlay */}
                <h3 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-ivory group-hover:text-gold transition-colors duration-300 leading-[1.1] mb-3">
                  {mainPost.title}
                </h3>

                <p className="text-sm text-ivory/80 leading-relaxed max-w-md mb-2">
                  {mainPost.description}
                </p>

                {/* Read time */}
                <p className="font-mono text-[10px] text-ivory/60 uppercase tracking-widest">
                  A {mainPost.readTime}
                </p>
              </div>
            </div>
          </Link>

          {/* Secondary — Right Column: 2 stacked horizontal cards */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {secondaryPosts.map((post) => (
              <Link
                key={post.title}
                href={post.href}
                className="blog-card-secondary group block"
              >
                <div className="flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-ivory h-full">
                  {/* Image left */}
                  <div className="relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto sm:min-h-[220px] lg:min-h-[260px] overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Image overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-burgundy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Read More Tag on hover */}
                    <div className="absolute bottom-3 right-3 bg-ivory/90 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <span className="font-mono text-[10px] text-burgundy uppercase tracking-wider">
                        Follow this thread
                      </span>
                    </div>
                  </div>

                  {/* Text right */}
                  <div className="flex flex-col justify-center p-5 sm:p-6 lg:p-8 sm:w-3/5 space-y-3">
                    {/* Tag Badge */}
                    <div className="inline-block self-start">
                      <span className="font-mono text-[10px] text-burgundy uppercase tracking-[0.2em] px-2.5 py-1 bg-gold rounded">
                        {post.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-xl sm:text-2xl text-burgundy group-hover:text-gold transition-colors duration-300">
                      {post.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-wine leading-relaxed">
                      {post.description}
                    </p>

                    {/* Read time */}
                    <p className="font-mono text-[10px] text-rosewood/60 uppercase tracking-widest mt-auto pt-2">
                      A {post.readTime}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Line */}
        <div className="blog-line h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-10" />

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-3 px-8 py-3.5 border border-burgundy/20 text-burgundy text-sm font-medium rounded-full hover:border-burgundy hover:bg-burgundy hover:text-gold transition-all duration-500"
          >
            <span>More loose ends</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
