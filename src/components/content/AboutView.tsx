'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'
import Reveal, { RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/kit/Button'

/*
 * The About page, in the owner's words (October 2026): who Snug & Knot is, the in-house
 * manufacturing, the design approach, the aesthetic, quality, beyond trends and the vision, closing
 * on the brand line. Set in the site's calm language: ivory, the serif headlines, hairlines, one
 * dark band and quiet entrances.
 */

const INTENTION = ['A well-cut silhouette.', 'A beautiful fabric.', 'A considered detail.', 'A finish that feels right.']

const PRINCIPLES = ['Thoughtful design.', 'Strong aesthetics.', 'Quality materials.', 'In-house craftsmanship.', 'Attention to detail.', 'A clear sense of identity.']

/** Counts up once when it scrolls into view. Renders the real number first, so it is never wrong without JS. */
function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const started = useRef(false)

  // Writes straight to the text node, so the count does not re-render React sixty times a second.
  useEffect(() => {
    const el = ref.current
    if (!el || reduce || started.current) return
    if (!inView) {
      el.textContent = '0'
      return
    }
    started.current = true
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    })
    return () => controls.stop()
  }, [inView, reduce, value])

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  )
}

function Eyebrow({ children, className = 'text-stone' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[0.72rem] font-medium uppercase tracking-[0.3em] md:text-[0.78rem] ${className}`}>{children}</p>
}

export default function AboutView({ storeName }: { storeName: string }) {
  return (
    <>
      {/* About Snug & Knot: the idea, beside the studio photograph. */}
      <section data-nav-theme="light" className="relative overflow-hidden bg-ivory pb-20 pt-[calc(var(--nav-h)+var(--announce-h,0px)+2.5rem)] text-ink md:pb-28">
        <div className="container-wide grid items-center gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="order-2 lg:order-1 lg:col-span-6 lg:pr-10">
            <Eyebrow className="sk-rise text-ink/70">About Snug &amp; Knot</Eyebrow>
            <h1 className="sk-rise mt-4 font-serif text-[clamp(2.8rem,6vw,5.5rem)] font-normal leading-[1.0] tracking-[-0.01em] [animation-delay:120ms]">
              A modern expression of <em>personal style</em>
            </h1>
            <div className="sk-rise mt-8 max-w-lg space-y-5 leading-relaxed text-ink/75 [animation-delay:220ms]">
              <p className="text-[1.05rem] md:text-lg">
                Snug &amp; Knot is a contemporary fashion brand built around a simple idea: <strong className="font-medium text-ink">style should feel effortless, personal, and enduring.</strong>
              </p>
              <p>We create thoughtfully designed pieces for the modern wardrobe, bringing together clothing, denim, footwear, and accessories under one distinct point of view.</p>
              <p className="text-stone">
                Our approach is rooted in considered design. We pay attention to silhouette, proportion, fabric, texture, colour, and the details that give every piece its character. Each collection is developed to feel
                relevant today while remaining easy to wear beyond a single season.
              </p>
            </div>
            <div className="sk-rise mt-9 [animation-delay:320ms]">
              <ButtonLink href="/shop" size="lg" arrow>
                Shop the collection
              </ButtonLink>
            </div>
          </div>

          <div className="sk-rise order-1 lg:order-2 lg:col-span-5 lg:col-start-8 [animation-delay:160ms]">
            <figure className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden bg-parchment shadow-[0_40px_80px_-45px_rgba(22,16,14,0.55)] ring-1 ring-ink/5 lg:max-w-none">
              <Image src="/images/about/about-hero.png" alt={`In the ${storeName} studio`} fill priority sizes="(min-width:1024px) 40vw, 90vw" className="object-cover object-[50%_40%]" />
            </figure>
          </div>
        </div>
      </section>

      {/* Designed by us. Made by us. The in-house manufacturing, with its one figure. */}
      <section data-nav-theme="light" aria-labelledby="about-made" className="border-y border-ink/10 bg-bone text-ink">
        <div className="container-wide grid gap-12 py-[clamp(3.5rem,7vw,6rem)] lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-4">
            <p className="font-serif text-[clamp(5rem,11vw,9rem)] leading-[0.85] text-burgundy">
              <Counter value={20} />
            </p>
            <p className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-stone">Years of experience in garment manufacturing</p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6">
            <Eyebrow>From the beginning</Eyebrow>
            <h2 id="about-made" className="mt-4 font-serif text-[clamp(2.3rem,4.6vw,4rem)] font-normal leading-[1.02]">
              Designed by us. <em>Made by us.</em>
            </h2>
            <div className="mt-7 max-w-2xl space-y-4 leading-relaxed text-ink/75">
              <p>From the beginning, we wanted a closer relationship with the way our products are made.</p>
              <p>
                Our garments are manufactured in-house through our own manufacturing setup, backed by <strong className="font-medium text-ink">20 years of experience in garment manufacturing</strong>. This allows us to stay
                closely involved throughout development, production, and finishing.
              </p>
              <p>From construction and fit to materials and final finishing, we maintain close control over the details that define the finished garment.</p>
            </div>
            <p className="mt-8 border-l-2 border-burgundy pl-5 font-serif text-[clamp(1.35rem,2.2vw,1.8rem)] leading-snug">For us, manufacturing isn&rsquo;t simply a production step. It is part of the design itself.</p>
          </Reveal>
        </div>
      </section>

      {/* Designed with intention: the four simple elements. */}
      <section data-nav-theme="light" aria-labelledby="about-intention" className="section-pad bg-ivory text-ink">
        <div className="container-wide">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <Reveal className="md:col-span-7">
              <Eyebrow>Our approach</Eyebrow>
              <h2 id="about-intention" className="mt-4 font-serif text-[clamp(2.3rem,4.6vw,4rem)] font-normal leading-[1.02]">
                Designed with <em>intention</em>
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="md:col-span-4 md:col-start-9">
              <p className="text-stone">We believe great design doesn&rsquo;t need to be excessive.</p>
            </Reveal>
          </div>
          <RevealGroup className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {INTENTION.map((line, i) => (
              <RevealItem key={line} className="border-t border-ink/15 pt-6">
                <p className="font-mono text-xs text-burgundy">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-5 font-serif text-[1.75rem] font-normal leading-[1.1]">{line}</p>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal className="mt-14">
            <p className="max-w-2xl text-[1.05rem] leading-relaxed text-ink/75">It is often the simplest elements, when done well, that create the strongest pieces.</p>
          </Reveal>
        </div>
      </section>

      {/* The aesthetic, and quality in the details, side by side. */}
      <section data-nav-theme="light" aria-label="Aesthetic and quality" className="bg-ivory pb-[clamp(4rem,8vw,7rem)] text-ink">
        <div className="container-wide grid gap-14 border-t border-ink/10 pt-[clamp(3.5rem,7vw,6rem)] lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Eyebrow>Modern and timeless</Eyebrow>
            <h2 className="mt-4 font-serif text-[clamp(2rem,3.6vw,3.1rem)] font-normal leading-[1.05]">
              The Snug &amp; Knot <em>aesthetic</em>
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-ink/75">
              <p>
                Our aesthetic sits between <strong className="font-medium text-ink">modern and timeless</strong>.
              </p>
              <p>
                We take inspiration from contemporary fashion while keeping our designs wearable, versatile, and refined. Our collections are designed to work together, allowing individual pieces to move effortlessly from
                everyday dressing to more considered occasions.
              </p>
              <p>From everyday essentials to statement pieces, every category is developed with the same attention to design, quality, and detail.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Eyebrow>How it feels to wear</Eyebrow>
            <h2 className="mt-4 font-serif text-[clamp(2rem,3.6vw,3.1rem)] font-normal leading-[1.05]">
              Quality in the <em>details</em>
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-ink/75">
              <p>For us, quality isn&rsquo;t simply about how something looks when it&rsquo;s new.</p>
              <p>
                It&rsquo;s about how it feels to wear &mdash; the hand of the fabric, the fall of a garment, the precision of a silhouette, the strength of a construction, and the finish of every detail.
              </p>
              <p>Our own manufacturing setup allows us to remain closely involved in these details throughout the making process.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Beyond trends, on the one dark band of the page. */}
      <section data-nav-theme="dark" aria-labelledby="about-trends" className="section-pad bg-ink text-bone">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-4xl text-center">
            <Eyebrow className="text-bone/60">Beyond trends</Eyebrow>
            <h2 id="about-trends" className="mt-5 font-serif text-[clamp(2.4rem,5vw,4.6rem)] font-normal leading-[1.04]">
              Fashion is constantly changing. <em className="text-bone/75">Personal style doesn&rsquo;t have to.</em>
            </h2>
            <div className="mx-auto mt-8 max-w-2xl space-y-4 leading-relaxed text-bone/65">
              <p>We don&rsquo;t design simply to follow what&rsquo;s popular today. Instead, we take inspiration from contemporary fashion and interpret it through our own perspective.</p>
              <p className="text-bone/85">The result is a wardrobe that feels current without feeling temporary.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Our vision, and the principles it keeps to. */}
      <section data-nav-theme="light" aria-labelledby="about-vision" className="section-pad bg-ivory text-ink">
        <div className="container-wide grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <Eyebrow>As we grow</Eyebrow>
            <h2 id="about-vision" className="mt-4 font-serif text-[clamp(2.3rem,4.6vw,4rem)] font-normal leading-[1.02]">
              Our <em>vision</em>
            </h2>
            <div className="mt-7 space-y-4 leading-relaxed text-ink/75">
              <p>
                Snug &amp; Knot is being built as a complete fashion destination &mdash; bringing together <strong className="font-medium text-ink">clothing, denim, footwear, accessories, and more</strong> under one
                evolving identity.
              </p>
              <p>As we grow, our collections will continue to expand across categories while staying true to the same principles:</p>
            </div>
          </Reveal>
          <RevealGroup className="grid content-start gap-px self-end overflow-hidden border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {PRINCIPLES.map((p, i) => (
              <RevealItem key={p} className="flex items-baseline gap-4 bg-ivory p-6 md:p-7">
                <span className="font-mono text-xs text-burgundy">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-serif text-[1.45rem] leading-tight">{p}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* The brand line, and the invitation. */}
      <section data-nav-theme="light" aria-labelledby="about-close" className="bg-ivory pb-[clamp(4.5rem,9vw,8rem)] text-ink">
        <div className="container-wide">
          <Reveal className="border border-ink/10 bg-bone px-6 py-16 text-center md:px-16 md:py-24">
            <p className="mx-auto max-w-2xl leading-relaxed text-stone">We are not here to define how you should dress.</p>
            <p className="mx-auto mt-2 max-w-2xl text-[1.1rem] font-medium leading-relaxed">We are here to create pieces that help you define your own style.</p>
            <Eyebrow className="mt-12 text-ink/70">Snug &amp; Knot</Eyebrow>
            <h2 id="about-close" className="mx-auto mt-4 max-w-3xl font-serif text-[clamp(2.4rem,5vw,4.5rem)] font-normal leading-[1.02]">
              Contemporary fashion, <em>distinctly yours.</em>
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-stone">Designed with intention. Made with care. Rooted in craftsmanship.</p>
            <div className="mt-9 flex justify-center">
              <ButtonLink href="/shop" size="lg" arrow>
                Shop the collection
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
