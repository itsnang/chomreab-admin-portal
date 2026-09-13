'use client'

import { cn } from '@/lib/utils'
import { QueryState } from '@/components/shared/query-state'
import { EmptyState } from '@/components/shared/empty-state'
import { Icons } from '@/components/shared/icons'
import type { MyClassSummary } from '../types'

interface ClassRailProps {
  classes: MyClassSummary[] | undefined
  isPending: boolean
  isError: boolean
  onRetry: () => void
  classroomId: string
  onSelect: (classroomId: string) => void
  /** Classes with unsaved marks, so the rail can flag them before the teacher
   *  navigates away and forgets. */
  dirtyClassroomIds: Set<string>
}

export function ClassRail({
  classes,
  isPending,
  isError,
  onRetry,
  classroomId,
  onSelect,
  dirtyClassroomIds,
}: ClassRailProps) {
  return (
    <div className="h-fit rounded-xl border bg-card p-4 shadow-card-sm">
      <div className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        My classrooms today
      </div>

      {isPending || isError ? (
        <QueryState
          isPending={isPending}
          message="Couldn't load your classrooms."
          onRetry={onRetry}
          className="py-8"
        />
      ) : classes && classes.length === 0 ? (
        <EmptyState
          icon={<Icons.graduationCap />}
          title="No classrooms assigned"
          description="An admin needs to assign you to a classroom before you can take attendance."
          className="px-0 py-8"
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          {classes?.map((c) => {
            const selected = c.classroomId === classroomId
            const done = c.unmarkedCount === 0
            const dirty = dirtyClassroomIds.has(c.classroomId)
            return (
              <button
                key={c.classroomId}
                type="button"
                onClick={() => onSelect(c.classroomId)}
                aria-current={selected ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
                  selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{c.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {c.gradeLabel ? `${c.gradeLabel} · ` : ''}
                    {c.studentCount} students
                  </span>
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap',
                    dirty
                      ? 'bg-primary/15 text-primary'
                      : done
                        ? 'bg-present-muted text-present'
                        : 'bg-late-muted text-late'
                  )}
                >
                  {dirty ? 'Unsaved' : done ? 'Done' : `${c.unmarkedCount} left`}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
