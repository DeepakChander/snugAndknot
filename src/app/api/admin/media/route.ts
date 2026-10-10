import { listMedia, MEDIA_MAX_BYTES, MEDIA_TYPES, saveMedia } from '@/server/repo/misc'
import { guardWrite, HttpError, ok, requireAdmin, route } from '@/server/http'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  await requireAdmin()
  return ok({ media: await listMedia() })
})

/** Image upload, stored in Postgres so it works on any host without extra storage services. */
export const POST = route(async (req) => {
  guardWrite(req)
  await requireAdmin()
  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!file || typeof file === 'string') throw new HttpError(400, 'Choose an image to upload.')
  if (!(MEDIA_TYPES as readonly string[]).includes(file.type)) {
    throw new HttpError(415, 'Upload a JPEG, PNG, WebP, AVIF or GIF image.')
  }
  if (file.size > MEDIA_MAX_BYTES) throw new HttpError(413, 'Images must be 4 MB or smaller.')
  const data = Buffer.from(await file.arrayBuffer())
  const id = await saveMedia(file.name || 'upload', file.type, data)
  return ok({ id, url: `/api/media/${id}` }, { status: 201 })
})
