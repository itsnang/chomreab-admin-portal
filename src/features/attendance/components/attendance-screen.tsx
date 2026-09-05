'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { StatTile } from '@/components/shared/stat-tile'
import { IconRow } from '@/components/shared/icon-row'
import { Icons } from '@/components/shared/icons'
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
import { useMyClasses, useRoster, useAuditLog } from '../hooks/use-attendance'
import { markAttendance, bulkMarkAttendance } from '../actions'
import { RosterRow } from './roster-row'
import type { AttendanceStatus } from '../types'

const today = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function AttendanceScreen() {
  const date = today()
  const classesQuery = useMyClasses(date)
  const [classroomId, setClassroomId] = useState('')
  const rosterQuery = useRoster(classroomId, date)
  const auditLogQuery = useAuditLog(classroomId, date)
  const queryClient = useQueryClient()
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null)
  const [isBulkPending, setIsBulkPending] = useState(false)
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false)

  const activeClass = classesQuery.data?.find((c) => c.classroomId === classroomId)

  const invalidateAll = () => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ['roster', classroomId, date] }),
      queryClient.invalidateQueries({ queryKey: ['my-classes', date] }),
      queryClient.invalidateQueries({ queryKey: ['audit-log', classroomId, date] }),
    ])
  }

  const onMark = async (studentId: string, status: AttendanceStatus, note?: string) => {
    setPendingStudentId(studentId)
    try {
      const result = await markAttendance(studentId, classroomId, date, status, note)
      if (result.error) {
        toast.error(result.error)
        return
      }
      await invalidateAll()
    } finally {
      setPendingStudentId(null)
    }
  }

  const onMarkAllPresent = async () => {
    const studentIds = rosterQuery.data?.filter((r) => !r.status).map((r) => r.studentId) ?? []
    if (studentIds.length === 0) return
    setIsBulkPending(true)
    try {
      const result = await bulkMarkAttendance(studentIds, classroomId, date, 'present')
      if (result.error) {
        toast.error(result.error)
        return
      }
      await invalidateAll()
    } finally {
      setIsBulkPending(false)
    }
  }

  const roster = rosterQuery.data ?? []
  const counts = {
    present: roster.filter((r) => r.status === 'present').length,
    late: roster.filter((r) => r.status === 'late').length,
    absent: roster.filter((r) => r.status === 'absent').length,
    unmarked: roster.filter((r) => !r.status).length,
  }

  return (
    <PageShell heading="Today's attendance" description={date}>
      {classesQuery.isPending || classesQuery.isError ? (
        <QueryState
          isPending={classesQuery.isPending}
          message="Couldn't load your classes."
          onRetry={() => classesQuery.refetch()}
        />
      ) : classesQuery.data.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--hn-sub)' }}>
          You have no classes assigned yet.
        </p>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: '260px minmax(0,1fr)' }}>
          <div
            className="rounded-[18px] p-4 h-fit"
            style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}
          >
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--hn-sub)' }}>
              My classes today
            </div>
            <div className="flex flex-col gap-1.5">
              {classesQuery.data.map((c) => {
                const on = c.classroomId === classroomId
                const done = c.unmarkedCount === 0
                return (
                  <button
                    key={c.classroomId}
                    type="button"
                    onClick={() => setClassroomId(c.classroomId)}
                    className="text-left rounded-xl px-3 py-2.5 border flex items-center gap-2.5"
                    style={
                      on
                        ? { background: 'var(--hn-clay)', borderColor: 'var(--hn-clay)', color: '#fff' }
                        : { background: 'var(--hn-surface)', borderColor: 'var(--hn-line)', color: 'var(--hn-ink)' }
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{c.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: on ? 'rgba(255,255,255,0.75)' : 'var(--hn-sub)' }}>
                        {c.gradeLabel ? `${c.gradeLabel} · ` : ''}
                        {c.studentCount} students
                      </div>
                    </div>
                    <span
                      className="text-[11px] font-bold rounded-full px-2.5 py-1 whitespace-nowrap"
                      style={
                        done
                          ? { background: 'var(--hn-success)', color: '#fff' }
                          : { background: 'var(--hn-line-2)', color: 'var(--hn-neutral)' }
                      }
                    >
                      {done ? 'Done' : `${c.unmarkedCount} left`}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {!classroomId ? (
            <p className="text-sm" style={{ color: 'var(--hn-sub)' }}>
              Pick a class to take attendance.
            </p>
          ) : rosterQuery.isPending || rosterQuery.isError ? (
            <QueryState
              isPending={rosterQuery.isPending}
              message="Couldn't load the roster."
              onRetry={() => rosterQuery.refetch()}
            />
          ) : (
            <div className="flex flex-col gap-4 min-w-0">
              <div
                className="rounded-[18px] p-6"
                style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--hn-clay)' }}>
                      Today&apos;s class
                    </div>
                    <div className="text-[34px] font-extrabold tracking-tight leading-none">{activeClass?.name}</div>
                  </div>
                  <AlertDialog open={confirmBulkOpen} onOpenChange={setConfirmBulkOpen}>
                    <div className="flex gap-2">
                      <Button disabled={isBulkPending || counts.unmarked === 0} onClick={() => setConfirmBulkOpen(true)}>
                        Mark all present
                      </Button>
                    </div>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark remaining students present?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This marks the {counts.unmarked} still-unmarked students present and notifies their
                          linked parents. Students already marked today are left as-is.
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
                </div>
                <div className="flex mt-5 pt-4" style={{ borderTop: '1px solid var(--hn-line-2)' }}>
                  {(
                    [
                      { key: 'present', label: 'Present', color: 'var(--hn-success)', icon: Icons.check },
                      { key: 'late', label: 'Late', color: 'var(--hn-neutral)', icon: Icons.clock },
                      { key: 'absent', label: 'Absent', color: 'var(--hn-danger)', icon: Icons.x },
                      { key: 'unmarked', label: 'Unmarked', color: 'var(--hn-sub)', icon: Icons.minus },
                    ] as const
                  ).map((stat, i) => (
                    <div key={stat.key} className="flex-1 px-4" style={i > 0 ? { borderLeft: '1px solid var(--hn-line-2)' } : undefined}>
                      <StatTile icon={stat.icon} color={stat.color} value={counts[stat.key]} label={stat.label} />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-[18px] overflow-hidden"
                style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}
              >
                {roster.length === 0 ? (
                  <p className="text-sm p-5" style={{ color: 'var(--hn-sub)' }}>
                    This class has no students yet.
                  </p>
                ) : (
                  <>
                    {roster.map((entry) => (
                      <RosterRow
                        key={entry.studentId}
                        entry={entry}
                        pending={pendingStudentId === entry.studentId}
                        onMark={(status, note) => onMark(entry.studentId, status, note)}
                      />
                    ))}
                    <div className="px-5 py-3.5 text-xs" style={{ background: 'var(--hn-surface-2)', color: 'var(--hn-sub)' }}>
                      Parents are notified on Telegram the moment you mark their child — unlinked parents are skipped.
                    </div>
                  </>
                )}
              </div>

              <div
                className="rounded-[18px] p-[15px]"
                style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}
              >
                <div className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: 'var(--hn-sub)' }}>
                  Change log
                </div>
                {auditLogQuery.isPending || auditLogQuery.isError ? (
                  <QueryState
                    isPending={auditLogQuery.isPending}
                    message="Couldn't load the change log."
                    onRetry={() => auditLogQuery.refetch()}
                  />
                ) : auditLogQuery.data && auditLogQuery.data.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {auditLogQuery.data.map((e, i) => {
                      const { color, icon } = (
                        {
                          present: { color: 'var(--hn-success)', icon: Icons.check },
                          late: { color: 'var(--hn-neutral)', icon: Icons.clock },
                          absent: { color: 'var(--hn-danger)', icon: Icons.x },
                        } as const
                      )[e.newStatus]
                      return (
                        <IconRow
                          key={i}
                          icon={icon}
                          color={color}
                          title={
                            <>
                              {e.changedByName} changed {e.studentName} from {e.previousStatus} to {e.newStatus}
                            </>
                          }
                          subtitle={new Date(e.changedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        />
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--hn-sub)' }}>
                    Nothing changed yet today.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  )
}
