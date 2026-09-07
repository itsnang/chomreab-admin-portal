'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { EmptyState } from '@/components/shared/empty-state'
import { StatTile } from '@/components/shared/stat-tile'
import { ConfirmButton } from '@/components/shared/confirm-button'
import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { addDays, formatWeekday, isToday, today } from '@/lib/format/date'
import { useMyClasses, useRoster } from '../hooks/use-attendance'
import { saveRoster } from '../actions'
import type { AttendanceStatus, StagedMark } from '../types'
import { ClassRail } from './class-rail'
import { RosterRow } from './roster-row'
import { SaveBar } from './save-bar'
import { ChangeLog } from './change-log'

const STATS = [
  { key: 'present', label: 'Present', tone: 'present', icon: Icons.check },
  { key: 'late', label: 'Late', tone: 'late', icon: Icons.clock },
  { key: 'absent', label: 'Absent', tone: 'absent', icon: Icons.x },
  { key: 'unmarked', label: 'Unmarked', tone: 'unmarked', icon: Icons.minus },
] as const

export function AttendanceScreen() {
  const [date, setDate] = useState(today())
  const [classroomId, setClassroomId] = useState('')
  // Staged marks are kept per class *and* per day, so stepping back to check
  // yesterday and returning doesn't throw away unsaved work.
  const [stagedByContext, setStagedByContext] = useState<
    Record<string, Record<string, StagedMark>>
  >({})
  const [isSaving, setIsSaving] = useState(false)

  const classesQuery = useMyClasses(date)
  const rosterQuery = useRoster(classroomId, date)
  const queryClient = useQueryClient()

  const contextKey = `${classroomId}|${date}`
  const staged = useMemo(() => stagedByContext[contextKey] ?? {}, [stagedByContext, contextKey])
  const pending = Object.values(staged)

  const dirtyClassroomIds = useMemo(() => {
    const ids = new Set<string>()
    for (const [key, marks] of Object.entries(stagedByContext)) {
      if (Object.keys(marks).length === 0) continue
      const [id, keyDate] = key.split('|')
      if (id && keyDate === date) ids.add(id)
    }
    return ids
  }, [stagedByContext, date])

  const updateStaged = (
    update: (current: Record<string, StagedMark>) => Record<string, StagedMark>,
  ) => {
    setStagedByContext((contexts) => ({
      ...contexts,
      [contextKey]: update(contexts[contextKey] ?? {}),
    }))
  }

  const roster = useMemo(() => rosterQuery.data ?? [], [rosterQuery.data])
  const activeClass = classesQuery.data?.find((c) => c.classroomId === classroomId)

  const counts = useMemo(() => {
    const tally = { present: 0, late: 0, absent: 0, unmarked: 0 }
    for (const entry of roster) {
      const status = staged[entry.studentId]?.status ?? entry.status
      if (status) tally[status] += 1
      else tally.unmarked += 1
    }
    return tally
  }, [roster, staged])

  const stage = (studentId: string, status: AttendanceStatus, note: string | null) => {
    updateStaged((current) => ({ ...current, [studentId]: { studentId, status, note } }))
  }

  const markRemainingPresent = () => {
    updateStaged((current) => {
      const next = { ...current }
      for (const entry of roster) {
        if ((next[entry.studentId]?.status ?? entry.status) !== null) continue
        next[entry.studentId] = { studentId: entry.studentId, status: 'present', note: entry.note }
      }
      return next
    })
  }

  const save = async () => {
    setIsSaving(true)
    const result = await saveRoster(classroomId, date, pending)
    setIsSaving(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    updateStaged(() => ({}))
    toast.success(`Saved ${pending.length} change${pending.length === 1 ? '' : 's'}.`)
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['roster', classroomId, date] }),
      queryClient.invalidateQueries({ queryKey: ['my-classes', date] }),
      queryClient.invalidateQueries({ queryKey: ['audit-log', classroomId, date] }),
    ])
  }

  return (
    <PageShell
      heading="Attendance"
      description="Mark the roster, then save to notify parents."
      actions={
        // Rosters are stored per date, so a teacher can correct yesterday
        // without waiting for an admin.
        <div className="flex items-center gap-1 rounded-md border bg-card p-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous day"
            onClick={() => setDate(addDays(date, -1))}
          >
            <Icons.chevronLeft />
          </Button>
          <span className="min-w-[104px] text-center text-[13px] font-semibold">
            {isToday(date) ? 'Today' : formatWeekday(date)}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next day"
            disabled={isToday(date)}
            onClick={() => setDate(addDays(date, 1))}
          >
            <Icons.chevronRight />
          </Button>
        </div>
      }
    >
      <div className="grid items-start gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ClassRail
          classes={classesQuery.data}
          isPending={classesQuery.isPending}
          isError={classesQuery.isError}
          onRetry={() => classesQuery.refetch()}
          classroomId={classroomId}
          onSelect={setClassroomId}
          dirtyClassroomIds={dirtyClassroomIds}
        />

        <div className="flex min-w-0 flex-col gap-4">
          {!classroomId ? (
            <div className="rounded-xl border bg-card shadow-card-sm">
              <EmptyState
                icon={<Icons.clipboardCheck />}
                title="Pick a class"
                description="Choose one of your classes to see its roster for the day."
              />
            </div>
          ) : rosterQuery.isPending || rosterQuery.isError ? (
            <div className="rounded-xl border bg-card shadow-card-sm">
              <QueryState
                isPending={rosterQuery.isPending}
                message="Couldn't load the roster."
                onRetry={() => rosterQuery.refetch()}
                className="py-14"
              />
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-1.5 text-[11px] font-bold tracking-wide text-primary uppercase">
                      {isToday(date) ? "Today's class" : formatWeekday(date)}
                    </div>
                    <div className="truncate text-[34px] leading-none font-extrabold tracking-tight">
                      {activeClass?.name ?? 'Class'}
                    </div>
                  </div>
                  <ConfirmButton
                    variant="default"
                    size="default"
                    disabled={counts.unmarked === 0}
                    title="Mark remaining students present?"
                    description={`Stages the ${counts.unmarked} still-unmarked students as present. Nothing is sent until you save. Students already marked are left as-is.`}
                    confirmLabel="Mark all present"
                    onConfirm={markRemainingPresent}
                  >
                    Mark all present
                  </ConfirmButton>
                </div>
                <div className="mt-5 flex border-t pt-4">
                  {STATS.map((stat, i) => (
                    <div key={stat.key} className={i > 0 ? 'flex-1 border-l px-4' : 'flex-1 px-4'}>
                      <StatTile
                        icon={stat.icon}
                        tone={stat.tone}
                        value={counts[stat.key]}
                        label={stat.label}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border bg-card shadow-card-sm">
                {roster.length === 0 ? (
                  <EmptyState
                    icon={<Icons.graduationCap />}
                    title="No students in this class"
                    description="Ask an admin to add students before marking attendance."
                  />
                ) : (
                  <>
                    {roster.map((entry) => (
                      <RosterRow
                        key={entry.studentId}
                        entry={entry}
                        staged={staged[entry.studentId]}
                        onStage={(status, note) => stage(entry.studentId, status, note)}
                        disabled={isSaving}
                      />
                    ))}
                    <SaveBar
                      pendingCount={pending.length}
                      isSaving={isSaving}
                      onSave={() => void save()}
                    />
                  </>
                )}
              </div>

              <ChangeLog classroomId={classroomId} date={date} />
            </>
          )}
        </div>
      </div>
    </PageShell>
  )
}
