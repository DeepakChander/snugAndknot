import { CouponsAdmin } from '@/components/admin/CatalogAdmin'
import { listCoupons } from '@/server/repo/coupons'

export const metadata = { title: 'Discount codes' }

export default async function AdminCoupons() {
  return <CouponsAdmin coupons={await listCoupons()} />
}
