'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icons } from './icons'

interface NavItem {
  href: string
  label: string
  icon: keyof typeof Icons
}

export function DashboardNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav className="flex w-full flex-col items-center gap-2">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = Icons[item.icon]
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex w-[68px] flex-col items-center gap-1 rounded-lg py-2 text-center transition-colors',
              active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Icon size={22} />
            <span className="text-[10px] leading-[1.15] font-bold">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
