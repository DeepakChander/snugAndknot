'use client'

import Link from 'next/link'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import Accordion from '@/components/ui/Accordion'

const materials = [
  {
    name: 'Cotton',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7M18.4 5.6l.7-.7" />
      </svg>
    ),
    items: [
      { title: 'Washing', content: 'Machine wash cold (30°C/86°F) on a gentle cycle. Turn garments inside out before washing to preserve color and surface texture. Use a mild, pH-neutral detergent. Avoid bleach or fabric softeners.' },
      { title: 'Drying', content: 'Lay flat to dry on a clean towel, reshaping while damp. Avoid tumble drying, as heat can cause shrinkage and weaken cotton fibers over time. Keep away from direct sunlight to prevent fading.' },
      { title: 'Ironing', content: 'Iron on medium heat while slightly damp for best results. Use a pressing cloth for darker colors to prevent shine. Steam works well for removing wrinkles without direct contact.' },
      { title: 'Storage', content: 'Fold and store in a cool, dry place. Avoid hanging knit cotton garments as they can stretch. Use cedar blocks or lavender sachets to deter moths naturally.' },
    ],
  },
  {
    name: 'Wool & Merino',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    items: [
      { title: 'Washing', content: 'Hand wash in cool water (20°C/68°F) with a wool-specific detergent. Gently agitate without wringing or twisting. Soak for no more than 10 minutes. For merino, a gentle machine cycle in a mesh bag is acceptable.' },
      { title: 'Drying', content: 'Gently press out excess water by rolling in a clean towel — never wring. Reshape on a flat surface and dry away from heat sources. Wool can take 24-48 hours to dry completely; this is normal.' },
      { title: 'Ironing', content: 'Steam is preferred over direct ironing. If ironing is necessary, use the wool setting with a pressing cloth. Never iron directly on the surface as it can flatten the natural texture.' },
      { title: 'Storage', content: 'Always clean before storing. Fold neatly and store with cedar or lavender. Never hang wool garments — they stretch under their own weight. Allow garments to rest 24 hours between wearings to recover their shape.' },
    ],
  },
  {
    name: 'Linen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M7 2.2C6 4.7 6 8 6 8s3.3 0 5.8-1" strokeLinecap="round" />
        <path d="M17 2.2c1 2.5 1 5.8 1 5.8s-3.3 0-5.8-1" strokeLinecap="round" />
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      </svg>
    ),
    items: [
      { title: 'Washing', content: 'Machine wash warm (40°C/104°F) on a gentle cycle, or hand wash. Linen gets softer with each wash. Use mild detergent and avoid overloading the machine. Separate dark and light colors.' },
      { title: 'Drying', content: 'Line dry or lay flat. Linen dries quickly naturally. If using a tumble dryer, use low heat and remove while slightly damp to prevent over-drying and excessive wrinkling.' },
      { title: 'Ironing', content: 'Iron on high heat while damp for a crisp finish, or embrace the natural wrinkle that gives linen its character. A light mist of water before ironing helps achieve smooth results.' },
      { title: 'Storage', content: 'Store in a breathable fabric bag or on padded hangers. Linen does well hung, unlike knits. Avoid plastic storage as linen needs air circulation to prevent yellowing.' },
    ],
  },
  {
    name: 'Blended Fabrics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M2 12l10 5 10-5M2 17l10 5 10-5M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    items: [
      { title: 'Washing', content: 'Follow the care of the most delicate fiber in the blend. When in doubt, cold wash on gentle. Our cashmere-cotton blends should be treated as cashmere. Our wool-linen blends should be treated as wool.' },
      { title: 'Drying', content: 'Always lay flat to dry for any blend containing wool or cashmere. Cotton-linen blends can be hung or laid flat. Avoid all heat sources during drying.' },
      { title: 'Ironing', content: 'Use the lowest recommended heat setting among the fiber types in the blend. Always test on an inconspicuous area first. A pressing cloth is recommended for all blends.' },
      { title: 'Storage', content: 'Fold blends containing any animal fibers (wool, cashmere, alpaca). Use moth deterrents. Cotton-linen blends can be hung on padded hangers. Keep all garments in a cool, dry environment.' },
    ],
  },
]

const generalTips = [
  { title: 'Wash Less', description: 'Most garments don\'t need washing after every wear. Spot clean stains and air out between wearings to extend the life of your clothes.' },
  { title: 'Cold Water', description: 'Cold water is gentler on fibers, uses less energy, and prevents shrinkage. It works just as well for everyday cleaning.' },
  { title: 'Skip Dry Cleaning', description: 'Our garments are designed to be washed at home. Save dry cleaning for stubborn stains or heavily structured pieces.' },
  { title: 'Repair, Don\'t Replace', description: 'A small snag or loose thread isn\'t the end. We offer free lifetime repairs for all Snug&Knot garments. Contact us for details.' },
]

export default function CareInstructionsPage() {
  return (
    <div className="pt-32 pb-20 bg-ivory min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <p className="font-mono text-xs text-gold tracking-[0.4em] uppercase mb-4">
          Fiber Care
        </p>
        <TextReveal
          as="h1"
          className="text-4xl sm:text-5xl text-burgundy mb-4"
        >
          Care Instructions
        </TextReveal>
        <FadeIn delay={0.1}>
          <div className="w-16 h-px bg-gold mb-6" />
          <p className="text-wine/80 leading-relaxed mb-12">
            Every fiber has a memory. Treat it well and it will remember your shape, your warmth, your story. Here is how to keep the conversation going.
          </p>
        </FadeIn>

        {/* Material Sections */}
        {materials.map((material, i) => (
          <FadeIn key={material.name} delay={0.1 + i * 0.05}>
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-burgundy/5 flex items-center justify-center text-burgundy">
                  {material.icon}
                </div>
                <h2 className="font-heading text-2xl text-burgundy">
                  {material.name}
                </h2>
              </div>
              <div className="bg-parchment/50 rounded-sm p-6 sm:p-8 border border-gold/10">
                <Accordion items={material.items.map((item) => ({ title: item.title, content: item.content }))} />
              </div>
            </section>
          </FadeIn>
        ))}

        {/* General Tips */}
        <FadeIn delay={0.3}>
          <section className="mb-12">
            <h2 className="font-heading text-2xl text-burgundy mb-6">General Tips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {generalTips.map((tip) => (
                <div
                  key={tip.title}
                  className="p-5 bg-parchment/50 border border-gold/10 rounded-sm"
                >
                  <h3 className="font-heading text-lg text-burgundy mb-2">{tip.title}</h3>
                  <p className="text-sm text-wine/70 leading-relaxed">{tip.description}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Back link */}
        <div className="mt-10">
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
      </div>
    </div>
  )
}
