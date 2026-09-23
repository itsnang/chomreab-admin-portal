import type { ReactNode } from 'react'
import { Logo } from '@/components/shared/logo'

/**
 * Split-panel shell shared by every screen in the `(auth)` route group: the
 * form column on the left, a decorative brand panel on the right that drops
 * away below `lg` so phones get a single centred column. Screens render only
 * their heading and fields — the brand mark, spacing and footer live here.
 *
 * The outer grid is pinned to the viewport height (`h-svh`, not `min-h-svh`)
 * so a tall form never grows the whole page — only the form column scrolls
 * internally, and the brand panel always stays fully visible with no
 * page-level scrollbar.
 */
export function AuthShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid h-svh w-full bg-background lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center overflow-y-auto px-5 py-8 lg:px-10 lg:py-6">
        <div className="w-full max-w-[380px] py-4">
          <div className="mb-10 flex items-center justify-center gap-2.5">
            <Logo className="size-8 flex-none text-primary" />
            <span className="text-[17px] font-bold">Chomreab</span>
          </div>
          {children}
          {footer && (
            <p className="mt-6 text-center text-[12px] leading-relaxed text-muted-foreground">{footer}</p>
          )}
        </div>
      </div>

      <div className="hidden p-3 lg:block">
        <BrandPanel />
      </div>
    </div>
  )
}

/** Gradient panel with an abstract check-in motif — pure CSS + inline SVG so
 *  there's no image asset to ship, and it re-tints itself in dark mode since
 *  every colour is mixed from the theme's own `--primary` token. */
function BrandPanel() {
  return (
    <div
      className="relative flex h-full w-full flex-col justify-end overflow-hidden rounded-[28px] p-10"
      style={{
        background:
          'linear-gradient(155deg, color-mix(in srgb, hsl(var(--primary)) 22%, hsl(var(--background))) 0%, color-mix(in srgb, hsl(var(--primary)) 60%, hsl(var(--background))) 55%, color-mix(in srgb, hsl(var(--primary)) 92%, hsl(var(--background))) 100%)',
      }}
    >
      <CheckInMotif />
      <div className="relative">
        <h2 className="max-w-[16ch] text-[30px] leading-[1.15] tracking-[-0.01em] text-white">
          Attendance, sorted.
        </h2>
        <p className="mt-3 max-w-[34ch] text-[13.5px] leading-relaxed text-white/78">
          Mark attendance once and parents know on Telegram instantly — from
          the front desk or the phone in your pocket.
        </p>
      </div>
    </div>
  )
}

/** Echoes the wordmark's own shape (an archway with a checkmark — "a doorway
 *  you are recorded as having walked through") scaled up, with two floating
 *  chips standing in for the two things this product actually does: mark a
 *  status, notify a parent. */
function CheckInMotif() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-x-0 top-[8%] mx-auto w-[62%] max-w-[360px]"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="200" cy="190" r="150" fill="rgba(255,255,255,0.10)" />
      <circle cx="200" cy="190" r="104" fill="rgba(255,255,255,0.10)" />

      {/* Archway — the wordmark's own path, scaled up */}
      <path
        d="M136 262V182C136 131 168 96 200 96C232 96 264 131 264 182V262"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M168 198L192 224L232 164"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* "Present" status chip, floating upper-left */}
      <g transform="translate(30, 90)">
        <rect width="108" height="34" rx="17" fill="rgba(255,255,255,0.16)" />
        <circle cx="20" cy="17" r="5" fill="rgba(255,255,255,0.9)" />
        <rect x="36" y="12" width="56" height="10" rx="5" fill="rgba(255,255,255,0.55)" />
      </g>

      {/* Telegram-notification chip, floating lower-right */}
      <g transform="translate(272, 258)">
        <rect width="98" height="34" rx="17" fill="rgba(255,255,255,0.16)" />
        <circle cx="17" cy="17" r="9" fill="rgba(255,255,255,0.9)" />
        <path
          d="M13 17l3 3 6-7"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="34" y="12" width="48" height="10" rx="5" fill="rgba(255,255,255,0.55)" />
      </g>
    </svg>
  )
}
