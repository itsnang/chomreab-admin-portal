'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'

/**
 * Icon button that flips between light and dark. Uses next-themes (the
 * project's ThemeProvider) and a mounted guard so the icon doesn't mismatch
 * during hydration.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="grid size-[38px] place-items-center rounded-lg bg-muted text-foreground/80 transition-colors hover:bg-accent"
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  )
}
