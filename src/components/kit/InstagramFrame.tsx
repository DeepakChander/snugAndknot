'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/format'
import { INSTAGRAM_CROP, INSTAGRAM_HEADER_PX } from '@/lib/video'

const ORIGIN = 'https://www.instagram.com'
/** Instagram's account bar and footer around the media, before the embed has measured itself. */
const CHROME_PX = 189
/** A reel's 9:16 video inside the embed's 4:5 box takes this share of its width. */
const REEL_SHARE = (5 / 4) * (9 / 16)

type Measure = { w: number; h: number }

/**
 * Where the embed sits over a frame of `box` so its media covers the frame edge to edge, from the
 * embed's own report of its height (a `MEASURE` message) at its current width: less the bar and
 * footer, that is the media's height. A reel's 4:5 box may hold a 9:16 video with bars beside it,
 * so a reel is drawn wide enough for the video alone to fill the frame. A little extra keeps the
 * footer out of sight when a post's footer is taller than usual. Before the report the CSS crop
 * for a reel is used.
 */
function layout(box: Measure, m: Measure, reel: boolean): { width: number; left: number; top: number; height: number } | null {
  const ratio = (m.h - CHROME_PX) / m.w
  if (!(ratio > 0.2 && ratio < 3)) return null
  const share = reel && ratio > 1.15 && ratio < 1.35 ? REEL_SHARE : 1
  const width = Math.ceil(Math.max(box.w / share, box.h / ratio) * 1.03)
  const mediaH = ratio * width
  return { width, left: -(width - box.w) / 2, top: -INSTAGRAM_HEADER_PX - (mediaH - box.h) / 2, height: Math.ceil(CHROME_PX + mediaH + 40) }
}

/**
 * Instagram's own embed cropped to the media: its account bar is lifted above the frame, its
 * footer falls below it, and the letterbox bars beside a reel fall outside. The embed reports its
 * height to this page as Instagram's embed.js expects; answering by resizing the frame is also
 * what makes it draw its cover (it waits for a resize before painting). In a tile it is only a
 * picture (clicks open the viewer); in the viewer it plays. The parent is the query container.
 */
export default function InstagramFrame({ src, title, reel = true, interactive, load }: { src: string; title: string; reel?: boolean; interactive?: boolean; load: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [shown, setShown] = useState(false)
  const [box, setBox] = useState<Measure | null>(null)
  const [measure, setMeasure] = useState<Measure | null>(null)
  const [nudge, setNudge] = useState(0)

  // The frame's size, to cover it.
  useEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(parent)
    return () => ro.disconnect()
  }, [load])

  // The embed's own reports of its height.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const frame = ref.current
      if (e.origin !== ORIGIN || !frame || e.source !== frame.contentWindow) return
      let data: { type?: string; details?: { height?: number } }
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      } catch {
        return
      }
      const h = data?.details?.height
      if (data?.type !== 'MEASURE' || typeof h !== 'number' || h <= 0) return
      const m = { w: frame.offsetWidth, h }
      // A report at nearly the same width (the one-pixel nudge, or after the frame settled) changes nothing.
      setMeasure((prev) => (prev && Math.abs(prev.w - m.w) < 8 ? prev : m))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // A fallback for an embed that has not drawn yet: widen it by a pixel and back now and then.
  useEffect(() => {
    if (!shown) return
    const timers = [300, 1200, 3000, 6000, 10000].flatMap((t) => [window.setTimeout(() => setNudge(1), t), window.setTimeout(() => setNudge(0), t + 120)])
    return () => timers.forEach(window.clearTimeout)
  }, [shown])

  if (!load) return null
  const crop = interactive ? INSTAGRAM_CROP.stage : INSTAGRAM_CROP.tile
  const measured = box && measure ? layout(box, measure, reel) : null
  const style: CSSProperties = measured
    ? { ...measured, width: measured.width + nudge }
    : { ...crop, width: `calc(${crop.width} + ${nudge}px)`, height: 'calc(200cqw + 30rem)' }

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      loading="lazy"
      scrolling="no"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
      aria-hidden={interactive ? undefined : true}
      tabIndex={interactive ? undefined : -1}
      onLoad={() => setShown(true)}
      style={style}
      className={cn('absolute max-w-none border-0 bg-transparent transition-opacity duration-500', interactive ? '' : 'pointer-events-none', shown ? 'opacity-100' : 'opacity-0')}
    />
  )
}
