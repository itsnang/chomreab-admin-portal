import type { Metadata } from 'next'
import { getCurrentUser } from '@/features/auth/actions'
import { PageShell } from '@/components/shared/page-shell'

export const metadata: Metadata = {
  title: 'Dashboard — Attendance',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <PageShell
      heading={`Welcome, ${user?.name ?? ''}`}
      description={
        user?.role === 'admin'
          ? 'Manage classrooms, students, and linking codes.'
          : "Mark today's attendance for your classes."
      }
    >
      {/* Role-specific nav/content (classrooms, students, attendance) lands here in a follow-up slice. */}
      <p className="text-sm text-muted-foreground">Nothing to show yet.</p>
    </PageShell>
  )
}
