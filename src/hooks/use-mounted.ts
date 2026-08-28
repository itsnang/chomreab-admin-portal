import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

/**
 * Returns false during SSR / first render, true after mount — a hydration-safe
 * guard for client-only values (theme, locale, etc.) without an effect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}
