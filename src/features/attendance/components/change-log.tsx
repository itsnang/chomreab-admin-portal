'use client'

import { QueryState } from '@/components/shared/query-state'
import { IconRow } from '@/components/shared/icon-row'
import { Icons } from '@/components/shared/icons'
import { statusLabel } from '@/components/shared/status-chip'
import type { Tone } from '@/components/shared/tone'
import type { IconProps } from '@/components/shared/icons'
import { useAuditLog } from '../hooks/use-attendance'
import type { AttendanceStatus } from '../types'

const ENTRY_STYLE: Record<AttendanceStatus, { tone: Tone; icon: (props: IconProps) => React.ReactNode }> = {
  present: { tone: 'present', icon: Icons.check },
  late: { tone: 'late', icon: Icons.clock },
  absent: { tone: 'absent', icon: Icons.x },
}

interface ChangeLogProps {
  classroomId: string
  date: string
}

export function ChangeLog({ classroomId, date }: ChangeLogProps) {
  const query = useAuditLog(classroomId, date)

  return (
    <div className="rounded-xl border bg-card p-4 shadow-card-sm">
      <div className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Change log
      </div>
      {query.isPending || query.isError ? (
        <QueryState
          isPending={query.isPending}
          message="Couldn't load the change log."
          onRetry={() => query.refetch()}
          className="py-6"
        />
      ) : query.data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {query.data.map((entry, i) => {
            const { tone, icon } = ENTRY_STYLE[entry.newStatus]
            return (
              <IconRow
                key={i}
                icon={icon}
                tone={tone}
                title={
                  <>
                    {entry.changedByName} changed {entry.studentName} from{' '}
                    {statusLabel(entry.previousStatus)} to {statusLabel(entry.newStatus)}
                  </>
                }
                subtitle={new Date(entry.changedAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              />
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nothing changed yet on this day.</p>
      )}
    </div>
  )
}
