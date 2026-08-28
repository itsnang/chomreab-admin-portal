import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, logout } from '@/features/auth/actions'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  // Belt-and-suspenders: proxy.ts already gates this route group on a valid
  // session cookie; this covers the case where the cookie exists but failed
  // to parse as JSON.
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-svh flex flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <span className="font-semibold">Attendance</span>
          <span className="ml-2 text-sm text-muted-foreground capitalize">
            {user.role}
          </span>
        </div>
        <form action={logout}>
          <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
            Sign out
          </button>
        </form>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
