'use client'

// PROTOTYPE for ticket #23 (tighten PageShell density conventions) — delete
// this file and its usage once a variant is chosen.
// https://github.com/itsnang/attendance-admin/issues/23

import { useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const SHELL_VARIANTS = [
  { key: 'current', name: 'Current' },
  { key: 'tight', name: 'Tight' },
  { key: 'divided', name: 'Divided' },
  { key: 'compact-toolbar', name: 'Compact toolbar' },
] as const

export function PrototypeShellSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('shell') ?? 'current'
  const index = Math.max(
    0,
    SHELL_VARIANTS.findIndex((v) => v.key === current)
  )

  const go = useCallback(
    (delta: number) => {
      const next = SHELL_VARIANTS[(index + delta + SHELL_VARIANTS.length) % SHELL_VARIANTS.length]
      if (!next) return
      const params = new URLSearchParams(searchParams.toString())
      params.set('shell', next.key)
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

  const variant = SHELL_VARIANTS[index] ?? { key: 'current' as const, name: 'Current' }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-foreground px-4 py-2 text-background shadow-lg">
      <button
        onClick={() => go(-1)}
        aria-label="Previous shell variant"
        className="text-lg leading-none opacity-80 hover:opacity-100"
      >
        ‹
      </button>
      <span className="text-xs font-bold whitespace-nowrap">
        {variant.key} · {variant.name}
      </span>
      <button
        onClick={() => go(1)}
        aria-label="Next shell variant"
        className="text-lg leading-none opacity-80 hover:opacity-100"
      >
        ›
      </button>
    </div>
  )
}
