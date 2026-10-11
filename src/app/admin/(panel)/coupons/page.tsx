import { CouponsAdmin } from '@/components/admin/CatalogAdmin'
import { listCoupons } from '@/server/repo/coupons'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Discount codes' }

export default async function AdminCoupons() {
  await requireAdminPage()
  return <CouponsAdmin coupons={await listCoupons()} />
}
