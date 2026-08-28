'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * Read and update a single URL query param from a client component. Updates use
 * `router.replace` (no extra history entry) and skip scrolling, so search and
 * filter state lives in the URL — shareable and restored on reload — without
 * jumping the page. An empty value removes the param to keep the URL clean.
 */
export function useSearchParam(
  key: string
): readonly [string, (value: string) => void] {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const value = searchParams.get(key) ?? ''

  const setValue = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next) params.set(key, next)
      else params.delete(key)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [key, pathname, router, searchParams]
  )

  return [value, setValue] as const
}
