import type { ReactNode } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser, logout } from '@/features/auth/actions'
import { DashboardNav } from '@/components/shared/dashboard-nav'
import { MobileNav, type MobileNavItem } from '@/components/shared/mobile-nav'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { Icons } from '@/components/shared/icons'

const ADMIN_NAV = [
  { href: '/classrooms', label: 'Classrooms', icon: 'building2' },
  { href: '/students', label: 'Students', icon: 'graduationCap' },
  { href: '/linking-codes', label: 'Linking codes', icon: 'qrCode' },
  { href: '/staff', label: 'Staff', icon: 'users' },
  { href: '/reports', label: 'Reports', icon: 'barChart3' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
] as const satisfies readonly MobileNavItem[]
const TEACHER_NAV = [
  { href: '/attendance', label: 'Attendance', icon: 'clipboardCheck' },
] as const satisfies readonly MobileNavItem[]

const SIGN_OUT_LABEL = 'Sign out'

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
      {/* Phones get a top bar and a slide-out menu: an admin has six
          destinations plus an account block, which no bottom bar or 88px rail
          can hold at that width. The rail returns from `sm` up. */}
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b bg-card px-2 py-2 sm:hidden">
        <MobileNav
          items={nav}
          user={{ id: user.id, name: user.name, role: user.role }}
          signOut={
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                <Icons.logOut size={18} />
                {SIGN_OUT_LABEL}
              </button>
            </form>
          }
        />
        <span className="flex items-center gap-2 font-bold">
          <span
            className="grid size-7 flex-none place-items-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground"
            aria-hidden="true"
          >
            C
          </span>
          Chomreab
        </span>
        <span className="ml-auto">
          <InitialAvatar id={user.id} name={user.name} title={`${user.name} (${user.role})`} />
        </span>
      </header>

      <aside className="sticky top-0 hidden h-svh w-22 flex-none flex-col items-center gap-2 overflow-y-auto border-r bg-card py-5 sm:flex">
        <div
          className="mb-3.5 grid size-[38px] flex-none place-items-center rounded-lg bg-primary text-[17px] font-extrabold text-primary-foreground"
          aria-hidden="true"
          title="Chomreab"
        >
          C
        </div>

        <DashboardNav items={nav} />

        <div className="flex-1" />

        {/* Signing out was an unlabelled icon that all but vanished against the
            rail in dark mode; it now reads as a destination like the nav items
            above it, and the account it signs out of is named next to it. */}
        <div className="flex w-full flex-col items-center gap-2 border-t pt-3">
          <InitialAvatar id={user.id} name={user.name} title={`${user.name} (${user.role})`} />
          <p className="w-full truncate px-1 text-center text-[10px] font-bold text-muted-foreground">
            {user.name}
          </p>
          <Link
            href="/change-password"
            className="flex w-[68px] flex-col items-center gap-1 rounded-lg py-2 text-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
              <span className="text-[10px] leading-[1.15] font-bold">{SIGN_OUT_LABEL}</span>
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
