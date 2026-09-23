'use client'

// PROTOTYPE for ticket #22 (regroup the admin nav rail) — delete this file
// and its usage in (dashboard)/layout.tsx once a variant is chosen.
// https://github.com/itsnang/attendance-admin/issues/22

import { useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { NAV_VARIANTS } from './nav-groups'

export function PrototypeNavSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('variant') ?? 'A'
  const index = Math.max(
    0,
    NAV_VARIANTS.findIndex((v) => v.key === current)
  )

  const go = useCallback(
    (delta: number) => {
      const next = NAV_VARIANTS[(index + delta + NAV_VARIANTS.length) % NAV_VARIANTS.length]
      if (!next) return
      const params = new URLSearchParams(searchParams.toString())
      params.set('variant', next.key)
      router.replace(`${pathname}?${params.toString()}`)
    },
    [index, searchParams, pathname, router]
  )

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [go])

  if (process.env.NODE_ENV === 'production') return null

  const variant = NAV_VARIANTS[index] ?? { key: 'A' as const, name: 'Divided' }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-foreground px-4 py-2 text-background shadow-lg">
      <button
        onClick={() => go(-1)}
        aria-label="Previous variant"
        className="text-lg leading-none opacity-80 hover:opacity-100"
      >
        ‹
      </button>
      <span className="text-xs font-bold whitespace-nowrap">
        {variant.key} · {variant.name}
      </span>
      <button
        onClick={() => go(1)}
        aria-label="Next variant"
        className="text-lg leading-none opacity-80 hover:opacity-100"
      >
        ›
      </button>
    </div>
  )
}
