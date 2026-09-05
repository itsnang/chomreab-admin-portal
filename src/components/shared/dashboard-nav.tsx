'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icons } from './icons'

interface NavItem {
  href: string
  label: string
  icon: keyof typeof Icons
}

export function DashboardNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col items-center gap-2 w-full">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const color = active ? 'var(--hn-clay)' : 'var(--hn-sub)'
        const Icon = Icons[item.icon]
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className="flex flex-col items-center gap-1 w-[68px] py-2 rounded-[11px] text-center transition-colors"
            style={{
              color,
              background: active ? 'color-mix(in srgb, var(--hn-clay) 10%, transparent)' : 'transparent',
            }}
          >
            <Icon size={22} />
            <span className="text-[10px] font-bold leading-[1.15]">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
