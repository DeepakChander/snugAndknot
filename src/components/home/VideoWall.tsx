'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import SplitReveal from '@/components/motion/SplitReveal'
import { ButtonLink } from '@/components/kit/Button'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { ProductPrice } from '@/components/kit/Price'
import { ArrowLeft, ArrowRight, BagIcon, InstagramIcon } from '@/components/kit/icons'
import { cn } from '@/lib/format'
import { youtubeCommand, youtubeEmbed, type WallItem } from '@/lib/video'

const EASE = [0.16, 1, 0.3, 1] as const

/* ─────────────────────────── Small parts ─────────────────────────── */

function YouTubeGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" aria-hidden>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10 9.2 5 2.8-5 2.8z" fill="currentColor" />
    </svg>
  )
}

function PlayGlyph({ className }: { className?: string }) {
  return (
    <span className={cn('grid h-14 w-14 place-items-center rounded-full bg-bone/90 text-ink shadow-lg backdrop-blur', className)} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 4.5v15l13-7.5z" />
      </svg>
    </span>
  )
}

const sourceGlyph = (item: WallItem, size = 18) => (item.source.kind === 'youtube' ? <YouTubeGlyph size={size} /> : <InstagramIcon size={size} />)

/** Posters come from this site, the two photo hosts next/image optimises, or YouTube's thumbnail host (served as-is). */
function Poster({ src, sizes, className }: { src: string; sizes: string; className?: string }) {
  if (!src) return <div className={cn('knit-texture absolute inset-0 text-bone/15', className)} />
  const raw = src.startsWith('https://i.ytimg.com/') || src.startsWith('/api/media/')
  return <Image src={src} alt="" fill sizes={sizes} unoptimized={raw} className={cn('object-cover', className)} />
}

/** "@handle" and "#tag" in the intro line are set brighter than the rest. */
function Highlight({ text }: { text: string }) {
  return (
    <>
      {text.split(/([@#][A-Za-z0-9_.]*[A-Za-z0-9_])/g).map((part, i) =>
        i % 2 ? (
          <span key={i} className="text-bone">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}

/* ─────────────────────────── Playback hooks ─────────────────────────── */

/** Whether enough of `ref` is on screen to play, and whether it has ever been (to load embeds lazily). */
function useOnScreen(ref: React.RefObject<Element | null>, threshold = 0.35) {
  const [state, setState] = useState({ visible: false, seen: false })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        const visible = e.isIntersecting && e.intersectionRatio >= threshold
        setState((s) => (s.visible === visible ? s : { visible, seen: s.seen || visible }))
      },
      { threshold: [0, threshold] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
  return state
}

const REDUCED = '(prefers-reduced-motion: reduce)'
const subscribeReduced = (cb: () => void) => {
  const m = window.matchMedia(REDUCED)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
/** Live prefers-reduced-motion; false while hydrating so the server and client markup agree. */
function useReducedMotionPref() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false)
}

/** False while the tab is in the background, so nothing plays unseen. */
function usePageVisible() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const on = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])
  return visible
}

/* ─────────────────────────── Tile media ─────────────────────────── */

function FileClip({ src, active }: { src: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active) v.play().catch(() => {})
    else v.pause()
  }, [active])
  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
      className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-700', playing ? 'opacity-100' : 'opacity-0')}
    />
  )
}

/** Mounted only once the tile has been on screen; paused and resumed through the player's postMessage API. */
function YouTubeClip({ id, shorts, active, load }: { id: string; shorts: boolean; active: boolean; load: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const activeRef = useRef(active)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    activeRef.current = active
    youtubeCommand(ref.current, active ? 'playVideo' : 'pauseVideo')
  }, [active])
  if (!load) return null
  return (
    <iframe
      ref={ref}
      src={youtubeEmbed(id)}
      title="YouTube video"
      aria-hidden
      tabIndex={-1}
      loading="lazy"
      allow="autoplay; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => {
        if (!activeRef.current) youtubeCommand(ref.current, 'pauseVideo')
        // YouTube shows its title and controls for the first seconds of play: keep the poster up until they fade.
        window.setTimeout(() => setShown(true), 3200)
      }}
      className={cn(
        // Overscanned by 12% on each edge so YouTube's title bar and logo fall outside the tile.
        'pointer-events-none absolute -top-[12%] h-[124%] border-0 transition-opacity duration-700',
        // A landscape video is scaled to cover the portrait tile; Shorts already fit it.
        shorts ? '-left-[12%] w-[124%]' : 'left-1/2 w-[392%] -translate-x-1/2',
        shown ? 'opacity-100' : 'opacity-0'
      )}
    />
  )
}

/* ─────────────────────────── Tile ─────────────────────────── */

function Tile({ item, index, paused, reduced, onOpen }: { item: WallItem; index: number; paused: boolean; reduced: boolean; onOpen: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null)
  const { visible, seen } = useOnScreen(ref)
  const pageVisible = usePageVisible()
  const active = visible && pageVisible && !paused && !reduced
  const n = item.products.length
  const { source } = item
  const label = [
    source.kind === 'instagram' ? 'Watch on Instagram (opens in a new tab)' : `Play video ${index + 1}`,
    item.caption,
    item.credit ? `by ${item.credit}` : '',
    n ? `${n} piece${n === 1 ? '' : 's'} tagged` : '',
  ]
    .filter(Boolean)
    .join(', ')

  const body: ReactNode = (
    <div data-reveal className="relative aspect-[9/16] overflow-hidden rounded-[1.1rem] bg-umber ring-1 ring-bone/10 transition-shadow duration-700 group-hover/tile:shadow-[0_40px_70px_-30px_rgba(0,0,0,0.85)] group-focus-visible/tile:ring-2 group-focus-visible/tile:ring-gold">
      <div data-zoom className="absolute inset-0">
        <Poster src={item.poster} sizes="(min-width: 768px) 25vw, 50vw" className="transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/tile:scale-[1.04]" />
        {source.kind === 'file' && !reduced ? <FileClip src={source.src} active={active} /> : null}
        {source.kind === 'youtube' && !reduced ? <YouTubeClip id={source.id} shorts={source.shorts} active={active} load={seen} /> : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-noir/85 via-noir/25 to-transparent opacity-50 transition-opacity duration-500 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100" />

      {n ? (
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-bone py-1 pl-1.5 pr-2 text-ink shadow-[0_4px_14px_-4px_rgba(0,0,0,0.5)]">
          <BagIcon size={14} strokeWidth={1.8} />
          <span className="font-mono text-[0.72rem] font-medium leading-none tabular-nums">{n}</span>
        </span>
      ) : null}

      {reduced || source.kind === 'instagram' ? <PlayGlyph className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 group-hover/tile:scale-110" /> : null}

      <div className="absolute inset-x-3 bottom-3 pr-8">
        {item.caption ? (
          <p className="line-clamp-3 translate-y-3 text-[0.9rem] leading-snug text-bone opacity-0 transition duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover/tile:translate-y-0 group-hover/tile:opacity-100 group-focus-visible/tile:translate-y-0 group-focus-visible/tile:opacity-100 [@media(hover:none)]:hidden">
            {item.caption}
          </p>
        ) : null}
        {item.credit ? <p className="mt-1.5 truncate font-mono text-[0.7rem] tracking-wide text-bone/85">{item.credit}</p> : null}
      </div>
      <span className="absolute bottom-3 right-3 text-bone drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">{sourceGlyph(item)}</span>
    </div>
  )

  const shell = 'group/tile relative block w-full rounded-[1.1rem] text-left outline-none transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] md:hover:-translate-y-2 focus-visible:-translate-y-2'
  return (
    <li ref={ref} data-drift>
      {source.kind === 'instagram' && !n ? (
        <a href={source.href} target="_blank" rel="noopener noreferrer" aria-label={label} data-cursor="view" data-cursor-label="Open" className={shell}>
          {body}
        </a>
      ) : (
        <button type="button" onClick={() => onOpen(index)} aria-label={label} aria-haspopup="dialog" data-cursor="view" data-cursor-label="Play" className={shell}>
          {body}
        </button>
      )}
    </li>
  )
}

/* ─────────────────────────── Viewer ─────────────────────────── */

function Stage({ item, muted, playing, onProgress, onEnded }: { item: WallItem; muted: boolean; playing: boolean; onProgress: (p: number) => void; onEnded?: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const state = useRef({ muted, playing })
  const { source } = item

  useEffect(() => {
    state.current = { muted, playing }
    const v = video.current
    if (v) {
      v.muted = muted
      if (playing) v.play().catch(() => {})
      else v.pause()
    }
    youtubeCommand(frame.current, muted ? 'mute' : 'unMute')
    youtubeCommand(frame.current, playing ? 'playVideo' : 'pauseVideo')
  }, [muted, playing])

  return (
    <>
      <Poster src={item.poster} sizes="(min-width: 768px) 45vh, 90vw" />
      {source.kind === 'file' ? (
        <video
          ref={video}
          src={source.src}
          autoPlay
          muted
          loop={!onEnded}
          playsInline
          disablePictureInPicture
          aria-label={item.caption || 'Video'}
          onTimeUpdate={(e) => {
            const v = e.currentTarget
            if (v.duration) onProgress(v.currentTime / v.duration)
          }}
          onEnded={onEnded}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {source.kind === 'youtube' ? (
        <iframe
          ref={frame}
          src={youtubeEmbed(source.id)}
          title={item.caption || 'YouTube video'}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => {
            youtubeCommand(frame.current, state.current.muted ? 'mute' : 'unMute')
            if (!state.current.playing) youtubeCommand(frame.current, 'pauseVideo')
          }}
          className="pointer-events-none absolute inset-0 h-full w-full border-0"
        />
      ) : null}
      {source.kind === 'instagram' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-noir/35 p-6 text-center">
          <PlayGlyph />
          <a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 font-display text-sm font-medium text-ink transition-colors hover:bg-butter" onPointerDownCapture={(e) => e.stopPropagation()}>
            <InstagramIcon size={16} /> Watch on Instagram <span aria-hidden>↗</span>
          </a>
        </div>
      ) : null}
    </>
  )
}

function IconCircle({ label, onClick, children, className }: { label: string; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      data-cursor="hover"
      className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full border border-bone/20 bg-noir/40 text-bone backdrop-blur transition-colors hover:bg-bone hover:text-ink focus-visible:outline-2 focus-visible:outline-gold', className)}
    >
      {children}
    </button>
  )
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      {muted ? <path d="m16 9.5 5 5m0-5-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
    </svg>
  )
}

function Viewer({ items, index, onIndex, onClose }: { items: WallItem[]; index: number | null; onIndex: (i: number, dir: number) => void; onClose: () => void }) {
  const open = index !== null
  const i = index ?? 0
  const item = items[i]
  const [dir, setDir] = useState(1)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const many = items.length > 1

  const go = useCallback(
    (d: number) => {
      if (!many) return
      setDir(d)
      setProgress(0)
      setPlaying(true)
      onIndex((i + d + items.length) % items.length, d)
    },
    [i, items.length, many, onIndex]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'm' || e.key === 'M') setMuted((m) => !m)
      else return
      e.preventDefault()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, go])

  const close = () => {
    setProgress(0)
    setMuted(true)
    setPlaying(true)
    onClose()
  }

  return (
    <Overlay open={open} onClose={close} label="Video viewer" side="full" className="bg-noir text-bone" backdropClassName="bg-noir/90">
      {item ? (
        <div className="flex h-full flex-col md:flex-row">
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-4 md:p-6">
            <p className="font-mono text-xs tabular-nums text-bone/70" aria-live="polite">
              {String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </p>
            <CloseButton onClick={close} className="bg-noir/40 backdrop-blur" label="Close video" />
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center gap-6 px-4 pb-3 pt-[4.25rem] md:px-8 md:py-8">
            {many ? (
              <IconCircle label="Previous video" onClick={() => go(-1)} className="hidden md:grid">
                <ArrowLeft size={18} />
              </IconCircle>
            ) : null}

            <div className="relative h-full max-h-[calc(100dvh-4.5rem)] min-h-0 aspect-[9/16] max-w-full">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.div
                  key={item.id}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ x: d * 90, opacity: 0, scale: 0.96 }),
                    center: { x: 0, opacity: 1, scale: 1 },
                    exit: (d: number) => ({ x: d * -90, opacity: 0, scale: 0.96 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: EASE }}
                  drag={many ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60 || info.velocity.x < -500) go(1)
                    else if (info.offset.x > 60 || info.velocity.x > 500) go(-1)
                  }}
                  className="absolute inset-0 touch-pan-y overflow-hidden rounded-[1.25rem] bg-umber shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
                >
                  <Stage item={item} muted={muted} playing={playing} onProgress={setProgress} />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-noir/60 to-transparent" />
                  {many ? (
                    <div className="pointer-events-none absolute inset-x-3 top-3 flex gap-1" aria-hidden>
                      {items.map((x, j) => (
                        <span key={x.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-bone/25">
                          <span className="block h-full rounded-full bg-bone" style={{ width: j < i ? '100%' : j > i ? '0%' : item.source.kind === 'file' ? `${Math.round(progress * 100)}%` : '100%' }} />
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {item.source.kind !== 'instagram' ? (
                    <div className="absolute bottom-3 right-3 flex gap-2">
                      <IconCircle label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying((p) => !p)}>
                        {playing ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M7 4.5v15l13-7.5z" />
                          </svg>
                        )}
                      </IconCircle>
                      <IconCircle label={muted ? 'Turn sound on' : 'Mute'} onClick={() => setMuted((m) => !m)}>
                        <SoundIcon muted={muted} />
                      </IconCircle>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {many ? (
              <IconCircle label="Next video" onClick={() => go(1)} className="hidden md:grid">
                <ArrowRight size={18} />
              </IconCircle>
            ) : null}
          </div>

          <aside className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:flex md:h-full md:w-[400px] md:flex-col md:overflow-y-auto md:border-l md:border-bone/10 md:px-8 md:pb-8 md:pt-24" data-lenis-prevent>
            <div className="flex items-center gap-2 text-bone/80">
              {sourceGlyph(item, 16)}
              {item.credit ? <span className="truncate font-mono text-xs tracking-wide">{item.credit}</span> : null}
              {many ? (
                <span className="ml-auto flex gap-2 md:hidden">
                  <IconCircle label="Previous video" onClick={() => go(-1)} className="h-9 w-9">
                    <ArrowLeft size={15} />
                  </IconCircle>
                  <IconCircle label="Next video" onClick={() => go(1)} className="h-9 w-9">
                    <ArrowRight size={15} />
                  </IconCircle>
                </span>
              ) : null}
            </div>
            {item.caption ? <p className="mt-2 line-clamp-2 text-[0.95rem] leading-snug text-bone md:mt-4 md:line-clamp-none md:font-display md:text-[1.6rem] md:font-medium md:leading-[1.08] md:tracking-[-0.03em]">{item.caption}</p> : null}

            {item.products.length ? (
              <div className="mt-3 md:mt-10">
                <p className="text-eyebrow slash text-bone/50">
                  In this video · {item.products.length} piece{item.products.length === 1 ? '' : 's'}
                </p>
                {/* relative: contains the absolutely positioned sr-only text in Price, which would otherwise widen the dialog */}
                <ul className="no-scrollbar relative -mx-4 mt-3 flex snap-x gap-2.5 overflow-x-auto px-4 md:mx-0 md:flex-col md:overflow-visible md:px-0">
                  {item.products.map((p) => (
                    <li key={p.id} className="w-[min(82%,300px)] shrink-0 snap-start md:w-auto">
                      <Link href={`/product/${p.handle}`} onClick={close} data-cursor="hover" className="group flex items-center gap-3 rounded-2xl bg-bone/[0.07] p-2 pr-3.5 transition-colors hover:bg-bone/[0.14] focus-visible:outline-2 focus-visible:outline-gold">
                        <span className="relative h-[4.5rem] w-14 shrink-0 overflow-hidden rounded-xl bg-parchment md:h-24 md:w-[4.5rem]">
                          {p.image ? <Image src={p.image} alt="" fill sizes="72px" unoptimized={p.image.startsWith('/api/media/')} className="object-cover transition-transform duration-700 group-hover:scale-105" /> : <span className="knit-texture absolute inset-0 text-ink" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          {p.productType ? <span className="slash block truncate text-label text-bone/50">{p.productType}</span> : null}
                          <span className="mt-0.5 block truncate font-display text-[1.02rem] font-semibold leading-tight tracking-[-0.03em] md:text-[1.15rem]">{p.title}</span>
                          <ProductPrice product={p} className="mt-1 text-[0.78rem] text-bone/80" />
                        </span>
                        <ArrowRight size={16} className="shrink-0 text-bone/60 transition-transform duration-500 group-hover:translate-x-1 group-hover:text-bone" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-auto hidden pt-10 font-mono text-[0.68rem] text-bone/40 md:block">← → to browse · M for sound · Esc to close</p>
          </aside>
        </div>
      ) : null}
    </Overlay>
  )
}

/* ─────────────────────────── Section ─────────────────────────── */

/**
 * The shoppable video wall: customers' clips in a portrait grid that plays muted while on
 * screen. Each tile opens a full-screen viewer with sound and the pieces worn in it.
 */
export default function VideoWall({ heading, intro, ctaLabel, ctaHref, items }: { heading: string; intro: string; ctaLabel: string; ctaHref: string; items: WallItem[] }) {
  const root = useRef<HTMLElement>(null)
  const grid = useRef<HTMLUListElement>(null)
  const reduced = useReducedMotionPref()
  const [open, setOpen] = useState<number | null>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !grid.current) return
      const tiles = gsap.utils.toArray<HTMLElement>('[data-reveal]', grid.current)
      gsap.set(tiles, { clipPath: 'inset(100% 0% 0% 0% round 1.1rem)' })
      gsap.set(tiles.map((t) => t.querySelector('[data-zoom]')), { scale: 1.25 })
      ScrollTrigger.batch(tiles, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) => {
          gsap.to(batch, { clipPath: 'inset(0% 0% 0% 0% round 1.1rem)', duration: 1.4, ease: 'silk', stagger: 0.09 })
          gsap.to(
            batch.map((t) => (t as HTMLElement).querySelector('[data-zoom]')),
            { scale: 1, duration: 1.8, ease: 'silk', stagger: 0.09 }
          )
        },
      })

      // Alternate columns drift against the scroll, so the wall reads as hung, not tiled.
      const mm = gsap.matchMedia()
      const drift = (cols: number, amount: number) => {
        gsap.utils.toArray<HTMLElement>('[data-drift]', grid.current).forEach((el, i) => {
          if ((i % cols) % 2 === 0) return
          gsap.fromTo(el, { y: amount }, { y: -amount, ease: 'none', scrollTrigger: { trigger: grid.current, start: 'top bottom', end: 'bottom top', scrub: true } })
        })
      }
      mm.add('(min-width: 768px)', () => drift(4, 56))
      mm.add('(max-width: 767px)', () => drift(2, 22))
    },
    { scope: root, dependencies: [items.length] }
  )

  const onIndex = useCallback((i: number) => setOpen(i), [])
  // The tile that opened the viewer gets focus back on close, however it was opened (a mouse
  // click does not always leave the button focused, so the dialog's own restore can miss it).
  const opener = useRef<number | null>(null)
  const openAt = useCallback((i: number) => {
    opener.current = i
    setOpen(i)
  }, [])
  const closeViewer = useCallback(() => {
    setOpen(null)
    const i = opener.current
    requestAnimationFrame(() => {
      if (i === null) return
      grid.current?.children[i]?.querySelector<HTMLElement>('button, a')?.focus({ preventScroll: true })
    })
  }, [])

  const hash = heading.startsWith('#')
  return (
    <section ref={root} data-nav-theme="dark" aria-labelledby="video-wall-title" className="relative overflow-hidden bg-noir py-[clamp(5rem,10vw,9rem)] text-bone">
      <div className="container-wide flex flex-col items-center text-center">
        <p className="text-eyebrow slash text-bone/60">Worn by you</p>
        {heading ? (
          <SplitReveal as="h2" id="video-wall-title" type="chars" className="mt-5 max-w-full break-words font-display text-[clamp(2.75rem,9vw,9rem)] font-semibold leading-[0.86] tracking-[-0.06em]">
            {hash ? (
              <>
                <span className="text-signal">#</span>
                {heading.slice(1)}
              </>
            ) : (
              heading
            )}
          </SplitReveal>
        ) : (
          <h2 id="video-wall-title" className="sr-only">
            Customer videos
          </h2>
        )}
        {intro ? (
          <p className="mt-6 max-w-xl text-balance text-lead text-bone/65">
            <Highlight text={intro} />
          </p>
        ) : null}
        {ctaLabel && ctaHref ? (
          <ButtonLink href={ctaHref} external variant="light" size="md" magnetic icon={<InstagramIcon size={18} />} className="mt-8">
            {ctaLabel}
          </ButtonLink>
        ) : null}
      </div>

      <div className="container-wide mt-[clamp(3rem,6vw,5rem)]">
        <ul ref={grid} role="list" className="mx-auto grid max-w-[1400px] grid-cols-2 gap-2.5 pb-6 sm:gap-4 md:grid-cols-4 md:gap-5 md:pb-14">
          {items.map((item, i) => (
            <Tile key={item.id} item={item} index={i} paused={open !== null} reduced={reduced} onOpen={openAt} />
          ))}
        </ul>
      </div>

      <Viewer items={items} index={open} onIndex={onIndex} onClose={closeViewer} />
    </section>
  )
}
