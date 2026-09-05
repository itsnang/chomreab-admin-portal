import type React from 'react'
import type { IconProps } from './icons'

export function IconRow({
  icon,
  color,
  title,
  subtitle,
}: {
  icon: (props: IconProps) => React.ReactNode
  color: string
  title: React.ReactNode
  subtitle?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-lg flex-none flex items-center justify-center"
        style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
      >
        {icon({ size: 14, style: { color } })}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm">{title}</div>
        {subtitle && (
          <div className="text-xs" style={{ color: 'var(--hn-sub)' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
