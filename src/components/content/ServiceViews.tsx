'use client'

import Image from 'next/image'
import Link from 'next/link'
import PageHero from './PageHero'
import Reveal, { RevealGroup, RevealItem } from '@/components/motion/Reveal'
import { ButtonLink } from '@/components/kit/Button'
import { AccordionItem } from '@/components/kit/Accordion'
import SizeGuideTable from '@/components/product/SizeGuideTable'
import { useMoney, useSettings, useCurrency } from '@/components/providers/SettingsProvider'
import { PackageIcon, ReturnIcon, TruckIcon } from '@/components/kit/icons'
import { deliveryText, paymentText, refundText, returnShippingText } from '@/lib/policy'

export function ShippingView() {
  const { commerce, store } = useSettings()
  const money = useMoney()
  const { currency: cur } = useCurrency()
  const steps = [
    { title: 'Order placed', body: 'You receive an order number straight away. Keep it to track your parcel.' },
    { title: 'Checked and packed', body: 'Each piece is checked, folded and packed with care.' },
    { title: 'On its way', body: 'A tracking number appears in your account (or on Track an order) once it ships.' },
    {
      title: 'Delivered',
      body: commerce.deliveryEstimate?.trim() ? `Usually ${commerce.deliveryEstimate.trim()} after you order. Your return window opens.` : 'Your return window opens.',
    },
  ]
  const delivery = deliveryText(commerce)
  const payment = paymentText(commerce)
  return (
    <>
      <PageHero eyebrow="Customer care" title="Shipping & *returns*" intro={[delivery, 'How your order reaches you, and how to send a piece back if it is not quite right.'].filter(Boolean).join(' ')} image="/images/blog/wardrobe-essentials.png" />
      <section className="bg-ivory pb-24 text-ink" aria-label="Shipping rates">
        <div className="container-wide">
          <RevealGroup className="grid gap-4 md:grid-cols-3">
            <RevealItem className="border border-ink/10 p-8">
              <TruckIcon size={26} className="text-ink" />
              <p className="mt-8 text-eyebrow text-stone">Standard</p>
              <p data-money className="mt-2 text-[2rem] font-medium leading-none">{money(cur.standardShippingRate)}</p>
              {cur.freeShippingThreshold > 0 ? <p data-money className="mt-3 text-sm text-stone">Free on orders over {money(cur.freeShippingThreshold)} (after discounts).</p> : null}
            </RevealItem>
            <RevealItem className="border border-ink/10 p-8">
              <PackageIcon size={26} className="text-ink" />
              <p className="mt-8 text-eyebrow text-stone">Express</p>
              <p data-money className="mt-2 text-[2rem] font-medium leading-none">{money(cur.expressShippingRate)}</p>
              <p className="mt-3 text-sm text-stone">Priority dispatch, chosen at checkout.</p>
            </RevealItem>
            <RevealItem className="border border-ink/10 p-8">
              <ReturnIcon size={26} className="text-ink" />
              <p className="mt-8 text-eyebrow text-stone">Returns</p>
              <p className="mt-2 text-[2rem] font-medium leading-none">{commerce.returnWindowDays} days</p>
              <p className="mt-3 text-sm text-stone">From delivery, for unworn pieces in their original condition. Refunds within {commerce.refundDays || 7} working days.</p>
            </RevealItem>
          </RevealGroup>

          <div className="mt-24">
            <h2 className="text-headline">From our hands to yours</h2>
            <ol className="relative mt-12 grid gap-8 md:grid-cols-4">
              <span className="absolute left-0 right-0 top-[18px] hidden h-px bg-ink/10 md:block" aria-hidden />
              {steps.map((s, i) => (
                <li key={s.title} className="relative list-none">
                  <Reveal delay={i * 0.08}>
                    <span className="relative z-[1] flex h-9 w-9 items-center justify-center rounded-full bg-ink font-mono text-xs text-ivory">{String(i + 1).padStart(2, '0')}</span>
                    <p className="mt-6 text-[1.25rem] font-medium">{s.title}</p>
                    <p className="mt-2 text-sm text-stone">{s.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-24 grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-headline">Returning a piece</h2>
              <p className="mt-5 max-w-md text-stone">Pieces must be unworn, unwashed and in their original condition, with any tags still attached, and the return started within {commerce.returnWindowDays} days of delivery.</p>
              <p className="mt-3 max-w-md text-stone">{returnShippingText(commerce)}</p>
              {payment ? <p className="mt-3 max-w-md text-stone">{payment}</p> : null}
              <ButtonLink href="/account/orders" className="mt-8" arrow>
                Start a return
              </ButtonLink>
            </div>
            <div>
              <AccordionItem title="How do I start a return?" defaultOpen>
                <p>Sign in, open the order and choose Start a return. Select the pieces and tell us why. We will reply with the next steps. Ordered as a guest? Email {store.email} with your order number.</p>
              </AccordionItem>
              <AccordionItem title="When is my refund issued?">
                <p>{refundText(commerce)}</p>
              </AccordionItem>
              <AccordionItem title="Who pays for return shipping?">
                <p>{returnShippingText(commerce)}</p>
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
  { name: 'Knitwear', image: '/images/categories/women-knitwear.webp', steps: ['Hand wash or use the wool cycle, cold, with a gentle detergent.', 'Never wring: press the water out in a towel.', 'Dry flat in its natural shape, away from direct heat.'], note: 'Knits need washing less often than you think: airing them out between wears goes a long way.' },
  { name: 'Shirts, T-shirts & polos', image: '/images/categories/men-t-shirts.webp', steps: ['Wash cold or warm, inside out, with similar colours.', 'Shake out and hang to dry; tumble dry low only if the label allows.', 'Iron on the reverse while slightly damp for a crisp finish.'], note: 'Turning prints and dark colours inside out keeps them looking new for longer.' },
  { name: 'Denim, trousers & cargos', image: '/images/categories/men-jeans.webp', steps: ['Wash inside out, cold, with the zip and buttons done up.', 'Wash dark denim on its own for the first few washes.', 'Hang to dry to keep the shape and avoid shrinking.'], note: 'Denim softens and fits better with wear: wash it only when it needs it.' },
]

export function CareView() {
  return (
    <>
      <PageHero eyebrow="Care guide" title="Caring for your *clothes*" intro="A few simple habits keep every piece looking good for longer. Always check the care label first: it has the final word." image="/images/lookbook/soft-focus-2.png" />
      <section className="bg-ivory pb-24 text-ink" aria-label="By type">
        <div className="container-wide space-y-6">
          {FIBRES.map((f, i) => (
            <Reveal key={f.name} delay={0.05 * i}>
              <article className="grid overflow-hidden bg-bone/70 md:grid-cols-[1fr_1.3fr]">
                <div className="relative aspect-[4/3] md:aspect-auto">
                  <Image src={f.image} alt="" fill sizes="(min-width:768px) 40vw, 100vw" className="object-cover" />
                </div>
                <div className="p-8 md:p-12">
                  <p className="font-mono text-xs text-burgundy">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="mt-3 text-[1.6rem] font-medium">{f.name}</h2>
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
              ['Fold knits, hang shirts', 'Hangers stretch the shoulders of knitwear; shirts and trousers keep their shape on them.'],
              ['Less heat', 'Cooler washes and air drying save colour and stop shrinking.'],
              ['Mind the pills', 'A little pilling on knits is natural; remove it gently with a fabric comb.'],
            ].map(([t, b]) => (
              <div key={t} className="border border-ink/10 p-7">
                <p className="text-[1.05rem] font-medium">{t}</p>
                <p className="mt-2 text-sm text-stone">{b}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-6 bg-signal p-10 text-bone [&_:focus-visible]:outline-bone">
            <p className="max-w-lg text-[1.3rem] font-medium leading-tight">A loose button or a pulled thread? Write to us and we will help.</p>
            <ButtonLink href="/contact" variant="light" arrow>
              Contact us
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
          <div className="relative hidden aspect-[3/4] overflow-hidden lg:block">
            <Image src="/images/products/women/ivory-cable-cardigan-2.jpg" alt="" fill sizes="35vw" className="object-cover" />
          </div>
        </div>
      </section>
    </>
  )
}
