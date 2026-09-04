import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, logout } from '@/features/auth/actions'
import { DashboardNav } from '@/components/shared/dashboard-nav'
import { initials } from '@/lib/avatar'

const ADMIN_NAV = [
  { href: '/classrooms', label: 'Classrooms' },
  { href: '/students', label: 'Students' },
  { href: '/linking-codes', label: 'Linking codes' },
  { href: '/staff', label: 'Staff' },
  { href: '/reports', label: 'Reports' },
  { href: '/settings', label: 'Settings' },
]
const TEACHER_NAV = [{ href: '/attendance', label: 'Attendance' }]

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const nav = user.role === 'admin' ? ADMIN_NAV : TEACHER_NAV

  return (
    <div className="min-h-svh flex flex-col" style={{ background: 'var(--hn-paper)' }}>
      <header
        className="flex items-center gap-6 px-7 py-3.5 sticky top-0 z-20"
        style={{
          background: 'var(--hn-surface)',
          borderBottom: '1px solid var(--hn-line)',
          boxShadow: '0 1px 2px rgba(16,16,16,0.03)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-extrabold text-[15px]"
            style={{ background: 'var(--hn-clay)' }}
            aria-hidden="true"
          >
            R
          </div>
          <span className="text-[16px] font-bold tracking-tight">Rollcall</span>
        </div>
        <DashboardNav items={nav} />
        <div className="flex-1" />
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'var(--hn-clay)' }}
          >
            {initials(user.name)}
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-bold">{user.name}</div>
            <div className="text-xs capitalize" style={{ color: 'var(--hn-sub)' }}>
              {user.role}
            </div>
          </div>
          <form action={logout}>
            <button type="submit" className="text-sm ml-2" style={{ color: 'var(--hn-sub)' }}>
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
