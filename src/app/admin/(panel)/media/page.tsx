import { MediaAdmin } from '@/components/admin/CatalogAdmin'
import { listMedia } from '@/server/repo/misc'

export const metadata = { title: 'Media' }

export default async function AdminMedia() {
  return <MediaAdmin media={await listMedia()} />
}
