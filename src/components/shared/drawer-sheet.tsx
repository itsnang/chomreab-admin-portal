'use client'

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Icons } from '@/components/shared/icons'

const SNAPS = [50, 95] as const
type SnapIndex = 0 | 1

function rubberBand(x: number): number {
  return 80 * (1 - Math.exp(-x / 80))
}

interface DrawerSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  /**
   * Non-scrollable content at the top of the sheet.
   * When provided without title/subtitle (immersive mode), the drag handle
   * and close button are overlaid on top of this content instead of above it.
   */
  topContent?: ReactNode
  /** Which snap to start at — 0 = 50% (default), 1 = 95% */
  initialSnapIndex?: SnapIndex
  /** Pinned below the scroll area — never scrolls away. */
  footer?: ReactNode
  children: ReactNode
}

export function DrawerSheet({ isOpen, ...bodyProps }: DrawerSheetProps) {
  return <AnimatePresence>{isOpen && <DrawerSheetBody {...bodyProps} />}</AnimatePresence>
}

// Mounted only while the drawer is open, so snap state starts fresh on every
// open without needing a reset effect. AnimatePresence keeps the unmounting
// body around (with its last props) until the exit animation finishes.
function DrawerSheetBody({
  onClose,
  title,
  subtitle,
  topContent,
  initialSnapIndex = 0,
  footer,
  children,
}: Omit<DrawerSheetProps, 'isOpen'>) {
  const immersive = !!topContent && !(title ?? subtitle)

  const [snapIndex, setSnapIndex] = useState<SnapIndex>(initialSnapIndex)
  const snapIndexRef = useRef<SnapIndex>(initialSnapIndex)
  useEffect(() => { snapIndexRef.current = snapIndex })

  const heightPct = useMotionValue<number>(SNAPS[initialSnapIndex])
  const heightStyle = useTransform(heightPct, (h) => `${h}%`)

  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number | null>(null)
  const dragBaseHeight = useRef<number>(SNAPS[initialSnapIndex])

  function snapTo(index: SnapIndex) {
    setSnapIndex(index)
    void animate(heightPct, SNAPS[index], { type: 'spring', damping: 32, stiffness: 320 })
  }

  // Scroll-to-expand: scrolling up at top of content advances to next snap
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let startY = 0
    let triggered = false

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0]?.clientY ?? 0
      triggered = false
    }
    const onTouchMove = (e: TouchEvent) => {
      if (triggered || snapIndexRef.current >= 1) return
      const deltaY = (e.touches[0]?.clientY ?? 0) - startY
      if (el.scrollTop === 0 && deltaY < -50) {
        triggered = true
        snapTo(1)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStartY.current = e.clientY
    dragBaseHeight.current = heightPct.get()
  }

  const onHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const startY = dragStartY.current
    if (startY === null) return
    const containerH = containerRef.current?.clientHeight ?? 800
    const deltaPct = ((startY - e.clientY) / containerH) * 100
    const raw = dragBaseHeight.current + deltaPct

    let clamped: number
    if (raw < SNAPS[0]) {
      clamped = SNAPS[0] - rubberBand(SNAPS[0] - raw)
    } else if (raw > SNAPS[1]) {
      clamped = SNAPS[1] + rubberBand(raw - SNAPS[1])
    } else {
      clamped = raw
    }
    heightPct.set(clamped)
  }

  const onHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const startY = dragStartY.current
    if (startY === null) return
    const containerH = containerRef.current?.clientHeight ?? 800
    const deltaPct = ((startY - e.clientY) / containerH) * 100
    dragStartY.current = null

    const current = snapIndexRef.current
    if (deltaPct > 5 && current < 1) {
      snapTo(1)
    } else if (deltaPct < -5) {
      if (current === 0) onClose()
      else snapTo(0)
    } else {
      void animate(heightPct, SNAPS[current], { type: 'spring', damping: 32, stiffness: 320 })
    }
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-60 flex flex-col justify-end overflow-hidden">
      {/* Scrim */}
      <motion.div
        className="absolute inset-0 bg-black/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="relative flex flex-col rounded-t-[28px] overflow-hidden"
        style={{
          background: 'var(--hn-paper)',
          boxShadow: 'var(--hn-drawer-shadow)',
          borderTop: immersive ? 'none' : '1px solid var(--hn-line)',
          height: heightStyle,
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
      >
        {immersive ? (
          /* ── Immersive mode: topContent fills the top, controls overlaid ── */
          <>
            <div className="relative shrink-0">
              {topContent}
              {/* Drag zone + controls float over the topContent */}
              <div
                className="absolute inset-x-0 top-0 select-none touch-none cursor-grab active:cursor-grabbing"
                style={{ height: '72px' }}
                onPointerDown={onHeaderPointerDown}
                onPointerMove={onHeaderPointerMove}
                onPointerUp={onHeaderPointerUp}
              >
                <div className="flex justify-center pt-3">
                  <div className="w-11 h-1.25 rounded-full bg-white/50" />
                </div>
                <div className="flex justify-end px-4 pt-2">
                  <button
                    onClick={onClose}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                    style={{
                      background: 'rgba(255,255,255,0.6)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    } as React.CSSProperties}
                    aria-label="Close drawer"
                  >
                    <Icons.x size={15} style={{ color: 'rgba(0,0,0,0.75)' }} />
                  </button>
                </div>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">
              {children}
            </div>
            {footer && <div className="shrink-0">{footer}</div>}
          </>
        ) : (
          /* ── Standard mode: header with drag zone, then optional topContent ── */
          <>
            <div
              className="shrink-0 select-none touch-none cursor-grab active:cursor-grabbing"
              onPointerDown={onHeaderPointerDown}
              onPointerMove={onHeaderPointerMove}
              onPointerUp={onHeaderPointerUp}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-11 h-1.25 rounded-full" style={{ background: 'var(--hn-line)' }} />
              </div>
              <div className="flex items-start justify-between px-5 pt-2 pb-3">
                <div>
                  {title && (
                    <h2 className="text-[30px] leading-none" style={{ color: 'var(--hn-ink)' }}>
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p
                      className="text-[10.5px] font-semibold tracking-[0.16em] uppercase mt-0.5"
                      style={{ color: 'var(--hn-sub)' }}
                    >
                      {subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="w-10.5 h-10.5 rounded-full flex items-center justify-center border border-hn-line transition-colors hover:bg-hn-line"
                  aria-label="Close drawer"
                >
                  <Icons.x size={16} style={{ color: 'var(--hn-ink-soft)' }} />
                </button>
              </div>
            </div>
            {topContent && <div className="shrink-0">{topContent}</div>}
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">
              {children}
            </div>
            {footer && <div className="shrink-0">{footer}</div>}
          </>
        )}
      </motion.div>
    </div>
  )
}
