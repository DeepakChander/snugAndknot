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
    tag: 'Sustainability',
    title: 'The Journey of Organic Cotton',
    description:
      'From seed to garment: exploring how our organic cotton travels from ethical farms to your wardrobe, and why it matters.',
    image: '/images/blog/organic-cotton.jpg',
    href: '/blog/organic-cotton-journey',
  },
  {
    tag: 'Craftsmanship',
    title: 'Behind the Knit',
    description:
      'Meet the artisans who bring our designs to life, stitch by stitch, with decades of mastery and unwavering dedication.',
    image: '/images/blog/behind-knit.jpg',
    href: '/blog/behind-the-knit',
  },
  {
    tag: 'Style Guide',
    title: 'Timeless Wardrobe Essentials',
    description:
      'Building a capsule wardrobe that lasts: our philosophy on investing in fewer, better pieces that never go out of style.',
    image: '/images/blog/wardrobe-essentials.jpg',
    href: '/blog/timeless-wardrobe',
  },
]

export default function BlogShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const cards = sectionRef.current!.querySelectorAll('.blog-card')

      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 60, rotateX: 8 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1,
            delay: i * 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
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

  return (
    <section ref={sectionRef} className="relative py-28 lg:py-40 bg-cream-dark overflow-hidden perspective-[1200px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="font-mono text-xs text-terracotta tracking-[0.4em] uppercase mb-4">
            Journal
          </p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-4 leading-[1.05]">
            Stories & Insights
          </h2>
          <p className="text-walnut max-w-lg mx-auto text-sm">
            Discover the process behind our work
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {blogPosts.map((post, i) => (
            <Link
              key={post.title}
              href={post.href}
              className="blog-card group block"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-sand mb-5">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Read More Tag */}
                <div className="absolute bottom-4 right-4 bg-cream/90 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  <span className="font-mono text-[10px] text-charcoal uppercase tracking-wider">
                    Read More
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {/* Tag */}
                <div className="inline-block">
                  <span className="font-mono text-[10px] text-terracotta uppercase tracking-[0.2em] px-2 py-1 border border-terracotta/20 rounded">
                    {post.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-heading text-2xl text-charcoal group-hover:text-terracotta transition-colors duration-300">
                  {post.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-walnut leading-relaxed">
                  {post.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Line */}
        <div className="blog-line h-[1px] bg-gradient-to-r from-transparent via-beige to-transparent mb-10" />

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-3 px-8 py-3.5 border border-charcoal/20 text-charcoal text-sm font-medium rounded-full hover:border-charcoal hover:bg-charcoal hover:text-cream transition-all duration-500"
          >
            <span>Explore All</span>
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
