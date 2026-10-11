import { listCollections, upsertCollection } from '@/server/repo/collections'
import { newId } from '@/server/repo/util'
import { invalidate } from '@/server/catalog'
import { ok, parseBody, requireAdmin, route } from '@/server/http'
import { collectionSchema } from '@/server/validation'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  await requireAdmin()
  return ok({ collections: await listCollections() })
})

export const POST = route(async (req) => {
  await requireAdmin()
  const input = await parseBody(req, collectionSchema)
  const collection = await upsertCollection(newId('col'), input)
  invalidate('collections')
  return ok({ collection }, { status: 201 })
})
