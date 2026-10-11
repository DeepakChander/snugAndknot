import { deleteCollection, getCollectionById, upsertCollection } from '@/server/repo/collections'
import { invalidate } from '@/server/catalog'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { collectionSchema } from '@/server/validation'
import { catalogChanged, catalogUpdated } from '@/server/notify-events'

type Ctx = { params: Promise<{ id: string }> }

export const PUT = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin()
  const input = await parseBody(req, collectionSchema)
  const { id } = await params
  const before = await getCollectionById(id)
  if (!before) throw new HttpError(404, 'Collection not found.')
  const collection = await upsertCollection(id, input)
  invalidate('collections')
  await catalogUpdated('Collection', before, collection, collection.title, admin.email, '/admin/collections')
  return ok({ collection })
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  const admin = await requireAdmin()
  const { id } = await params
  const before = await getCollectionById(id)
  if (!(await deleteCollection(id))) throw new HttpError(404, 'Collection not found.')
  invalidate('collections')
  await catalogChanged('Collection', 'deleted', before?.title ?? id, admin.email)
  return ok({ ok: true })
})
