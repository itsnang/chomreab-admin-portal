'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
export function MobileNav({ items, user, signOut }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

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
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = Icons[item.icon]
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
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
