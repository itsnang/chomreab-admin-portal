import { cn } from '@/lib/utils'
import { TONE_BG, TONE_MUTED_BG, TONE_TEXT, type Tone } from './tone'

export type Status =
  | 'present'
  | 'absent'
  | 'late'
  | 'unmarked'
  | 'linked'
  | 'unlinked'
  | 'checking'
  | 'active'
  | 'inactive'

const STATUS_STYLES: Record<Status, { label: string; tone: Tone }> = {
  present: { label: 'Present', tone: 'present' },
  absent: { label: 'Absent', tone: 'absent' },
  late: { label: 'Late', tone: 'late' },
  unmarked: { label: 'Unmarked', tone: 'unmarked' },
  linked: { label: 'Linked', tone: 'present' },
  unlinked: { label: 'Unlinked', tone: 'unmarked' },
  checking: { label: 'Checking…', tone: 'unmarked' },
  active: { label: 'Active', tone: 'present' },
  inactive: { label: 'Inactive', tone: 'unmarked' },
}

interface StatusChipProps {
  status: Status
  /** Overrides the default label — e.g. "Unlinked · ABC123". */
  label?: string
  /** Hides the leading dot, for chips shown beside another colour cue. */
  bare?: boolean
}

/** The display label for a status, without rendering a chip — for reuse
 *  anywhere a status needs a human-readable name (dropdown options, dialog
 *  copy, segment filters) without duplicating `STATUS_STYLES`' strings. */
export function statusLabel(status: Status): string {
  return STATUS_STYLES[status].label
}

export function StatusChip({ status, label, bare = false }: StatusChipProps) {
  const { label: defaultLabel, tone } = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold whitespace-nowrap',
        TONE_MUTED_BG[tone],
        TONE_TEXT[tone]
      )}
    >
      {!bare && <span className={cn('size-1.5 rounded-full', TONE_BG[tone])} aria-hidden="true" />}
      {label ?? defaultLabel}
    </span>
  )
}
