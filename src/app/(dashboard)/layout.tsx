import type { ReactNode } from 'react'
import Link from 'next/link'
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
  // An admin generated this account's password and knows it. Nothing in the
  // app is reachable until the teacher replaces it.
  if (user.mustChangePassword) {
    redirect('/change-password')
  }

  const nav = user.role === 'admin' ? ADMIN_NAV : TEACHER_NAV

  return (
    <div className="flex min-h-svh flex-col bg-background sm:flex-row">
      <aside className="sticky bottom-0 z-20 order-last flex w-full flex-none items-center justify-between gap-2 border-t bg-card px-4 py-2 sm:top-0 sm:bottom-auto sm:order-first sm:h-svh sm:w-22 sm:flex-col sm:justify-start sm:overflow-y-auto sm:border-t-0 sm:border-r sm:px-0 sm:py-5">
        <div
          className="hidden size-[38px] flex-none place-items-center rounded-lg bg-primary text-[17px] font-extrabold text-primary-foreground sm:mb-3.5 sm:grid"
          aria-hidden="true"
          title="Chomreab"
        >
          C
        </div>

        <DashboardNav items={nav} />

        <div className="hidden flex-1 sm:block" />

        {/* Signing out was an unlabelled icon that all but vanished against the
            rail in dark mode; it now reads as a destination like the nav items
            above it, and the account it signs out of is named next to it. */}
        <div className="flex flex-none items-center gap-2 sm:w-full sm:flex-col sm:border-t sm:pt-3">
          <InitialAvatar
            id={user.id}
            name={user.name}
            title={`${user.name} (${user.role})`}
          />
          <p className="hidden w-full truncate px-1 text-center text-[10px] font-bold text-muted-foreground sm:block">
            {user.name}
          </p>
          <Link
            href="/change-password"
            className="flex min-w-[56px] flex-col items-center gap-1 rounded-lg py-2 text-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:w-[68px]"
          >
            <Icons.key size={22} />
            <span className="text-[10px] leading-[1.15] font-bold">Password</span>
          </Link>
          <form action={logout} className="flex w-full justify-center">
            <button
              type="submit"
              className="flex w-[68px] cursor-pointer flex-col items-center gap-1 rounded-lg py-2 text-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icons.logOut size={22} />
              <span className="text-[10px] leading-[1.15] font-bold">Sign out</span>
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
