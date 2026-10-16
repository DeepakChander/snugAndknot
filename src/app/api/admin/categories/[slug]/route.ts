import { deleteCategory, getCategory, upsertCategory } from '@/server/repo/collections'
import { invalidate } from '@/server/catalog'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { categorySchema } from '@/server/validation'
import { catalogChanged, catalogUpdated } from '@/server/notify-events'

type Ctx = { params: Promise<{ slug: string }> }

export const PUT = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin()
  const input = await parseBody(req, categorySchema)
  const { slug } = await params
  const before = await getCategory(slug)
  if (!before) throw new HttpError(404, 'Category not found.')
  // The slug is the key products point at, so it cannot be renamed in place.
  if (input.slug !== slug) throw new HttpError(400, 'The slug of an existing category cannot be changed.')
  // The department is part of the address (/shop/men/shirts), so it stays what it was created with.
  const category = await upsertCategory({ ...input, department: before.department })
  invalidate('categories')
  await catalogUpdated('Category', before, category, category.title, admin.email, '/admin/categories')
  return ok({ category })
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  const admin = await requireAdmin()
  const { slug } = await params
  const before = await getCategory(slug)
  const result = await deleteCategory(slug)
  if (result.inUse) {
    throw new HttpError(409, `${result.inUse} product(s) still use this category. Move them first.`)
  }
  if (!result.deleted) throw new HttpError(404, 'Category not found.')
  invalidate('categories')
  await catalogChanged('Category', 'deleted', before?.title || slug, admin.email, [['Slug', slug]])
  return ok({ ok: true })
})
