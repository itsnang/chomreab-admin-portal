'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Icons } from './icons'
import { InitialAvatar } from './initial-avatar'
import { Logo } from './logo'
import { groupNavItems, NAV_GROUP_LABELS, type NavVariant } from './nav-groups'

export interface MobileNavItem {
  href: string
  label: string
  icon: keyof typeof Icons
}

interface MobileNavProps {
  items: readonly MobileNavItem[]
  user: { id: string; name: string; role: string }
  /** Rendered inside the sheet's account block — the sign-out form, which has
   *  to stay a Server Action form. */
  signOut: React.ReactNode
}

/**
 * Navigation for phones. A bottom bar was tried first and could not work: an
 * admin has six destinations plus an account block, which is nine targets
 * across 375px. A sheet holds any number of them at a comfortable size and
 * leaves the full width to the content.
 */
function NavLink({
  item,
  active,
  onNavigate,
  compact,
}: {
  item: MobileNavItem
  active: boolean
  onNavigate: () => void
  compact?: boolean
}) {
  const Icon = Icons[item.icon]
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors',
        compact ? 'py-2 text-muted-foreground/80' : 'py-2.5',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
      )}
    >
      <Icon size={compact ? 16 : 18} />
      {item.label}
    </Link>
  )
}

export function MobileNav({ items, user, signOut }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const variant = (searchParams.get('variant') ?? 'A') as NavVariant

  const isActive = (item: MobileNavItem) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  const onNavigate = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Icons.menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[17rem] p-0">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2.5">
            <Logo className="size-8 flex-none text-primary" />
            Chomreab
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-3">
          {variant === 'C' ? (
            <>
              {items.slice(0, 2).map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item)} onNavigate={onNavigate} />
              ))}
              {items.length > 2 && (
                <>
                  <div className="my-1 h-px bg-border" />
                  {items.slice(2).map((item) => (
                    <NavLink key={item.href} item={item} active={isActive(item)} onNavigate={onNavigate} compact />
                  ))}
                </>
              )}
            </>
          ) : (
            groupNavItems(items).map((group, gi) => (
              <div key={gi} className="flex flex-col gap-1">
                {gi > 0 &&
                  (variant === 'B' ? (
                    <span className="mt-2 mb-0.5 px-3 text-[10px] font-bold tracking-wide text-muted-foreground/60 uppercase">
                      {NAV_GROUP_LABELS[gi]}
                    </span>
                  ) : (
                    <div className="my-1 h-px bg-border" />
                  ))}
                {variant === 'B' && gi === 0 && (
                  <span className="mb-0.5 px-3 text-[10px] font-bold tracking-wide text-muted-foreground/60 uppercase">
                    {NAV_GROUP_LABELS[gi]}
                  </span>
                )}
                {group.map((item) => (
                  <NavLink key={item.href} item={item} active={isActive(item)} onNavigate={onNavigate} />
                ))}
              </div>
            ))
          )}
        </nav>

        <div className="mt-auto border-t p-3">
          <div className="mb-2 flex items-center gap-2.5 px-1">
            <InitialAvatar id={user.id} name={user.name} />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
            </div>
          </div>
          <Link
            href="/change-password"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            <Icons.key size={18} />
            Password
          </Link>
          {signOut}
        </div>
      </SheetContent>
    </Sheet>
  )
}
