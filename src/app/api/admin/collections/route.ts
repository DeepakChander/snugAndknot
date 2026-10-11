import { listCollections, upsertCollection } from '@/server/repo/collections'
import { newId } from '@/server/repo/util'
import { invalidate } from '@/server/catalog'
import { ok, parseBody, requireAdmin, route } from '@/server/http'
import { collectionSchema } from '@/server/validation'
import { catalogChanged } from '@/server/notify-events'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  await requireAdmin()
  return ok({ collections: await listCollections() })
})

export const POST = route(async (req) => {
  const admin = await requireAdmin()
  const input = await parseBody(req, collectionSchema)
  const collection = await upsertCollection(newId('col'), input)
  invalidate('collections')
  await catalogChanged('Collection', 'created', collection.title, admin.email, [['Pieces', collection.productIds.length]], '/admin/collections')
  return ok({ collection }, { status: 201 })
})
