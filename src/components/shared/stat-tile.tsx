import type React from 'react'
import { cn } from '@/lib/utils'
import { TONE_MUTED_BG, TONE_TEXT, type Tone } from './tone'
import type { IconProps } from './icons'

interface StatTileProps {
  icon: (props: IconProps) => React.ReactNode
  /** Names a semantic role rather than a colour, so the palette stays in one
   *  place and a tile can't drift off the scale. */
  tone: Tone
  value: React.ReactNode
  label: string
}

export function StatTile({ icon, tone, value, label }: StatTileProps) {
  return (
    <div>
      <div
        className={cn(
          'mb-2 flex size-9 items-center justify-center rounded-lg',
          TONE_MUTED_BG[tone],
          TONE_TEXT[tone]
        )}
      >
        {icon({ size: 16 })}
      </div>
      <div className={cn('font-mono text-[28px] font-semibold', TONE_TEXT[tone])}>{value}</div>
      <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {label}
      </div>
    </div>
  )
}
