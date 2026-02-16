'use client'

import Link from 'next/link'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import blogPosts from '@/data/blog-posts.json'

export default function BlogPage() {
  const mainPost = blogPosts[0]
  const secondaryPosts = blogPosts.slice(1)

  return (
    <div className="pt-24 pb-0 bg-ivory">
      {/* Hero Header */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <p className="font-mono text-xs text-gold tracking-[0.4em] uppercase mb-4">
          Loose Ends
        </p>
        <TextReveal
          as="h1"
          className="text-5xl sm:text-6xl lg:text-7xl text-burgundy mb-4 leading-[1.05]"
        >
          Threads we haven&apos;t tied off yet
        </TextReveal>
        <FadeIn delay={0.15}>
          <p className="text-wine max-w-lg text-sm">
            Ongoing conversations about material, meaning, and making
          </p>
        </FadeIn>
      </section>

      {/* Main Editorial Spread */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {/* Main Story Card */}
          <FadeIn>
            <Link
              href={`/blog/${mainPost.slug}`}
              className="group block"
            >
              <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden bg-silk">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mainPost.image}
                  alt={mainPost.title}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy/60 via-burgundy/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="inline-block mb-3">
                    <span className="font-mono text-[10px] text-burgundy uppercase tracking-[0.2em] px-2.5 py-1 bg-gold rounded">
                      {mainPost.tag}
                    </span>
                  </div>
                  <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-ivory group-hover:text-gold transition-colors duration-300 leading-[1.1] mb-3">
                    {mainPost.title}
                  </h2>
                  <p className="text-sm text-ivory/80 leading-relaxed max-w-md mb-2">
                    {mainPost.description}
                  </p>
                  <p className="font-mono text-[10px] text-ivory/60 uppercase tracking-widest">
                    A {mainPost.readTime}
                  </p>
                </div>
              </div>
            </Link>
          </FadeIn>

          {/* Secondary Cards */}
          <div className="flex flex-col gap-6 lg:gap-8">
            {secondaryPosts.map((post, i) => (
              <FadeIn key={post.slug} delay={0.1 + i * 0.1}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <div className="flex flex-col sm:flex-row rounded-2xl overflow-hidden bg-parchment h-full">
                    <div className="relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto sm:min-h-[220px] lg:min-h-[260px] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-5 sm:p-6 lg:p-8 sm:w-3/5 space-y-3">
                      <div className="inline-block self-start">
                        <span className="font-mono text-[10px] text-burgundy uppercase tracking-[0.2em] px-2.5 py-1 bg-gold rounded">
                          {post.tag}
                        </span>
                      </div>
                      <h3 className="font-heading text-xl sm:text-2xl text-burgundy group-hover:text-gold transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="text-sm text-wine leading-relaxed">
                        {post.description}
                      </p>
                      <p className="font-mono text-[10px] text-rosewood/60 uppercase tracking-widest mt-auto pt-2">
                        A {post.readTime}
                      </p>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-10" />

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-burgundy hover:text-gold transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}
