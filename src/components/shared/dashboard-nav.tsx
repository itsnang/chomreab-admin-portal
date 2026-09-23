'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icons } from './icons'
import { groupNavItems, NAV_GROUP_LABELS } from './nav-groups'

interface NavItem {
  href: string
  label: string
  icon: keyof typeof Icons
}

export function DashboardNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname()
  const groups = groupNavItems(items)

  return (
    <nav className="flex w-full flex-col items-center gap-3">
      {groups.map((group, groupIndex) => (
        <div key={NAV_GROUP_LABELS[groupIndex]} className="flex w-full flex-col items-center gap-1.5">
          <span className="text-[8px] font-bold tracking-wide text-muted-foreground/60 uppercase">
            {NAV_GROUP_LABELS[groupIndex]}
          </span>
          <div className={cn('flex w-full flex-col items-center gap-1.5', groupIndex > 0 && 'opacity-80')}>
            {group.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = Icons[item.icon]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex w-[68px] flex-col items-center gap-1 rounded-lg text-center transition-colors',
                    groupIndex === 0 ? 'py-2' : 'py-1.5',
                    active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon size={groupIndex === 0 ? 22 : 18} />
                  <span className="text-[10px] leading-[1.15] font-bold">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
