'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ButtonLink } from '@/components/kit/Button'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { ProductPrice } from '@/components/kit/Price'
import { ArrowLeft, ArrowRight, BagIcon, InstagramIcon } from '@/components/kit/icons'
import { cn } from '@/lib/format'
import InstagramFrame from '@/components/kit/InstagramFrame'
import { DEPARTMENT_TITLES } from '@/lib/categories'
import { youtubeCommand, youtubeEmbed, type WallDepartment, type WallItem } from '@/lib/video'

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

/** "@handle" and "#tag" in the intro line are set darker than the rest. */
function Highlight({ text }: { text: string }) {
  return (
    <>
      {text.split(/([@#][A-Za-z0-9_.]*[A-Za-z0-9_])/g).map((part, i) =>
        i % 2 ? (
          <span key={i} className="font-medium text-ink">
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
    `Play video ${index + 1}`,
    item.caption,
    item.credit ? `by ${item.credit}` : '',
    n ? `${n} piece${n === 1 ? '' : 's'} tagged` : '',
  ]
    .filter(Boolean)
    .join(', ')

  const body: ReactNode = (
    <div className="relative aspect-[4/5] overflow-hidden bg-parchment group-focus-visible/tile:outline group-focus-visible/tile:outline-2 group-focus-visible/tile:outline-offset-2 group-focus-visible/tile:outline-ink">
      <div className="@container absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/tile:scale-[1.03]">
        {source.kind === 'instagram' && !item.poster ? (
          <>
            {/* Under the embed while Instagram draws its cover, which can take a few seconds. */}
            <span aria-hidden className="absolute inset-0 grid animate-pulse place-items-center text-ink/20">
              <InstagramIcon size={30} />
            </span>
            <InstagramFrame src={source.embed} reel={!source.href.includes('/p/')} title="" load={seen} />
          </>
        ) : (
          <Poster src={item.poster} sizes="(min-width: 768px) 25vw, 50vw" />
        )}
        {source.kind === 'file' && !reduced ? <FileClip src={source.src} active={active} /> : null}
        {source.kind === 'youtube' && !reduced ? <YouTubeClip id={source.id} shorts={source.shorts} active={active} load={seen} /> : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover/tile:opacity-100 group-focus-visible/tile:opacity-100" />

      {n ? (
        <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 bg-white/95 px-2 py-1 text-ink md:left-2.5 md:top-2.5">
          <BagIcon size={13} strokeWidth={1.8} />
          <span className="text-[0.64rem] font-semibold uppercase leading-none tracking-[0.1em] tabular-nums">
            {n}
            <span className="hidden sm:inline"> · View products</span>
          </span>
        </span>
      ) : null}

      {reduced && source.kind !== 'instagram' ? <PlayGlyph className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" /> : null}

      <div className="pointer-events-none absolute inset-x-3 bottom-3 pr-8">
        {item.caption ? (
          <p className="line-clamp-2 text-[0.86rem] font-medium leading-snug text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition [@media(hover:hover)]:duration-500 [@media(hover:hover)]:group-hover/tile:translate-y-0 [@media(hover:hover)]:group-hover/tile:opacity-100 [@media(hover:hover)]:group-focus-visible/tile:translate-y-0 [@media(hover:hover)]:group-focus-visible/tile:opacity-100">
            {item.caption}
          </p>
        ) : null}
        {item.credit ? <p className="mt-1 truncate text-[0.7rem] tracking-wide text-white/85">{item.credit}</p> : null}
      </div>
      <span className="pointer-events-none absolute bottom-3 right-3 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">{sourceGlyph(item, 16)}</span>
    </div>
  )

  return (
    <li ref={ref}>
      <button type="button" onClick={() => onOpen(index)} aria-label={label} aria-haspopup="dialog" className="group/tile relative block w-full text-left outline-none">
        {body}
      </button>
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
      {source.kind === 'instagram' ? null : <Poster src={item.poster} sizes="(min-width: 768px) 45vh, 90vw" />}
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
        <>
          <span aria-hidden className="absolute inset-0 grid animate-pulse place-items-center text-bone/30">
            <InstagramIcon size={36} />
          </span>
          <InstagramFrame key={source.code} src={source.embed} reel={!source.href.includes('/p/')} title={item.caption || 'Instagram video'} interactive load />
        </>
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
                  drag={many && item.source.kind !== 'instagram' ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60 || info.velocity.x < -500) go(1)
                    else if (info.offset.x > 60 || info.velocity.x > 500) go(-1)
                  }}
                  className={cn('@container absolute inset-0 overflow-hidden bg-umber shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]', item.source.kind === 'instagram' ? '' : 'touch-pan-y')}
                >
                  <Stage item={item} muted={muted} playing={playing} onProgress={setProgress} />
                  {item.source.kind === 'instagram' ? null : <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-noir/60 to-transparent" />}
                  {many && item.source.kind !== 'instagram' ? (
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
            {item.source.kind === 'instagram' ? (
              <a href={item.source.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 self-start border-b border-bone/40 pb-0.5 text-[0.72rem] uppercase tracking-[0.14em] text-bone/80 hover:border-bone hover:text-bone md:mt-6">
                Open on Instagram <span aria-hidden>↗</span>
              </a>
            ) : null}
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

/** How many tiles show before "View all": two rows of four. */
const FIRST = 8
const TAB_ORDER = ['women', 'men', 'kids'] as const

/**
 * The shoppable video wall: customers' clips in a 4:5 grid (video files and YouTube play muted
 * while on screen; Instagram shows its own cover). Each tile opens a full-screen viewer with sound,
 * the clip, and the pieces worn in it. On the home page it has a tab per department (with All);
 * a department page passes only its own clips and no tabs.
 */
export default function VideoWall({
  heading,
  intro,
  ctaLabel,
  ctaHref,
  items,
  tabs = false,
  departments,
}: {
  heading: string
  intro: string
  ctaLabel: string
  ctaHref: string
  items: WallItem[]
  /** Show a tab per department that has clips (home page). */
  tabs?: boolean
  /** The departments open in the shop; clips of a closed one are left out. */
  departments?: readonly string[]
}) {
  const grid = useRef<HTMLUListElement>(null)
  const reduced = useReducedMotionPref()
  const [open, setOpen] = useState<number | null>(null)
  const [tab, setTab] = useState<WallDepartment | 'all'>('all')
  const [all, setAll] = useState(false)

  const usable = departments ? items.filter((it) => !it.department || departments.includes(it.department)) : items
  const groups = tabs ? TAB_ORDER.filter((d) => usable.some((it) => it.department === d)) : []
  const showTabs = groups.length > 0 && (groups.length > 1 || usable.some((it) => it.department !== groups[0]))
  const inTab = showTabs && tab !== 'all' ? usable.filter((it) => it.department === tab) : usable
  const shown = all ? inTab : inTab.slice(0, FIRST)

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
      grid.current?.children[i]?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true })
    })
  }, [])

  if (!usable.length) return null
  const pick = (t: WallDepartment | 'all') => {
    setTab(t)
    setAll(false)
    setOpen(null)
  }

  return (
    <section aria-labelledby="video-wall-title" className="bg-ivory py-[clamp(3.5rem,7vw,6rem)] text-ink">
      <div className="container-wide flex flex-col items-center text-center">
        <h2 id="video-wall-title" className="text-headline break-words">
          {heading || 'Worn by you'}
        </h2>
        {intro ? (
          <p className="mt-3 max-w-xl text-[0.95rem] text-stone">
            <Highlight text={intro} />
          </p>
        ) : null}
        {ctaLabel && ctaHref ? (
          <ButtonLink href={ctaHref} external size="sm" icon={<InstagramIcon size={16} />} className="mt-6">
            {ctaLabel}
          </ButtonLink>
        ) : null}
        {showTabs ? (
          <div role="tablist" aria-label="Department" className="mt-8 flex gap-6">
            {(['all', ...groups] as const).map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={tab === d}
                aria-controls="video-wall-grid"
                onClick={() => pick(d)}
                className={cn(
                  'relative pb-1.5 text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-colors',
                  tab === d ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ink' : 'text-ink/50 hover:text-ink'
                )}
              >
                {d === 'all' ? 'All' : DEPARTMENT_TITLES[d]}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="container-wide mt-8">
        <ul ref={grid} id="video-wall-grid" role={showTabs ? 'tabpanel' : 'list'} className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-2">
          {shown.map((item, i) => (
            <Tile key={item.id} item={item} index={i} paused={open !== null} reduced={reduced} onOpen={openAt} />
          ))}
        </ul>
        {inTab.length > FIRST ? (
          <div className="mt-8 text-center">
            <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} aria-controls="video-wall-grid" className="border-b border-ink pb-1 text-[0.74rem] font-medium uppercase tracking-[0.14em]">
              {all ? 'Show fewer' : `View all ${inTab.length}`}
            </button>
          </div>
        ) : null}
      </div>

      <Viewer items={shown} index={open} onIndex={onIndex} onClose={closeViewer} />
    </section>
  )
}
