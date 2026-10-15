'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMoney } from '@/components/providers/SettingsProvider'
import { InstagramIcon } from '@/components/kit/icons'
import { Badge, Btn, Card, Empty, Input, PageHeader, Textarea, Toggle, confirmAction } from './ui'
import { ImageField } from './ImagePicker'
import { Counter, SaveBar, Section, useSection } from './SettingsAdmin'
import { cn } from '@/lib/format'
import { MAX_WALL_PRODUCTS, MAX_WALL_VIDEOS, detectVideo, youtubeEmbed, youtubePoster, type VideoSource } from '@/lib/video'
import type { VideoWallItem, VideoWallSettings } from '@/types/commerce'

type ProductLite = { id: string; title: string; image: string; status: string; price: number }

const newId = () => `v${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

function kindBadge(url: string, source: VideoSource | null) {
  if (!url.trim()) return null
  if (!source) return <Badge tone="bad">Not a supported link</Badge>
  if (source.kind === 'file') return <Badge tone="good">Video file · plays inline</Badge>
  if (source.kind === 'youtube') return <Badge tone="info">{source.shorts ? 'YouTube Short' : 'YouTube video'} · plays inline</Badge>
  return <Badge tone="warn">Instagram · opens on Instagram</Badge>
}

/** What the tile will show: the clip itself where it can play, otherwise the poster. */
function Preview({ source, poster }: { source: VideoSource | null; poster: string }) {
  const still = poster || (source?.kind === 'youtube' ? youtubePoster(source.id) : '')
  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-noir text-bone ring-1 ring-ink/10">
      {still ? <Image src={still} alt="" fill sizes="180px" unoptimized={still.startsWith('https://i.ytimg.com/') || still.startsWith('/api/media/')} className="object-cover" /> : null}
      {source?.kind === 'file' ? <video key={source.src} src={source.src} muted loop autoPlay playsInline className="absolute inset-0 h-full w-full object-cover" /> : null}
      {source?.kind === 'youtube' ? (
        <iframe
          key={source.id}
          src={youtubeEmbed(source.id)}
          title="Preview"
          loading="lazy"
          allow="autoplay; encrypted-media"
          className={cn('pointer-events-none absolute top-0 h-full border-0', source.shorts ? 'left-0 w-full' : 'left-1/2 w-[316%] -translate-x-1/2')}
        />
      ) : null}
      {source?.kind === 'instagram' ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-noir/40 p-3 text-center text-xs">
          <InstagramIcon size={22} />
          {still ? null : 'Add a poster: Instagram cannot play here'}
        </span>
      ) : null}
      {!source ? <span className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-bone/60">Paste a link to preview it</span> : null}
    </div>
  )
}

function ProductPicker({ ids, products, onChange }: { ids: string[]; products: ProductLite[]; onChange: (ids: string[]) => void }) {
  const money = useMoney()
  const [q, setQ] = useState('')
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const chosen = ids.map((id) => byId.get(id)).filter(Boolean) as ProductLite[]
  const term = q.trim().toLowerCase()
  const matches = term ? products.filter((p) => !ids.includes(p.id) && p.title.toLowerCase().includes(term)).slice(0, 8) : []
  const full = ids.length >= MAX_WALL_PRODUCTS
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-ink/70">
        Pieces in this video ({chosen.length} / {MAX_WALL_PRODUCTS})
      </p>
      {chosen.length ? (
        <ul className="mb-3 space-y-1.5">
          {chosen.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-1.5 pr-2">
              <span className="relative h-11 w-8 shrink-0 overflow-hidden rounded-md bg-parchment">{p.image ? <Image src={p.image} alt="" fill sizes="32px" unoptimized={p.image.startsWith('/api/media/')} className="object-cover" /> : null}</span>
              <span className="min-w-0 flex-1 truncate text-sm">
                {p.title} {p.status !== 'active' ? <Badge tone="warn">{p.status}: hidden on the store</Badge> : null}
              </span>
              <span className="hidden font-mono text-xs text-stone sm:inline">{money(p.price)}</span>
              <Btn size="sm" variant="ghost" disabled={i === 0} aria-label={`Move ${p.title} up`} onClick={() => onChange(swap(ids, i, i - 1))}>
                ↑
              </Btn>
              <Btn size="sm" variant="ghost" className="text-error" aria-label={`Remove ${p.title}`} onClick={() => onChange(ids.filter((x) => x !== p.id))}>
                Remove
              </Btn>
            </li>
          ))}
        </ul>
      ) : null}
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={full ? `At most ${MAX_WALL_PRODUCTS} pieces per video` : 'Search the catalogue by title…'} disabled={full} aria-label="Search products to tag" />
      {term ? (
        matches.length ? (
          <ul className="mt-1.5 overflow-hidden rounded-xl border border-ink/10 bg-white">
            {matches.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange([...ids, p.id])
                    setQ('')
                  }}
                  className="flex w-full items-center gap-3 px-2 py-1.5 text-left text-sm hover:bg-ink/[0.04] focus-visible:bg-ink/[0.06] focus-visible:outline-none"
                >
                  <span className="relative h-9 w-7 shrink-0 overflow-hidden rounded bg-parchment">{p.image ? <Image src={p.image} alt="" fill sizes="28px" unoptimized={p.image.startsWith('/api/media/')} className="object-cover" /> : null}</span>
                  <span className="min-w-0 flex-1 truncate">{p.title}</span>
                  {p.status !== 'active' ? <Badge tone="warn">{p.status}</Badge> : null}
                  <span className="font-mono text-xs text-stone">{money(p.price)}</span>
                  <span className="text-xs font-medium">Add</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1.5 text-xs text-stone">No other piece matches “{q.trim()}”.</p>
        )
      ) : null}
    </div>
  )
}

function ItemEditor({
  item,
  index,
  count,
  err,
  products,
  onChange,
  onMove,
  onRemove,
}: {
  item: VideoWallItem
  index: number
  count: number
  err: Record<string, string>
  products: ProductLite[]
  onChange: (patch: Partial<VideoWallItem>) => void
  onMove: (to: number) => void
  onRemove: () => void
}) {
  const source = detectVideo(item.url)
  const e = (k: string) => err[`items.${index}.${k}`]
  return (
    <Card
      title={
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          {kindBadge(item.url, source)}
        </span>
      }
      actions={
        <div className="flex gap-1">
          <Btn size="sm" variant="ghost" disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move video ${index + 1} up`}>
            ↑
          </Btn>
          <Btn size="sm" variant="ghost" disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move video ${index + 1} down`}>
            ↓
          </Btn>
          <Btn size="sm" variant="ghost" className="text-error" onClick={() => confirmAction(`Remove video ${index + 1}?`) && onRemove()}>
            Remove
          </Btn>
        </div>
      }
    >
      <div className="grid gap-6 sm:grid-cols-[150px_1fr] lg:grid-cols-[180px_1fr]">
        <div className="mx-auto w-[150px] sm:w-full">
          <Preview source={source} poster={item.poster} />
        </div>
        <div className="min-w-0 space-y-4">
          <Input
            label="Video link"
            value={item.url}
            error={e('url')}
            onChange={(ev) => onChange({ url: ev.target.value })}
            placeholder="https://…/clip.mp4, a YouTube or Shorts link, or an Instagram reel"
            className="font-mono text-xs"
            hint="Video files (.mp4, .webm, .mov) and YouTube play muted on the page. Instagram cannot be played on another site, so its poster shows and opens the post."
          />
          <ImageField
            label={source?.kind === 'youtube' ? 'Poster (optional: YouTube’s thumbnail is used otherwise)' : source?.kind === 'instagram' ? 'Poster (required for Instagram)' : 'Poster (shown until the video plays)'}
            aspect="aspect-[9/16]"
            value={item.poster}
            onChange={(v) => onChange({ poster: v })}
          />
          {e('poster') ? <p className="-mt-2 text-xs text-error">{e('poster')}</p> : null}
          <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
            <Input label="Caption" value={item.caption} maxLength={200} error={e('caption')} onChange={(ev) => onChange({ caption: ev.target.value })} placeholder="Ivory cable cardigan, layered for autumn" hint={<Counter value={item.caption} max={200} />} />
            <Input label="Credit" value={item.credit} maxLength={60} error={e('credit')} onChange={(ev) => onChange({ credit: ev.target.value })} placeholder="@handle" />
          </div>
          <ProductPicker ids={item.productIds} products={products} onChange={(productIds) => onChange({ productIds })} />
          {e('productIds') ? <p className="text-xs text-error">{e('productIds')}</p> : null}
        </div>
      </div>
    </Card>
  )
}

function swap<T>(arr: T[], i: number, j: number) {
  const a = [...arr]
  ;[a[i], a[j]] = [a[j], a[i]]
  return a
}

export function VideosAdmin({ initial, products }: { initial: VideoWallSettings; products: ProductLite[] }) {
  const s = useSection('videos', initial)
  const d = s.draft
  const set = (patch: Partial<VideoWallSettings>) => s.setDraft({ ...d, ...patch })
  const setItem = (i: number, patch: Partial<VideoWallItem>) => set({ items: d.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) })
  const playable = d.items.filter((it) => {
    const src = detectVideo(it.url)
    return src && (src.kind !== 'instagram' || it.poster)
  }).length
  const status = !d.enabled ? (
    <Badge>Hidden</Badge>
  ) : playable ? (
    <Badge tone="good">
      Live · {playable} video{playable === 1 ? '' : 's'}
    </Badge>
  ) : (
    <Badge tone="warn">On, but nothing to show yet</Badge>
  )

  return (
    <>
      <PageHeader
        title="Videos"
        description={
          <>
            The shoppable video wall on the home page, after the customer reviews: portrait clips that play muted while on screen and open full screen with the pieces worn in them.{' '}
            <Link href="/" target="_blank" className="underline">
              Open the home page ↗
            </Link>
          </>
        }
        actions={status}
      />
      <Card>
        <Section title="Show the section" description="It stays hidden until it is switched on and has at least one video with a supported link.">
          <Toggle checked={d.enabled} onChange={(v) => set({ enabled: v })} label="Show the video wall on the home page" description={d.enabled && !playable ? 'Add a video below: an empty wall is never shown.' : undefined} />
        </Section>
        <Section title="Heading and invitation" description="The hashtag, one line inviting customers to share, and the button under it.">
          <Input label="Heading" value={d.heading} maxLength={60} error={s.err.heading} onChange={(e) => set({ heading: e.target.value })} placeholder="#SnugAndKnot" hint={<Counter value={d.heading} max={60} />} />
          <Textarea label="Invitation" rows={2} value={d.intro} error={s.err.intro} onChange={(e) => set({ intro: e.target.value })} hint={<>@handles and #tags are highlighted. <Counter value={d.intro} max={300} /></>} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Button label" value={d.ctaLabel} maxLength={40} error={s.err.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} hint="Leave empty to hide the button." />
            <Input label="Button link" value={d.ctaHref} error={s.err.ctaHref} onChange={(e) => set({ ctaHref: e.target.value })} placeholder="https://instagram.com/snugandknot" />
          </div>
        </Section>
      </Card>

      <div className="mb-3 mt-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">
            Videos <span className="font-mono text-sm text-stone">({d.items.length} / {MAX_WALL_VIDEOS})</span>
          </h2>
          <p className="mt-1 text-xs text-stone">Shown in this order: four across on computers, two on phones.</p>
        </div>
        <Btn disabled={d.items.length >= MAX_WALL_VIDEOS} onClick={() => set({ items: [...d.items, { id: newId(), url: '', poster: '', caption: '', credit: '', productIds: [] }] })}>
          Add video
        </Btn>
      </div>
      {s.err.items ? <p className="mb-3 text-sm text-error">{s.err.items}</p> : null}
      <div className="space-y-4">
        {d.items.map((it, i) => (
          <ItemEditor
            key={it.id}
            item={it}
            index={i}
            count={d.items.length}
            err={s.err}
            products={products}
            onChange={(patch) => setItem(i, patch)}
            onMove={(to) => set({ items: swap(d.items, i, to) })}
            onRemove={() => set({ items: d.items.filter((_, j) => j !== i) })}
          />
        ))}
        {!d.items.length ? (
          <Empty title="No videos yet">Add a video and paste a link to an .mp4 file, a YouTube video or Short, or an Instagram reel.</Empty>
        ) : null}
      </div>
      <SaveBar dirty={s.dirty} busy={s.busy} onSave={s.save} onReset={s.reset} />
    </>
  )
}
