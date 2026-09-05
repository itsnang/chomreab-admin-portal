import type React from 'react'
import type { IconProps } from './icons'

export function StatTile({
  icon,
  color,
  value,
  label,
}: {
  icon: (props: IconProps) => React.ReactNode
  color: string
  value: React.ReactNode
  label: string
}) {
  return (
    <div>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
        style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
      >
        {icon({ size: 16, style: { color } })}
      </div>
      <div className="font-mono text-[28px] font-semibold" style={{ color }}>
        {value}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-semibold mt-1" style={{ color: 'var(--hn-sub)' }}>
        {label}
      </div>
    </div>
  )
}
