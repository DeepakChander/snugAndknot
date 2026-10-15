import { VideosAdmin } from '@/components/admin/VideosAdmin'
import { getSettings } from '@/server/repo/settings'
import { listProducts } from '@/server/repo/products'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Videos' }

export default async function AdminVideos() {
  await requireAdminPage()
  const [settings, products] = await Promise.all([getSettings(), listProducts({ status: 'any', sort: 'newest' })])
  return (
    <VideosAdmin
      initial={settings.videos}
      products={products.map((p) => ({ id: p.id, title: p.title, image: p.images[0]?.src ?? '', status: p.status, price: p.price }))}
    />
  )
}
