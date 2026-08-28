import { cn } from '@/lib/utils'

interface ThumbProps {
  /** Short label rendered inside the placeholder (no real images yet). */
  label?: string | undefined
  className?: string | undefined
}

/**
 * Hatched image placeholder, mirroring the mockup's `.ph` boxes. Sizing and
 * radius come from `className` so callers control dimensions.
 */
export function Thumb({ label, className }: ThumbProps) {
  return (
    <div
      className={cn(
        'grid place-items-center text-center overflow-hidden font-mono text-[9.5px] tracking-wide',
        className
      )}
      style={{
        color: 'var(--hn-sub)',
        backgroundColor: 'var(--hn-hair)',
        backgroundImage:
          'repeating-linear-gradient(135deg, transparent 0 7px, color-mix(in srgb, var(--hn-sub) 13%, transparent) 7px 8px)',
      }}
    >
      {label}
    </div>
  )
}
