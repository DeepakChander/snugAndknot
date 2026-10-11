import { getMedia } from '@/server/repo/misc'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params
  if (!/^img_[a-f0-9]{20}$/.test(id)) return new Response('Not found', { status: 404 })
  const media = await getMedia(id)
  if (!media) return new Response('Not found', { status: 404 })
  return new Response(new Uint8Array(media.data), {
    headers: {
      'Content-Type': media.mime,
      'Content-Length': String(media.data.length),
      // Media ids are immutable: a replaced image gets a new id.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      // Even if a file were mis-typed, the browser may not run anything from it.
      'Content-Security-Policy': "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox",
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  })
}
