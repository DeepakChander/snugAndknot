import { getCategory, listCategories, upsertCategory } from '@/server/repo/collections'
import { invalidate } from '@/server/catalog'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { categorySchema } from '@/server/validation'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  await requireAdmin()
  return ok({ categories: await listCategories() })
})

export const POST = route(async (req) => {
  await requireAdmin()
  const input = await parseBody(req, categorySchema)
  if (await getCategory(input.slug)) throw new HttpError(409, 'A category with this slug already exists.')
  const category = await upsertCategory(input)
  invalidate('categories')
  return ok({ category }, { status: 201 })
})
