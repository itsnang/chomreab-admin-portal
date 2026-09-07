import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/features/auth/actions'
import { AttendanceScreen } from '@/features/attendance/components/attendance-screen'

export const metadata: Metadata = { title: 'Attendance — Rollcall' }

export default async function AttendancePage() {
  // Marking is teacher-only on the API (`/attendance/my-classes`, `/mark` and
  // `/bulk-mark` are all @Roles(TEACHER)), and admins have no nav entry for
  // this route — reaching it directly would only show a permission error.
  const user = await getCurrentUser()
  if (user?.role !== 'teacher') redirect('/dashboard')

  return <AttendanceScreen />
}
