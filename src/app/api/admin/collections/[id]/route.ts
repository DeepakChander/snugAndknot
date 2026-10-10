import { deleteCollection, getCollectionById, upsertCollection } from '@/server/repo/collections'
import { invalidate } from '@/server/catalog'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { collectionSchema } from '@/server/validation'

type Ctx = { params: Promise<{ id: string }> }

export const PUT = route<Ctx>(async (req, { params }) => {
  await requireAdmin()
  const input = await parseBody(req, collectionSchema)
  const { id } = await params
  if (!(await getCollectionById(id))) throw new HttpError(404, 'Collection not found.')
  const collection = await upsertCollection(id, input)
  invalidate('collections')
  return ok({ collection })
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  await requireAdmin()
  if (!(await deleteCollection((await params).id))) throw new HttpError(404, 'Collection not found.')
  invalidate('collections')
  return ok({ ok: true })
})
