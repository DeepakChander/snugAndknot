'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import SplitReveal from '@/components/motion/SplitReveal'
import { ButtonLink } from '@/components/kit/Button'
import { ProductPrice } from '@/components/kit/Price'
import { accent } from '@/lib/accent'
import { cn } from '@/lib/format'
import type { Collection, Product } from '@/types/commerce'

const TONES = [
  { sheet: 'bg-butter text-ink', soft: 'text-ink/65', line: 'border-ink/15', button: 'primary' as const },
  { sheet: 'bg-sage text-ink', soft: 'text-ink/80', line: 'border-ink/15', button: 'primary' as const },
  { sheet: 'bg-clay text-ink', soft: 'text-ink/80', line: 'border-ink/15', button: 'primary' as const },
  { sheet: 'bg-plum text-bone', soft: 'text-bone/70', line: 'border-bone/20', button: 'light' as const },
]

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']

/** "Winter Warmth" → WINTER *warmth*: the last word becomes the italic accent unless the admin marked one. */
function sheetTitle(title: string) {
  if (title.includes('*')) return accent(title)
  const words = title.trim().split(/\s+/)
  if (words.length < 2) return title
  return (
    <>
      {words.slice(0, -1).join(' ')} <em>{words[words.length - 1]}</em>
    </>
  )
}

function Sheet({ collection, index, total, pieces }: { collection: Collection; index: number; total: number; pieces: Product[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const tone = TONES[index % TONES.length]
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const t = [0, 0.42, 0.62, 1]
  const amp = reduce ? 0 : 1
  // The sheet is dealt in tilted, lands flat, holds, then is thrown up and away. The last one stays
  // flat and leaves with the page, so no empty band opens up before the next section.
  const last = index === total - 1
  const y = useTransform(scrollYProgress, t, [`${45 * amp}vh`, '0vh', last ? '0vh' : `${5 * amp}vh`, last ? '0vh' : `${-28 * amp}vh`])
  const x = useTransform(scrollYProgress, t, [`${12 * amp}vw`, '0vw', '0vw', last ? '0vw' : `${-12 * amp}vw`])
  const rotate = useTransform(scrollYProgress, t, [13 * amp, 0, 0, last ? 0 : -7 * amp])
  // The photograph moves on its own, slower path inside the sheet.
  const imgY = useTransform(scrollYProgress, t, [`${20 * amp}vh`, `${8 * amp}vh`, '0vh', `${16 * amp}vh`])
  const imgRotate = useTransform(scrollYProgress, t, [9 * amp, 2 * amp, 0, 3 * amp])

  return (
    <div ref={ref} className="relative h-[78svh] md:h-[64svh]" style={{ zIndex: index + 1 }}>
      <motion.article
        style={{ x, y, rotate }}
        className={cn('relative flex h-[100svh] min-h-[640px] origin-[0%_30%] flex-col overflow-hidden rounded-[1.75rem] p-5 shadow-[0_40px_80px_-40px_rgba(15,14,13,0.45)] md:p-9', tone.sheet)}
      >
        <header className={cn('flex items-center justify-between border-b pb-4 text-label', tone.line)}>
          <span className="tabular-nums">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="slash hidden sm:inline">{collection.subtitle || 'Collection'}</span>
          <span>{pieces.length ? `${pieces.length} piece${pieces.length === 1 ? '' : 's'}` : 'Coming soon'}</span>
        </header>

        <div className="grid flex-1 grid-rows-[auto_1fr] gap-6 pt-6 md:grid-cols-12 md:grid-rows-none md:gap-10 md:pt-10">
          <div className="flex flex-col md:col-span-6">
            <h3 className="text-[clamp(2.8rem,7.4vw,8.4rem)] font-semibold uppercase leading-[0.84] tracking-[-0.055em]">
              <Link href={`/collections/${collection.handle}`} className="hover:opacity-80">
                {sheetTitle(collection.title)}
              </Link>
            </h3>
            {collection.description ? <p className={cn('mt-6 hidden max-w-md text-lead md:block', tone.soft)}>{collection.description}</p> : null}

            {pieces.length ? (
              <ul className="mt-auto hidden gap-3 pt-8 md:grid md:grid-cols-3">
                {pieces.slice(0, 3).map((p) => (
                  <li key={p.id}>
                    <Link href={`/product/${p.handle}`} className="group block">
                      <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-bone/40">
                        {p.images[0] ? (
                          <Image src={p.images[0].src} alt={p.images[0].alt || p.title} fill sizes="12vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                        ) : null}
                      </span>
                      <span className="mt-2 block truncate text-sm font-medium tracking-[-0.01em]">{p.title}</span>
                      <ProductPrice product={p} showCompareAt={false} className={cn('text-xs', tone.soft)} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-6 md:mt-8">
              <ButtonLink href={`/collections/${collection.handle}`} variant={tone.button} size="md" arrow>
                Shop the collection
              </ButtonLink>
            </div>
          </div>

          <div className="relative min-h-[34svh] md:col-span-6 md:min-h-0">
            <motion.div style={{ y: imgY, rotate: imgRotate }} className="absolute inset-0 overflow-hidden rounded-[1.25rem] bg-bone/30">
              {collection.image ? (
                <Image src={collection.image} alt={`${collection.title} collection`} fill sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" />
              ) : null}
            </motion.div>
          </div>
        </div>
      </motion.article>
    </div>
  )
}

/** Collections dealt like sheets of paper — every moment of the scroll has something moving. */
export default function CollectionSheets({ collections, products }: { collections: Collection[]; products: Product[] }) {
  const shown = collections.filter((c) => c.featured || collections.length <= 4).slice(0, 6)
  if (!shown.length) return null
  const byId = new Map(products.map((p) => [p.id, p]))

  return (
    <section data-nav-theme="light" aria-labelledby="collections-title" className="relative overflow-x-clip bg-ivory pb-[40svh] text-ink">
      <div className="container-wide grid gap-6 pb-[clamp(3rem,7vw,6rem)] pt-[clamp(5rem,10vw,9rem)] md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="text-eyebrow slash text-stone">Collections — {String(shown.length).padStart(2, '0')}</p>
          <SplitReveal as="h2" id="collections-title" className="mt-5 text-display">
            {WORDS[shown.length] ?? shown.length} edits, <em>one wardrobe</em>
          </SplitReveal>
        </div>
        <div className="flex flex-col items-start justify-end gap-5 md:col-span-4 md:items-end md:text-right">
          <p className="max-w-xs text-stone">Each edit gathers pieces made to be worn together. Keep scrolling to go through them.</p>
          <ButtonLink href="/collections" variant="outline" size="sm" arrow>
            All collections
          </ButtonLink>
        </div>
      </div>

      <div className="container-wide">
        {shown.map((c, i) => (
          <Sheet key={c.id} collection={c} index={i} total={shown.length} pieces={c.productIds.map((id) => byId.get(id)).filter((p): p is Product => !!p)} />
        ))}
      </div>
    </section>
  )
}
