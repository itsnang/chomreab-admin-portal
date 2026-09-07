import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, logout } from '@/features/auth/actions'
import { DashboardNav } from '@/components/shared/dashboard-nav'
import { Icons } from '@/components/shared/icons'
import { InitialAvatar } from '@/components/shared/initial-avatar'

const ADMIN_NAV = [
  { href: '/classrooms', label: 'Classrooms', icon: 'building2' },
  { href: '/students', label: 'Students', icon: 'graduationCap' },
  { href: '/linking-codes', label: 'Linking codes', icon: 'qrCode' },
  { href: '/staff', label: 'Staff', icon: 'users' },
  { href: '/reports', label: 'Reports', icon: 'barChart3' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
] as const
const TEACHER_NAV = [{ href: '/attendance', label: 'Attendance', icon: 'clipboardCheck' }] as const

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const nav = user.role === 'admin' ? ADMIN_NAV : TEACHER_NAV

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="sticky top-0 flex h-svh w-22 flex-none flex-col items-center gap-2 border-r bg-card py-5">
        <div
          className="mb-3.5 grid size-[38px] flex-none place-items-center rounded-lg bg-primary text-[17px] font-extrabold text-primary-foreground"
          aria-hidden="true"
          title="Rollcall"
        >
          R
        </div>

        <DashboardNav items={nav} />

        <div className="flex-1" />

        <div className="flex flex-col items-center gap-2">
          <InitialAvatar
            id={user.id}
            name={user.name}
            className="text-xs"
            title={`${user.name} (${user.role})`}
          />
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icons.logOut size={18} />
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
