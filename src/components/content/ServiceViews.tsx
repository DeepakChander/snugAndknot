'use client'

import Image from 'next/image'
import Link from 'next/link'
import PageHero from './PageHero'
import Reveal, { RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/kit/Button'
import { AccordionItem } from '@/components/kit/Accordion'
import SizeGuideTable from '@/components/product/SizeGuideTable'
import { useMoney, useSettings } from '@/components/providers/SettingsProvider'
import { PackageIcon, ReturnIcon, TruckIcon } from '@/components/kit/icons'

export function ShippingView() {
  const { commerce, store } = useSettings()
  const money = useMoney()
  const steps = [
    { title: 'Order placed', body: 'You receive an order number straight away. Keep it to track your parcel.' },
    { title: 'Prepared by hand', body: 'Each piece is checked, folded and packed in the atelier.' },
    { title: 'On its way', body: 'A tracking number appears in your account (or on Track an order) once it ships.' },
    {
      title: 'Delivered',
      body: commerce.codEnabled
        ? commerce.onlinePaymentsEnabled
          ? 'If you chose pay on delivery, pay the courier now. Your return window opens.'
          : 'Pay the courier on delivery. Your return window opens.'
        : 'Your return window opens.',
    },
  ]
  return (
    <>
      <PageHero eyebrow="Client care" title="Shipping & *returns*" intro="How your knitwear reaches you, and how to send it back if it is not quite right." image="/images/blog/wardrobe-essentials.png" />
      <section className="bg-ivory pb-24 text-ink" aria-label="Shipping rates">
        <div className="container-wide">
          <RevealGroup className="grid gap-4 md:grid-cols-3">
            <RevealItem className="rounded-[1.75rem] bg-noir p-8 text-bone">
              <TruckIcon size={28} className="text-gold" />
              <p className="mt-8 text-eyebrow text-bone/50">Standard</p>
              <p className="mt-2 font-display text-5xl">{money(commerce.standardShippingRate)}</p>
              {commerce.freeShippingThreshold > 0 ? <p className="mt-3 text-sm text-bone/60">Free on orders over {money(commerce.freeShippingThreshold)} (after discounts).</p> : null}
            </RevealItem>
            <RevealItem className="rounded-[1.75rem] border border-ink/10 p-8">
              <PackageIcon size={28} className="text-burgundy" />
              <p className="mt-8 text-eyebrow text-stone">Express</p>
              <p className="mt-2 font-display text-5xl">{money(commerce.expressShippingRate)}</p>
              <p className="mt-3 text-sm text-stone">Priority dispatch, chosen at checkout.</p>
            </RevealItem>
            <RevealItem className="rounded-[1.75rem] border border-ink/10 p-8">
              <ReturnIcon size={28} className="text-burgundy" />
              <p className="mt-8 text-eyebrow text-stone">Returns</p>
              <p className="mt-2 font-display text-5xl">{commerce.returnWindowDays} days</p>
              <p className="mt-3 text-sm text-stone">From delivery, for unworn pieces in their original condition.</p>
            </RevealItem>
          </RevealGroup>

          <div className="mt-24">
            <h2 className="text-headline">From our hands to yours</h2>
            <ol className="relative mt-12 grid gap-8 md:grid-cols-4">
              <span className="absolute left-0 right-0 top-[18px] hidden h-px bg-ink/10 md:block" aria-hidden />
              {steps.map((s, i) => (
                <li key={s.title} className="relative list-none">
                  <Reveal delay={i * 0.08}>
                    <span className="relative z-[1] flex h-9 w-9 items-center justify-center rounded-full bg-gold font-mono text-xs text-ink">{String(i + 1).padStart(2, '0')}</span>
                    <p className="mt-6 font-display text-3xl">{s.title}</p>
                    <p className="mt-2 text-sm text-stone">{s.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-24 grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-headline">Returning a piece</h2>
              <p className="mt-5 max-w-md text-stone">Pieces must be unworn, unwashed and in their original condition, with any tags still attached.</p>
              <ButtonLink href="/account/orders" className="mt-8" arrow>
                Start a return
              </ButtonLink>
            </div>
            <div>
              <AccordionItem title="How do I start a return?" defaultOpen>
                <p>Sign in, open the order and choose Start a return. Select the pieces and tell us why. We will reply with the next steps. Ordered as a guest? Email {store.email} with your order number.</p>
              </AccordionItem>
              <AccordionItem title="When is my refund issued?">
                <p>Once we receive and check the returned pieces we confirm the refund amount and contact you to arrange it.</p>
              </AccordionItem>
              <AccordionItem title="Can I exchange for another size?">
                <p>Request a return for the original size and place a new order for the size you need — that way you are not waiting for the return to arrive.</p>
              </AccordionItem>
              <AccordionItem title="What if something arrives damaged?">
                <p>
                  Choose &ldquo;Arrived damaged or faulty&rdquo; when you start the return, or{' '}
                  <Link href="/contact" className="underline">
                    write to us
                  </Link>{' '}
                  with a photo — we will make it right.
                </p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

const FIBRES = [
  { name: 'Merino wool', image: '/images/collection-home/Material-Intimacy.png', steps: ['Hand wash cold with a wool detergent.', 'Never wring — press the water out in a towel.', 'Dry flat in its natural shape, away from heat.'], note: 'Merino breathes and resists odour, so it needs washing less than you think.' },
  { name: 'Cotton & cashmere', image: '/images/products/women/terracotta-textured-cardigan-2.jpg', steps: ['Gentle cycle, cold water, inside out.', 'Reshape while damp.', 'Dry flat; steam rather than iron.'], note: 'Cashmere softens with every gentle wash.' },
  { name: 'Cotton & silk', image: '/images/products/men/navy-tan-colorblock-tee-2.jpg', steps: ['Cold, gentle wash with similar colours.', 'Avoid tumble drying to keep the sheen.', 'Cool iron on the reverse if needed.'], note: 'Silk gives the knit its soft lustre — keep it out of strong sun when drying.' },
]

export function CareView() {
  return (
    <>
      <PageHero eyebrow="Care guide" title="Caring for *knitwear*" intro="Treat a good knit well and it will remember your shape for years. A few gentle habits make all the difference." image="/images/lookbook/soft-focus-2.png" />
      <section className="bg-ivory pb-24 text-ink" aria-label="By fibre">
        <div className="container-wide space-y-6">
          {FIBRES.map((f, i) => (
            <Reveal key={f.name} delay={0.05 * i}>
              <article className="grid overflow-hidden rounded-[2rem] bg-bone/70 md:grid-cols-[1fr_1.3fr]">
                <div className="relative aspect-[4/3] md:aspect-auto">
                  <Image src={f.image} alt="" fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />
                </div>
                <div className="p-8 md:p-12">
                  <p className="font-mono text-xs text-burgundy">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="mt-3 font-display text-4xl">{f.name}</h2>
                  <ol className="mt-6 space-y-3">
                    {f.steps.map((s, j) => (
                      <li key={s} className="flex gap-4">
                        <span className="font-mono text-xs leading-6 text-stone">{j + 1}</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-6 text-sm text-stone">{f.note}</p>
                </div>
              </article>
            </Reveal>
          ))}
          <div className="grid gap-4 pt-12 md:grid-cols-3">
            {[
              ['Fold, never hang', 'Hangers stretch shoulders. Fold knits and store them flat.'],
              ['Rest between wears', 'A day off lets the fibres recover their shape.'],
              ['Mind the pills', 'A little pilling is natural; remove it gently with a knit comb.'],
            ].map(([t, b]) => (
              <div key={t} className="rounded-[1.5rem] border border-ink/10 p-7">
                <p className="font-display text-2xl">{t}</p>
                <p className="mt-2 text-sm text-stone">{b}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-[2rem] bg-signal p-10 text-bone [&_:focus-visible]:outline-bone">
            <p className="max-w-lg font-display text-3xl leading-tight">A loose button or a pulled thread? Write to us and we will help.</p>
            <ButtonLink href="/contact" variant="light" arrow>
              Contact the atelier
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}

export function SizeGuideView() {
  return (
    <>
      <PageHero eyebrow="Fit" title="Size *guide*" intro="Body measurements for every size we make. Each product page adds fit notes and what other customers found." />
      <section className="bg-ivory pb-24 text-ink">
        <div className="container-wide grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <SizeGuideTable />
          <div className="relative hidden aspect-[3/4] overflow-hidden rounded-[2rem] lg:block">
            <Image src="/images/products/women/ivory-cable-cardigan-2.jpg" alt="" fill sizes="35vw" className="object-cover" />
          </div>
        </div>
      </section>
    </>
  )
}
