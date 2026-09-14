import type React from 'react'
import type { IconProps } from './icons'

interface SectionHeaderProps {
  icon: (props: IconProps) => React.ReactNode
  title: string
  subtitle?: string
  /** Right-aligned control on the header row. */
  right?: React.ReactNode
}

export function SectionHeader({ icon, title, subtitle, right }: SectionHeaderProps) {
  return (
    <div className="mb-3.5 flex items-center gap-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon({ size: 16, strokeWidth: 2.2 })}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[13.5px] leading-tight font-bold">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 truncate text-[11.5px] font-medium text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  )
}
