/**
 * Video links the admin can paste into the home page video wall, and what each one becomes.
 * Pure and dependency-free: the zod schema, the admin preview and the storefront all use it.
 *
 *  - file:      an https:// (or /site/path) .mp4, .webm or .mov → a native muted, looping <video>
 *  - youtube:   a YouTube video or Short → a youtube-nocookie.com embed
 *  - instagram: an Instagram post or reel → Instagram's own embedded player (the cover in the tile,
 *               playable in the viewer)
 *
 * Anything else (http:, javascript:, data:, credentials in the URL, other pages) is `null`.
 */

import type { PriceBook } from '@/types/commerce'

export type VideoSource =
  | { kind: 'file'; src: string }
  | { kind: 'youtube'; id: string; shorts: boolean }
  | { kind: 'instagram'; href: string; code: string; embed: string }

export type VideoKind = VideoSource['kind']

/** The most clips the video wall holds (across the departments), and the most pieces tagged in one clip. */
export const MAX_WALL_VIDEOS = 48
export const MAX_WALL_PRODUCTS = 12

const FILE_EXT = /\.(mp4|webm|mov)$/i
const YT_ID = /^[A-Za-z0-9_-]{11}$/
const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'])
const IG_HOSTS = new Set(['instagram.com', 'www.instagram.com'])
/** /p/CODE, /reel/CODE, /reels/CODE, /tv/CODE, optionally after a /username segment. */
const IG_PATH = /^\/(?:[A-Za-z0-9._]{1,30}\/)?(p|reels?|tv)\/([A-Za-z0-9_-]{5,40})\/?$/

/** A path on this site: "/x", but not "//host" or "/\\host" (browsers treat both as another site). */
const isLocalPath = (v: string) => /^\/(?![\/\\])[^\s\\]*$/.test(v)

export function detectVideo(input: string): VideoSource | null {
  const raw = (input ?? '').trim()
  if (!raw || raw.length > 500) return null

  if (raw.startsWith('/')) {
    if (!isLocalPath(raw)) return null
    const path = raw.split(/[?#]/)[0]
    return FILE_EXT.test(path) ? { kind: 'file', src: raw } : null
  }

  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  if (u.protocol !== 'https:' || u.username || u.password) return null
  const host = u.hostname.toLowerCase()

  if (YT_HOSTS.has(host)) {
    const parts = u.pathname.split('/').filter(Boolean)
    let id: string | null = null
    let shorts = false
    if (parts[0] === 'watch' && parts.length === 1) id = u.searchParams.get('v')
    else if ((parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live') && parts.length === 2) {
      id = parts[1]
      shorts = parts[0] === 'shorts'
    }
    return id && YT_ID.test(id) ? { kind: 'youtube', id, shorts } : null
  }
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).replace(/\/$/, '')
    return YT_ID.test(id) ? { kind: 'youtube', id, shorts: false } : null
  }

  if (IG_HOSTS.has(host)) {
    const m = IG_PATH.exec(u.pathname)
    if (!m) return null
    const type = m[1] === 'p' ? 'p' : m[1] === 'tv' ? 'tv' : 'reel'
    return { kind: 'instagram', code: m[2], href: `https://www.instagram.com/${type}/${m[2]}/`, embed: instagramEmbed(m[2]) }
  }

  return FILE_EXT.test(u.pathname) ? { kind: 'file', src: u.toString() } : null
}

export const VIDEO_KIND_LABEL: Record<VideoKind, string> = {
  file: 'Video file',
  youtube: 'YouTube',
  instagram: 'Instagram',
}

/**
 * Instagram's official embed of a post or reel (the same player its "Embed" button gives). It shows
 * a header, the media and a footer; the wall crops it to the media (see INSTAGRAM_HEADER_PX).
 */
export const instagramEmbed = (code: string) => `https://www.instagram.com/p/${code}/embed/`
/** The height of the account bar above the media in Instagram's embed, cropped off in the tiles. */
export const INSTAGRAM_HEADER_PX = 54

/**
 * How the embed is first laid over a frame (in container-query units of the frame's width), before
 * it has reported its size: the embed shows a reel letterboxed in a 4:5 box, so drawn at about 148%
 * of the frame's width the 9:16 video itself is as wide as the frame. In a 4:5 tile it is lifted so
 * the middle of the video shows; in a 9:16 frame it fits. InstagramFrame then refines it from the
 * embed's own measurements (a square or landscape post fills the frame too).
 */
export const INSTAGRAM_CROP = {
  tile: { width: '148cqw', left: '-24cqw', top: `calc(-${INSTAGRAM_HEADER_PX}px - 18cqw)` },
  stage: { width: '148cqw', left: '-24cqw', top: `-${INSTAGRAM_HEADER_PX}px` },
} as const

/** The department a clip belongs to: shown on that department's page and under its tab on the home page. */
export type WallDepartment = '' | 'men' | 'women' | 'kids'
export const WALL_DEPARTMENTS = ['', 'men', 'women', 'kids'] as const

/** YouTube's own thumbnail: always present, used when the admin sets no poster. */
export const youtubePoster = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

/**
 * The privacy-enhanced embed, muted and looping without YouTube's chrome. `enablejsapi` lets the
 * page pause and resume it with postMessage, without loading YouTube's script.
 */
export function youtubeEmbed(id: string, opts: { autoplay?: boolean; mute?: boolean } = {}) {
  const q = new URLSearchParams({
    autoplay: opts.autoplay === false ? '0' : '1',
    mute: opts.mute === false ? '0' : '1',
    loop: '1',
    playlist: id,
    controls: '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    disablekb: '1',
    fs: '0',
    enablejsapi: '1',
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`
}

/** Sends a player command ("playVideo", "pauseVideo", "mute", "unMute") to an embedded YouTube iframe. */
export function youtubeCommand(frame: HTMLIFrameElement | null, func: 'playVideo' | 'pauseVideo' | 'mute' | 'unMute') {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), 'https://www.youtube-nocookie.com')
}

/* ─────────────── Storefront shape ─────────────── */

export interface WallProduct {
  id: string
  handle: string
  title: string
  price: number
  compareAtPrice: number | null
  /** Prices in the shop's additional currencies, so the viewer can show the shopper's. */
  prices: PriceBook
  image: string
  productType: string
}

export interface WallItem {
  id: string
  source: VideoSource
  poster: string
  caption: string
  credit: string
  department: WallDepartment
  products: WallProduct[]
}

type StoredItem = { id?: string; url?: string; poster?: string; caption?: string; credit?: string; department?: string; productIds?: string[] }
type ProductLike = { id: string; handle: string; title: string; price: number; compareAtPrice: number | null; prices: PriceBook; images: { src: string }[]; productType: string }

/**
 * Turns the saved section into what the storefront renders: unplayable links are dropped, and
 * tagged products are limited to the live catalogue passed in (drafts and deleted pieces simply
 * disappear). An Instagram post with no poster shows Instagram's own cover.
 */
export function buildWall(items: StoredItem[] | undefined, catalogue: ProductLike[]): WallItem[] {
  const byId = new Map(catalogue.map((p) => [p.id, p]))
  const out: WallItem[] = []
  for (const it of items ?? []) {
    const source = detectVideo(it.url ?? '')
    if (!source) continue
    const poster = (it.poster ?? '').trim() || (source.kind === 'youtube' ? youtubePoster(source.id) : '')
    const products: WallProduct[] = []
    for (const pid of it.productIds ?? []) {
      const p = byId.get(pid)
      if (p) products.push({ id: p.id, handle: p.handle, title: p.title, price: p.price, compareAtPrice: p.compareAtPrice, prices: p.prices, image: p.images[0]?.src ?? '', productType: p.productType })
    }
    const department = (WALL_DEPARTMENTS as readonly string[]).includes(it.department ?? '') ? (it.department as WallDepartment) : ''
    out.push({ id: it.id || `v${out.length}`, source, poster, caption: it.caption ?? '', credit: it.credit ?? '', department, products })
  }
  return out
}
