import { deleteCategory, getCategory, upsertCategory } from '@/server/repo/collections'
import { invalidate } from '@/server/catalog'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { categorySchema } from '@/server/validation'

type Ctx = { params: Promise<{ slug: string }> }

export const PUT = route<Ctx>(async (req, { params }) => {
  await requireAdmin()
  const input = await parseBody(req, categorySchema)
  const { slug } = await params
  if (!(await getCategory(slug))) throw new HttpError(404, 'Category not found.')
  // The slug is the key products point at, so it cannot be renamed in place.
  if (input.slug !== slug) throw new HttpError(400, 'The slug of an existing category cannot be changed.')
  const category = await upsertCategory(input)
  invalidate('categories')
  return ok({ category })
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  await requireAdmin()
  const result = await deleteCategory((await params).slug)
  if (result.inUse) {
    throw new HttpError(409, `${result.inUse} product(s) still use this category. Move them first.`)
  }
  if (!result.deleted) throw new HttpError(404, 'Category not found.')
  invalidate('categories')
  return ok({ ok: true })
})
