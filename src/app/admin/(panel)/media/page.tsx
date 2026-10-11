import { MediaAdmin } from '@/components/admin/CatalogAdmin'
import { listMedia } from '@/server/repo/misc'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Media' }

export default async function AdminMedia() {
  await requireAdminPage()
  return <MediaAdmin media={await listMedia()} />
}
