'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { hasWebGL, useInView } from '@/hooks/use-in-view'
import { prefersReducedMotion } from '@/lib/motion/gsap'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { ArrowLeft, ArrowRight } from '@/components/kit/icons'
import { cn } from '@/lib/format'
import type { ProductImage } from '@/types/commerce'

const FabricPlane = dynamic(() => import('@/components/three/FabricPlane'), { ssr: false })

/**
 * Product photographs rendered as a hanging knit panel (WebGL): it sways, ripples under
 * the pointer and changes image with a ribbed pleat transition. Falls back to a plain
 * crossfade without WebGL or with reduced motion.
 */
export default function FabricGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [index, setIndex] = useState(0)
  const [gl, setGl] = useState<boolean | null>(null)
  const [glReady, setGlReady] = useState(false)
  const [zoom, setZoom] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const inView = useInView(stage, '100px 0px')
  const touch = useRef<{ x: number; t: number } | null>(null)
  const count = images.length

  useEffect(() => setGl(hasWebGL() && !prefersReducedMotion() && count > 0), [count])

  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count])
  const onReady = useCallback(() => setGlReady(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!stage.current?.matches(':hover') && document.activeElement?.closest('[data-gallery]') == null) return
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  if (!count) return <div className="aspect-[3/4] rounded-[1.5rem] bg-parchment" />

  return (
    <div data-gallery className="lg:sticky lg:top-[calc(var(--nav-offset)+1rem)]">
      <div
        ref={stage}
        className="group relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-parchment"
        data-cursor="view"
        data-cursor-label="Zoom"
        onClick={() => setZoom(true)}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, t: Date.now() })}
        onTouchEnd={(e) => {
          const start = touch.current
          if (!start) return
          const dx = e.changedTouches[0].clientX - start.x
          if (Math.abs(dx) > 40 && Date.now() - start.t < 600) {
            e.preventDefault()
            go(dx < 0 ? 1 : -1)
          }
        }}
      >
        {/* Static image: first paint, SEO, and the no-WebGL fallback */}
        <AnimatePresence initial={false}>
          {!gl || !glReady ? (
            <motion.div key={index} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <Image src={images[index].src} alt={images[index].alt || title} fill priority={index === 0} sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
            </motion.div>
          ) : null}
        </AnimatePresence>
        {gl ? (
          <div className={cn('absolute inset-0 transition-opacity duration-700', glReady ? 'opacity-100' : 'opacity-0')}>
            <FabricPlane images={images.map((i) => i.src)} index={index} active={inView} onReady={onReady} />
          </div>
        ) : null}

        {count > 1 ? (
          <>
            <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between opacity-100 transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100">
              <button type="button" onClick={(e) => (e.stopPropagation(), go(-1))} aria-label="Previous image" data-cursor="hover" className="flex h-11 w-11 items-center justify-center rounded-full bg-ivory/80 backdrop-blur hover:bg-ivory">
                <ArrowLeft size={18} />
              </button>
              <button type="button" onClick={(e) => (e.stopPropagation(), go(1))} aria-label="Next image" data-cursor="hover" className="flex h-11 w-11 items-center justify-center rounded-full bg-ivory/80 backdrop-blur hover:bg-ivory">
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-ivory/80 px-3 py-1 font-mono text-xs backdrop-blur" aria-live="polite">
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </div>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="mt-4 flex gap-3" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Image ${i + 1}: ${img.alt}`}
              onClick={() => setIndex(i)}
              className={cn('relative aspect-[3/4] w-16 overflow-hidden rounded-xl transition-all duration-500 md:w-20', i === index ? 'ring-2 ring-ink ring-offset-2 ring-offset-ivory' : 'opacity-60 hover:opacity-100')}
            >
              <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      <Overlay open={zoom} onClose={() => setZoom(false)} label={`${title} — enlarged`} side="center" className="bg-noir" backdropClassName="bg-noir/90">
        <ZoomView images={images} index={index} setIndex={setIndex} onClose={() => setZoom(false)} title={title} />
      </Overlay>
    </div>
  )
}

function ZoomView({ images, index, setIndex, onClose, title }: { images: ProductImage[]; index: number; setIndex: (n: number) => void; onClose: () => void; title: string }) {
  const [origin, setOrigin] = useState('50% 50%')
  const [zoomed, setZoomed] = useState(false)
  return (
    <div className="relative h-[86dvh]">
      <CloseButton onClick={onClose} className="absolute right-4 top-4 z-10 text-bone" />
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
            <button key={img.src} type="button" onClick={() => setIndex(i)} aria-label={`Show image ${i + 1}`} className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-8 bg-gold' : 'w-3 bg-bone/30')} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
