'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  href: string
  label: string
}

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1 p-[3px] rounded-full" style={{ background: 'var(--hn-line-2)' }}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className="text-[13px] font-bold px-4 py-1.5 rounded-full transition-colors"
            style={
              active
                ? { background: 'var(--hn-surface)', color: 'var(--hn-ink)' }
                : { color: 'var(--hn-sub)' }
            }
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
