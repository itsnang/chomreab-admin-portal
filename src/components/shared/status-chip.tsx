type AnyStatus = 'present' | 'absent' | 'late' | 'linked' | 'unlinked' | 'checking' | 'active' | 'inactive'

interface ChipStyle {
  label: string
  color: string
}

const STATUS_STYLES: Record<AnyStatus, ChipStyle> = {
  present: { label: 'Present', color: 'var(--hn-success)' },
  absent: { label: 'Absent', color: 'var(--hn-danger)' },
  late: { label: 'Late', color: 'var(--hn-neutral)' },
  linked: { label: 'Linked', color: 'var(--hn-success)' },
  unlinked: { label: 'Unlinked', color: 'var(--hn-sub)' },
  checking: { label: 'Checking…', color: 'var(--hn-sub)' },
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
      {!bare && <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.color }} />}
      {label ?? style.label}
    </span>
  )
}
