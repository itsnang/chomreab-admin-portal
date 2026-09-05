import type React from 'react'
import type { IconProps } from './icons'

export function SectionHeader({
  icon,
  title,
  subtitle,
  right,
}: {
  icon: (props: IconProps) => React.ReactNode
  title: string
  subtitle?: string
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3.5">
      <span
        className="grid place-items-center w-8 h-8 rounded-[10px] shrink-0"
        style={{ background: 'color-mix(in srgb, var(--hn-clay) 10%, transparent)', color: 'var(--hn-clay)' }}
      >
        {icon({ size: 16, strokeWidth: 2.2 })}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-[13.5px] font-bold leading-tight" style={{ color: 'var(--hn-ink)' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11.5px] font-medium mt-0.5 truncate" style={{ color: 'var(--hn-sub)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  )
}
