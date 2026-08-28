type AnyStatus =
  | 'live'
  | 'low'
  | 'hidden'
  | 'new'
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'active'
  | 'inactive'

interface ChipStyle {
  label: string
  color: string
}

const STATUS_STYLES: Record<AnyStatus, ChipStyle> = {
  new: { label: 'New', color: 'var(--hn-clay)' },
  pending: { label: 'Pending', color: 'var(--hn-clay)' },
  preparing: { label: 'Preparing', color: 'var(--hn-cart)' },
  ready: { label: 'Ready', color: 'var(--hn-success)' },
  completed: { label: 'Completed', color: 'var(--hn-sub)' },
  cancelled: { label: 'Cancelled', color: 'var(--hn-wish)' },
  live: { label: 'Live', color: 'var(--hn-success)' },
  low: { label: 'Low', color: 'var(--hn-wish)' },
  hidden: { label: 'Hidden', color: 'var(--hn-sub)' },
  active: { label: 'Active', color: 'var(--hn-success)' },
  inactive: { label: 'Inactive', color: 'var(--hn-sub)' },
}

interface StatusChipProps {
  status: AnyStatus
  label?: string
  bare?: boolean
}

/** The display label for a status, without rendering a chip — for reuse
 *  anywhere a status needs a human-readable name (dropdown options, dialog
 *  copy, segment filters) without duplicating `STATUS_STYLES`' strings. */
export function statusLabel(status: AnyStatus): string {
  return STATUS_STYLES[status].label
}

export function StatusChip({ status, label, bare = false }: StatusChipProps) {
  const style = STATUS_STYLES[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap"
      style={{
        color: style.color,
        background: `color-mix(in srgb, ${style.color} 14%, transparent)`,
      }}
    >
      {!bare && (
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.color }} />
      )}
      {label ?? style.label}
    </span>
  )
}
