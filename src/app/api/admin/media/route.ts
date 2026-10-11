import { listMedia, MEDIA_MAX_BYTES, MEDIA_TYPES, saveMedia } from '@/server/repo/misc'
import { guardWrite, HttpError, ok, requireAdmin, route } from '@/server/http'
import { rateLimit } from '@/server/rate-limit'

export const dynamic = 'force-dynamic'

/** Magic-number check for the image types we accept. */
function looksLike(mime: string, b: Buffer): boolean {
  const ascii = (start: number, end: number) => b.subarray(start, end).toString('latin1')
  switch (mime) {
    case 'image/jpeg':
      return b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff
    case 'image/png':
      return b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    case 'image/gif':
      return ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a'
    case 'image/webp':
      return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP'
    case 'image/avif':
      return ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))
    default:
      return false
  }
}

export const GET = route(async () => {
  await requireAdmin()
  return ok({ media: await listMedia() })
})

/** Image upload, stored in Postgres so it works on any host without extra storage services. */
export const POST = route(async (req) => {
  guardWrite(req)
  const admin = await requireAdmin()
  await rateLimit('upload', admin.id)
  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!file || typeof file === 'string') throw new HttpError(400, 'Choose an image to upload.')
  if (!(MEDIA_TYPES as readonly string[]).includes(file.type)) {
    throw new HttpError(415, 'Upload a JPEG, PNG, WebP, AVIF or GIF image.')
  }
  if (file.size > MEDIA_MAX_BYTES) throw new HttpError(413, 'Images must be 4 MB or smaller.')
  const data = Buffer.from(await file.arrayBuffer())
  // The declared type comes from the browser; the bytes must agree with it.
  if (!looksLike(file.type, data)) throw new HttpError(415, 'That file is not a valid image of the type it claims to be.')
  const id = await saveMedia(file.name || 'upload', file.type, data)
  return ok({ id, url: `/api/media/${id}` }, { status: 201 })
})
