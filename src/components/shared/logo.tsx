/**
 * The Chomreab mark: an archway with a check inside it — a doorway you are
 * recorded as having walked through.
 *
 * The supplied artwork ships one file per colour (blue/white/black). Those are
 * the same two paths every time, so this draws them once and takes its colour
 * from `currentColor`; a caller picks the colour with a text utility and the
 * mark follows, including on the dark header where it knocks out to white.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M17 51V30.5C17 22.2 23.7 15.5 32 15.5C40.3 15.5 47 22.2 47 30.5V51"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M27 34.5L31.5 39L37.5 28.5"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The mark reversed out of a filled tile, for the places it stands alone with
 * no wordmark beside it to identify it — the desktop rail, and the Telegram
 * avatar this mirrors.
 */
export function LogoTile({ className }: { className?: string }) {
  return (
    <span
      className={`grid flex-none place-items-center rounded-lg bg-primary text-primary-foreground ${className ?? ''}`}
      aria-hidden="true"
    >
      <Logo className="size-[62%]" />
    </span>
  )
}
