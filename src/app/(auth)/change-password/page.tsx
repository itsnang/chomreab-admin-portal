import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/features/auth/actions'
import { ChangePasswordScreen } from '@/features/auth/components/change-password-screen'

export const metadata: Metadata = { title: 'Change password — Chomreab' }

// Lives in the (auth) group rather than (dashboard): a user sent here because
// of a temporary password must not reach the nav, and there is nothing on this
// screen the app chrome helps with.
export default async function ChangePasswordPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <ChangePasswordScreen forced={user.mustChangePassword} />
}
