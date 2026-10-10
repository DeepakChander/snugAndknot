import { CustomersAdmin } from '@/components/admin/PeopleAdmin'
import { listCustomers } from '@/server/repo/misc'
import { currentUser } from '@/server/auth'

export const metadata = { title: 'Customers' }

export default async function AdminCustomers() {
  const [customers, me] = await Promise.all([listCustomers(), currentUser()])
  return <CustomersAdmin customers={customers} selfId={me?.id ?? ''} />
}
