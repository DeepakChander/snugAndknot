'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { cn } from '@/lib/format'
import type { ProductImage } from '@/types/commerce'

/**
 * Product photographs. On a desktop every photograph is laid out at once in two columns (the buy
 * panel stays beside them); on a phone they swipe sideways with a counter. Any photograph opens
 * enlarged, where a click zooms in where you point.
 */
export default function FabricGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [zoomAt, setZoomAt] = useState<number | null>(null)
  const [index, setIndex] = useState(0)
  const strip = useRef<HTMLDivElement>(null)
  const count = images.length

  // Which photograph the phone strip is on, for the counter.
  const onScroll = useCallback(() => {
    const el = strip.current
    if (el) setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)))
  }, [])

  if (!count) return <div className="aspect-[3/4] bg-parchment" />

  return (
    <div data-gallery>
      {/* Desktop: all photographs, two per row (one large when there is a single one). */}
      <div className={cn('hidden gap-1.5 lg:grid', count > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
        {images.map((img, i) => (
          <button key={img.src} type="button" onClick={() => setZoomAt(i)} aria-label={`Enlarge image ${i + 1} of ${count}`} className="relative block aspect-[3/4] cursor-zoom-in overflow-hidden bg-bone">
            <Image src={img.src} alt={img.alt || title} fill loading={i < 2 ? 'eager' : undefined} fetchPriority={i === 0 ? 'high' : undefined} sizes={count > 1 ? '(min-width:1024px) 30vw' : '(min-width:1024px) 60vw'} className="object-cover" />
          </button>
        ))}
      </div>

      {/* Phone and tablet: swipe sideways. */}
      <div className="relative lg:hidden">
        <div ref={strip} onScroll={onScroll} className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory overflow-x-auto">
          {images.map((img, i) => (
            <button key={img.src} type="button" onClick={() => setZoomAt(i)} aria-label={`Enlarge image ${i + 1} of ${count}`} className="relative aspect-[3/4] w-full shrink-0 snap-start bg-bone">
              <Image src={img.src} alt={img.alt || title} fill loading={i === 0 ? 'eager' : undefined} fetchPriority={i === 0 ? 'high' : undefined} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {count > 1 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden>
            {images.map((img, i) => (
              <span key={img.src} className={cn('h-1.5 w-1.5 rounded-full transition-colors', i === index ? 'bg-ink' : 'bg-ink/25')} />
            ))}
          </div>
        ) : null}
      </div>

      <Overlay open={zoomAt !== null} onClose={() => setZoomAt(null)} label={`${title}, enlarged`} side="center" className="bg-ivory" backdropClassName="bg-ivory/95">
        {zoomAt !== null ? <ZoomView images={images} index={zoomAt} setIndex={setZoomAt} onClose={() => setZoomAt(null)} title={title} /> : null}
      </Overlay>
    </div>
  )
}

function ZoomView({ images, index, setIndex, onClose, title }: { images: ProductImage[]; index: number; setIndex: (n: number) => void; onClose: () => void; title: string }) {
  const [origin, setOrigin] = useState('50% 50%')
  const [zoomed, setZoomed] = useState(false)
  return (
    <div className="relative h-[86dvh]">
      <CloseButton onClick={onClose} className="absolute right-4 top-4 z-10 text-ink" />
      <div
        className="relative h-full w-full cursor-zoom-in overflow-hidden"
        onClick={() => setZoomed((z) => !z)}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
        }}
      >
        <Image
          src={images[index].src}
          alt={images[index].alt || title}
          fill
          sizes="92vw"
          className="object-contain transition-transform duration-500 ease-out"
          style={{ transform: zoomed ? 'scale(2.2)' : 'scale(1)', transformOrigin: origin }}
        />
      </div>
      {images.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {images.map((img, i) => (
            <button key={img.src} type="button" onClick={() => setIndex(i)} aria-label={`Show image ${i + 1}`} className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-8 bg-ink' : 'w-3 bg-ink/25')} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
