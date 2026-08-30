'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import { useRoster } from '../hooks/use-attendance'
import { markAttendance, bulkMarkAttendance } from '../actions'
import type { AttendanceStatus } from '../types'

const today = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null)
  const [isBulkPending, setIsBulkPending] = useState(false)
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false)

  const invalidateRoster = () => queryClient.invalidateQueries({ queryKey: ['roster', classroomId, date] })

  const onMark = async (studentId: string, status: AttendanceStatus) => {
    setPendingStudentId(studentId)
    try {
      const result = await markAttendance(studentId, classroomId, date, status)
      if (result.error) {
        toast.error(result.error)
        return
      }
      await invalidateRoster()
    } finally {
      setPendingStudentId(null)
    }
  }

  const onMarkAllPresent = async () => {
    const studentIds = rosterQuery.data?.map((r) => r.studentId) ?? []
    if (studentIds.length === 0) return
    setIsBulkPending(true)
    try {
      const result = await bulkMarkAttendance(studentIds, classroomId, date, 'present')
      if (result.error) {
        toast.error(result.error)
        return
      }
      await invalidateRoster()
    } finally {
      setIsBulkPending(false)
    }
  }

  const rosterCount = rosterQuery.data?.length ?? 0

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
          <AlertDialog open={confirmBulkOpen} onOpenChange={setConfirmBulkOpen}>
            <Button
              size="sm"
              disabled={isBulkPending || rosterCount === 0}
              onClick={() => setConfirmBulkOpen(true)}
            >
              Mark all present
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mark all students present?</AlertDialogTitle>
                <AlertDialogDescription>
                  Mark all {rosterCount} students present? This will overwrite any existing marks for today and
                  notify parents.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setConfirmBulkOpen(false)
                    void onMarkAllPresent()
                  }}
                >
                  Mark all present
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
                      disabled={pendingStudentId === entry.studentId}
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
