'use client'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

NProgress.configure({ showSpinner: false, trickle: true, trickleSpeed: 150 })

export function NavigationProgress() {
  const pathname = usePathname()
  const prevPathRef = useRef(pathname)

  // Stop when route changes complete
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname
      NProgress.done()
    }
  }, [pathname])

  // Start on link click — no timers shared with the stop path
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest<HTMLAnchorElement>('a[href]')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/')) return
      const target = anchor.getAttribute('target')
      if (target === '_blank') return
      const dest = new URL(href, window.location.href)
      if (dest.pathname === pathname) return
      NProgress.start()
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname])

  return null
}
