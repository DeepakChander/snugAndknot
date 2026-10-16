import { deleteProduct, getProductById, setProductPricing, setProductsStatus, setVariantInventory } from '@/server/repo/products'
import { invalidate } from '@/server/catalog'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { productActionSchema } from '@/server/validation'
import { catalogChanged, productUpdated, restockedWithWaitlist } from '@/server/notify-events'
import type { Product } from '@/types/commerce'

export const dynamic = 'force-dynamic'

/**
 * Quick actions from the admin's product list: change status, mark sold out, restock, set each
 * size's stock, set one price for every size, or delete, for one product or many. Each change is
 * logged like a full save, and a restock tells the customers waiting for that size.
 */
export const POST = route(async (req) => {
  const admin = await requireAdmin()
  const input = await parseBody(req, productActionSchema)

  // The products as they were, for the change log and the restock alerts.
  const ids = 'ids' in input ? input.ids : [input.id]
  const before = (await Promise.all(ids.map((id) => getProductById(id)))).filter((p): p is Product => !!p)
  if (!before.length) throw new HttpError(404, 'Product not found.')

  if (input.action === 'delete') {
    for (const p of before) {
      await deleteProduct(p.id)
      await catalogChanged('Product', 'deleted', p.title, admin.email, [['Handle', p.handle]])
    }
    invalidate('products', 'categories', 'collections', 'reviews')
    return ok({ deleted: before.map((p) => p.id) })
  }

  if (input.action === 'status') await setProductsStatus(before.map((p) => p.id), input.status)
  for (const p of before) {
    if (input.action === 'sold-out') await setVariantInventory(p.id, p.variants.map((v) => ({ id: v.id, inventory: 0 })))
    if (input.action === 'restock') await setVariantInventory(p.id, p.variants.filter((v) => v.inventory === 0).map((v) => ({ id: v.id, inventory: input.quantity })))
    if (input.action === 'inventory') await setVariantInventory(p.id, input.variants.filter((v) => p.variants.some((x) => x.id === v.id)))
    if (input.action === 'price') await setProductPricing(p.id, { price: input.price, compareAtPrice: input.compareAtPrice, prices: input.prices })
  }
  invalidate('products', 'categories', 'collections')

  const after: Product[] = []
  for (const b of before) {
    const a = await getProductById(b.id)
    if (!a) continue
    after.push(a)
    await productUpdated(b, a, admin.email)
    await restockedWithWaitlist(b, a, admin.email)
  }
  return ok({ products: after })
})
