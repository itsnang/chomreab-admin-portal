'use client'

import { cn } from '@/lib/utils'
import { TONE_BORDER, TONE_MUTED_BG, TONE_TEXT, type Tone } from './tone'

export interface Segment<T extends string> {
  value: T
  label: string
  /** Colour worn when this segment is the selected one. */
  tone?: Tone
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[]
  /** `null` means nothing is chosen yet — every segment renders unselected. */
  value: T | null
  onChange: (value: T) => void
  /** Segments share the width evenly instead of hugging their labels. */
  stretch?: boolean
  size?: 'sm' | 'md'
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

/**
 * A row of mutually exclusive choices rendered as one control rather than loose
 * buttons — used for marking a student and for filtering a list. Exposed as a
 * radiogroup so the selected option is announced as selected.
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  stretch = false,
  size = 'md',
  disabled = false,
  className,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={props['aria-label']} className={cn('flex gap-1.5', className)}>
      {segments.map((segment) => {
        const selected = segment.value === value
        const tone = segment.tone ?? 'primary'
        return (
          <button
            key={segment.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(segment.value)}
            className={cn(
              'cursor-pointer rounded-md border font-bold whitespace-nowrap transition-colors',
              'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
              'disabled:pointer-events-none disabled:opacity-60',
              stretch && 'flex-1',
              // Tight enough that three stretched segments fit a phone row.
              size === 'sm'
                ? 'px-2 py-1.5 text-xs sm:px-3'
                : 'px-2 py-2 text-xs sm:px-3 sm:text-[13px]',
              selected
                ? cn(TONE_BORDER[tone], TONE_MUTED_BG[tone], TONE_TEXT[tone])
                : 'border-border bg-card text-muted-foreground hover:bg-muted'
            )}
          >
            {segment.label}
          </button>
        )
      })}
    </div>
  )
}
