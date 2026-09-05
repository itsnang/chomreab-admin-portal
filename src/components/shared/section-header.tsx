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
      <div
        className="w-9 h-9 rounded-lg flex-none flex items-center justify-center"
        style={{ background: 'color-mix(in srgb, var(--hn-clay) 14%, transparent)' }}
      >
        {icon({ size: 16, style: { color: 'var(--hn-clay)' } })}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base font-extrabold">{title}</div>
        {subtitle && (
          <div className="text-xs truncate" style={{ color: 'var(--hn-sub)' }}>
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </div>
  )
}
