import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, logout } from '@/features/auth/actions'
import { DashboardNav } from '@/components/shared/dashboard-nav'
import { Icons } from '@/components/shared/icons'
import { avatarColor, initials } from '@/lib/avatar'

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
    <div className="min-h-svh flex" style={{ background: 'var(--hn-paper)' }}>
      <aside
        className="flex flex-col items-center py-5 gap-2 sticky top-0 h-svh flex-none"
        style={{ width: 88, background: 'var(--hn-surface)', borderRight: '1px solid var(--hn-hair)' }}
      >
        <div
          className="w-[38px] h-[38px] rounded-[11px] grid place-items-center text-white font-extrabold text-[17px] mb-3.5 flex-none"
          style={{ background: 'var(--hn-clay)' }}
          aria-hidden="true"
          title="Rollcall"
        >
          R
        </div>

        <DashboardNav items={nav} />

        <div className="flex-1" />

        <div className="flex flex-col items-center gap-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-none"
            style={{ background: avatarColor(user.id) }}
            title={`${user.name} (${user.role})`}
          >
            {initials(user.name)}
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              className="w-9 h-9 rounded-[11px] flex items-center justify-center transition-colors"
              style={{ color: 'var(--hn-sub)' }}
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
