import type React from 'react'
import { cn } from '@/lib/utils'
import { TONE_MUTED_BG, TONE_TEXT, type Tone } from './tone'
import type { IconProps } from './icons'

interface IconRowProps {
  icon: (props: IconProps) => React.ReactNode
  tone: Tone
  title: React.ReactNode
  subtitle?: React.ReactNode
}

export function IconRow({ icon, tone, title, subtitle }: IconRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex size-8 flex-none items-center justify-center rounded-lg',
          TONE_MUTED_BG[tone],
          TONE_TEXT[tone]
        )}
      >
        {icon({ size: 14 })}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </div>
  )
}
