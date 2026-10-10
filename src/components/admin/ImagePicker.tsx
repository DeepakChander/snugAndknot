'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { api, ApiError } from '@/lib/api'
import { useUIStore } from '@/stores/ui-store'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { Btn } from './ui'
import { cn } from '@/lib/format'

type MediaItem = { id: string; url: string; filename: string; size: number }

const MAX = 4 * 1024 * 1024

/** Upload a file to the media library; returns its URL. */
export async function uploadImage(file: File): Promise<string> {
  if (file.size > MAX) throw new ApiError(413, 'Images must be 4 MB or smaller.')
  const fd = new FormData()
  fd.append('file', file)
  const { url } = await api<{ url: string }>('/api/admin/media', { method: 'POST', body: fd })
  return url
}

/** Grid of already-uploaded images plus the site's own photography. */
export function MediaLibrary({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (url: string) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null)
  useEffect(() => {
    if (!open) return
    api<{ media: MediaItem[] }>('/api/admin/media')
      .then((r) => setItems(r.media))
      .catch(() => setItems([]))
  }, [open])
  const builtIn = [
    '/images/products/women/ivory-cable-cardigan-1.jpg',
    '/images/products/women/terracotta-textured-cardigan-1.jpg',
    '/images/products/men/navy-tan-colorblock-tee-1.jpg',
    '/images/products/men/black-red-contrast-tee-1.jpg',
    '/images/Collections-Hero/Winter.png',
    '/images/Collections-Hero/Artisan.png',
    '/images/Collections-Hero/Essentials.png',
    '/images/Collections-Hero/Coastal.png',
    '/images/lookbook/quiet-luxury-1.png',
    '/images/lookbook/golden-hour-2.png',
    '/images/lookbook/after-dark-1.png',
    '/images/lookbook/soft-focus-2.png',
    '/images/about/about-hero.png',
    '/images/collection-home/Material-Intimacy.png',
  ]
  return (
    <Overlay open={open} onClose={onClose} label="Media library" side="center" className="bg-[#f6f2ea] text-ink">
      <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
        <h2 className="font-display text-3xl">Media library</h2>
        <CloseButton onClick={onClose} />
      </div>
      <div className="max-h-[70dvh] overflow-y-auto p-6" data-lenis-prevent>
        <p className="mb-3 text-xs font-medium text-stone">Uploaded</p>
        {items === null ? (
          <p className="text-sm text-stone">Loading…</p>
        ) : items.length ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {items.map((m) => (
              <button key={m.id} type="button" onClick={() => (onPick(m.url), onClose())} className="group relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-ink/10 hover:ring-2 hover:ring-ink">
                <Image src={m.url} alt={m.filename} fill sizes="160px" className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone">Nothing uploaded yet.</p>
        )}
        <p className="mb-3 mt-8 text-xs font-medium text-stone">Store photography</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {builtIn.map((src) => (
            <button key={src} type="button" onClick={() => (onPick(src), onClose())} className="relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-ink/10 hover:ring-2 hover:ring-ink">
              <Image src={src} alt="" fill sizes="160px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </Overlay>
  )
}

/** Single image field: preview, URL, upload, or pick from the library. */
export function ImageField({ value, onChange, label = 'Image', aspect = 'aspect-[4/5]' }: { value: string; onChange: (url: string) => void; label?: string; aspect?: string }) {
  const file = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [library, setLibrary] = useState(false)
  const addToast = useUIStore((s) => s.addToast)
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-ink/70">{label}</p>
      <div className="flex gap-4">
        <div className={cn('relative w-28 shrink-0 overflow-hidden rounded-xl bg-parchment ring-1 ring-ink/10', aspect)}>
          {value ? <Image src={value} alt="" fill sizes="112px" className="object-cover" unoptimized={value.startsWith('/api/media/')} /> : <span className="absolute inset-0 flex items-center justify-center text-xs text-stone">No image</span>}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/… or https://…" className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-ink/50" />
          <div className="flex flex-wrap gap-2">
            <Btn
              size="sm"
              variant="outline"
              loading={busy}
              onClick={() => file.current?.click()}
            >
              Upload
            </Btn>
            <Btn size="sm" variant="outline" onClick={() => setLibrary(true)}>
              Library
            </Btn>
          </div>
          <input
            ref={file}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (!f) return
              setBusy(true)
              try {
                onChange(await uploadImage(f))
                addToast('Image uploaded.')
              } catch (err) {
                addToast(err instanceof ApiError ? err.message : 'Upload failed.', 'error')
              } finally {
                setBusy(false)
              }
            }}
          />
        </div>
      </div>
      <MediaLibrary open={library} onClose={() => setLibrary(false)} onPick={onChange} />
    </div>
  )
}
