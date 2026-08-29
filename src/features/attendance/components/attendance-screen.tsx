'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { Button } from '@/components/ui/button'
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import { useRoster } from '../hooks/use-attendance'
import { markAttendance, bulkMarkAttendance } from '../actions'
import type { AttendanceStatus } from '../types'

const today = () => new Date().toISOString().slice(0, 10)

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
}

export function AttendanceScreen() {
  const classroomsQuery = useClassrooms()
  const [classroomId, setClassroomId] = useState('')
  const date = today()
  const rosterQuery = useRoster(classroomId, date)
  const queryClient = useQueryClient()

  const invalidateRoster = () => queryClient.invalidateQueries({ queryKey: ['roster', classroomId, date] })

  const onMark = async (studentId: string, status: AttendanceStatus) => {
    const result = await markAttendance(studentId, classroomId, date, status)
    if (result.error) {
      toast.error(result.error)
      return
    }
    await invalidateRoster()
  }

  const onMarkAllPresent = async () => {
    const studentIds = rosterQuery.data?.map((r) => r.studentId) ?? []
    if (studentIds.length === 0) return
    const result = await bulkMarkAttendance(studentIds, classroomId, date, 'present')
    if (result.error) {
      toast.error(result.error)
      return
    }
    await invalidateRoster()
  }

  return (
    <PageShell heading="Today's attendance" description={date}>
      <select
        className="h-9 rounded-md border bg-background px-3 text-sm"
        value={classroomId}
        onChange={(e) => setClassroomId(e.target.value)}
      >
        <option value="">Select a classroom</option>
        {classroomsQuery.data?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {!classroomId ? (
        <p className="text-sm text-muted-foreground">Pick a classroom to see its roster.</p>
      ) : rosterQuery.isPending || rosterQuery.isError ? (
        <QueryState
          isPending={rosterQuery.isPending}
          message="Couldn't load the roster."
          onRetry={() => rosterQuery.refetch()}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <Button size="sm" onClick={onMarkAllPresent}>
            Mark all present
          </Button>
          <ul className="divide-y rounded-md border">
            {rosterQuery.data.map((entry) => (
              <li key={entry.studentId} className="flex items-center justify-between p-3">
                <span>
                  {entry.studentName}{' '}
                  {entry.status && (
                    <span className="text-xs text-muted-foreground">({STATUS_LABEL[entry.status]})</span>
                  )}
                </span>
                <span className="flex gap-2">
                  {(['present', 'absent', 'late'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={entry.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onMark(entry.studentId, status)}
                    >
                      {STATUS_LABEL[status]}
                    </Button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PageShell>
  )
}
