import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/features/auth/actions'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  redirect(user?.role === 'admin' ? '/classrooms' : '/attendance')
}
