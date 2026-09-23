'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icons } from './icons'
import { groupNavItems, NAV_GROUP_LABELS, type NavVariant } from './nav-groups'

interface NavItem {
  href: string
  label: string
  icon: keyof typeof Icons
}

function isActive(pathname: string, item: NavItem) {
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function NavLink({ item, active, compact }: { item: NavItem; active: boolean; compact?: boolean }) {
  const Icon = Icons[item.icon]
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex w-[68px] flex-col items-center gap-1 rounded-lg text-center transition-colors',
        compact ? 'py-1.5' : 'py-2',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
      )}
    >
      <Icon size={compact ? 18 : 22} />
      <span className="text-[10px] leading-[1.15] font-bold">{item.label}</span>
    </Link>
  )
}

/** PROTOTYPE variant A (ticket #22) — same flat rail, but a thin divider and
 *  extra gap mark the cluster boundaries. No labels. */
function VariantDivided({ items, pathname }: { items: readonly NavItem[]; pathname: string }) {
  const groups = groupNavItems(items)
  return (
    <nav className="flex w-full flex-col items-center gap-2">
      {groups.map((group, gi) => (
        <div key={gi} className="flex w-full flex-col items-center gap-2">
          {gi > 0 && <div className="my-1 h-px w-10 bg-border" />}
          {group.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(pathname, item)} />
          ))}
        </div>
      ))}
    </nav>
  )
}

/** PROTOTYPE variant B (ticket #22) — clusters named with a tiny uppercase
 *  micro-label, explicit hierarchy instead of just spacing. */
function VariantLabelled({ items, pathname }: { items: readonly NavItem[]; pathname: string }) {
  const groups = groupNavItems(items)
  return (
    <nav className="flex w-full flex-col items-center gap-3">
      {groups.map((group, gi) => (
        <div key={gi} className="flex w-full flex-col items-center gap-1.5">
          <span className="text-[8px] font-bold tracking-wide text-muted-foreground/60 uppercase">
            {NAV_GROUP_LABELS[gi]}
          </span>
          <div className="flex w-full flex-col items-center gap-1.5">
            {group.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(pathname, item)} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

/** PROTOTYPE variant C (ticket #22) — hierarchy by frequency, not category:
 *  the two most-used destinations stay full-size up top, everything else
 *  drops to a smaller, muted tier below a single divider. */
function VariantFrequency({ items, pathname }: { items: readonly NavItem[]; pathname: string }) {
  const primary = items.slice(0, 2)
  const secondary = items.slice(2)
  return (
    <nav className="flex w-full flex-col items-center gap-2">
      <div className="flex w-full flex-col items-center gap-1.5">
        {primary.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item)} />
        ))}
      </div>
      {secondary.length > 0 && (
        <>
          <div className="my-0.5 h-px w-10 bg-border" />
          <div className="flex w-full flex-col items-center gap-1 opacity-80">
            {secondary.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(pathname, item)} compact />
            ))}
          </div>
        </>
      )}
    </nav>
  )
}

export function DashboardNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const variant = (searchParams.get('variant') ?? 'A') as NavVariant

  if (variant === 'B') return <VariantLabelled items={items} pathname={pathname} />
  if (variant === 'C') return <VariantFrequency items={items} pathname={pathname} />
  return <VariantDivided items={items} pathname={pathname} />
}
