'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { ListCard } from '@/components/shared/list-card'
import { ListRow } from '@/components/shared/list-row'
import { StatTile } from '@/components/shared/stat-tile'
import { StatusChip } from '@/components/shared/status-chip'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmButton } from '@/components/shared/confirm-button'
import { SegmentedControl } from '@/components/shared/segmented-control'
import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import { useStudents, useLinkingStatus } from '../hooks/use-students'
import { createStudent, updateStudent, setStudentStatus, deleteStudent } from '../actions'
import type { Student } from '../types'
import type { StudentInput } from '../schemas'
import { StudentFormSheet } from './student-form-sheet'

const ALL = 'all'
const BLANK: StudentInput = { name: '', classroomId: '' }

type Roll = 'active' | 'inactive' | 'all'

const ROLL_SEGMENTS = [
  { value: 'active' as const, label: 'Enrolled' },
  { value: 'inactive' as const, label: 'Left' },
  { value: 'all' as const, label: 'All' },
]

export function StudentsScreen() {
  const [classFilter, setClassFilter] = useState<string>(ALL)
  const [roll, setRoll] = useState<Roll>('active')
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)

  const classroomsQuery = useClassrooms()
  // The API filters by classroom and by roll, so the controls drive the query
  // rather than trimming a full list on the client.
  const studentsQuery = useStudents(
    classFilter === ALL ? undefined : classFilter,
    roll !== 'active',
  )
  const linkingQuery = useLinkingStatus()
  const queryClient = useQueryClient()

  const classrooms = useMemo(() => classroomsQuery.data ?? [], [classroomsQuery.data])
  const classroomName = (id: string) => classrooms.find((c) => c.id === id)?.name ?? '—'

  const linkingByStudent = useMemo(
    () => new Map((linkingQuery.data ?? []).map((l) => [l.studentId, l])),
    [linkingQuery.data],
  )
  const linkedCount = (linkingQuery.data ?? []).filter((l) => l.linked).length

  const visibleStudents = useMemo(() => {
    // `include_inactive` widens the list rather than replacing it, so the
    // "Left" tab has to narrow it back down to just those students.
    const students = (studentsQuery.data ?? []).filter((s) =>
      roll === 'all' ? true : roll === 'inactive' ? s.status === 'inactive' : s.status === 'active',
    )
    const term = search.trim().toLowerCase()
    if (!term) return students
    return students.filter((s) => s.name.toLowerCase().includes(term))
  }, [studentsQuery.data, search, roll])

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['students'] }),
      queryClient.invalidateQueries({ queryKey: ['linking-status'] }),
    ])

  const onAdd = async (values: StudentInput) => {
    const result = await createStudent(values)
    if (result.error) return void toast.error(result.error)
    setAddOpen(false)
    toast.success(`${values.name} added.`)
    await refresh()
  }

  const onEdit = async (values: StudentInput) => {
    if (!editing) return
    const result = await updateStudent(editing.id, values)
    if (result.error) return void toast.error(result.error)
    setEditing(null)
    toast.success(`${values.name} updated.`)
    await refresh()
  }

  const onSetStatus = async (student: Student, status: Student['status']) => {
    const result = await setStudentStatus(student.id, status)
    if (result.error) return void toast.error(result.error)
    toast.success(
      status === 'inactive'
        ? `${student.name} deactivated.`
        : `${student.name} reactivated.`,
    )
    await refresh()
  }

  const onDelete = async (student: Student) => {
    const result = await deleteStudent(student.id)
    if (result.error) return void toast.error(result.error)
    toast.success(`${student.name} deleted.`)
    await refresh()
  }

  const noClassrooms = classrooms.length === 0

  return (
    <PageShell
      heading="Students"
      description="Add students and keep them assigned to the right classroom."
      actions={
        <StudentFormSheet
          open={addOpen}
          onOpenChange={setAddOpen}
          trigger={
            <Button disabled={noClassrooms}>
              <Icons.plus />
              Add student
            </Button>
          }
          title="Add a student"
          description="They appear on their classroom's roster straight away."
          submitLabel="Add student"
          classrooms={classrooms}
          defaultValues={BLANK}
          onSubmit={onAdd}
        />
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            aria-label="Filter by classroom"
            segments={[
              { value: ALL, label: 'All classrooms' },
              ...classrooms.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={classFilter}
            onChange={setClassFilter}
            size="sm"
            className="flex-wrap"
          />
          <SegmentedControl
            aria-label="Enrolled or left"
            segments={ROLL_SEGMENTS}
            value={roll}
            onChange={setRoll}
            size="sm"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name"
            aria-label="Search students"
            className="ml-auto max-w-[240px] bg-card"
          />
        </div>
      }
    >
      {/* One edit sheet reused across rows; `editing` supplies its values. */}
      <StudentFormSheet
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={`Edit ${editing?.name ?? 'student'}`}
        description="Renaming or moving a student leaves their attendance history where it happened."
        submitLabel="Save changes"
        classrooms={classrooms}
        defaultValues={
          editing ? { name: editing.name, classroomId: editing.classroomId } : BLANK
        }
        onSubmit={onEdit}
      />

      <div className="flex flex-wrap gap-3">
        <div className="min-w-[140px] flex-1 rounded-xl border bg-card px-5 py-4 shadow-card-sm sm:flex-none">
          <StatTile
            icon={Icons.users}
            tone="primary"
            value={visibleStudents.length}
            label={roll === 'inactive' ? 'Inactive students' : 'Students shown'}
          />
        </div>
        <div className="min-w-[140px] flex-1 rounded-xl border bg-card px-5 py-4 shadow-card-sm sm:flex-none">
          <StatTile
            icon={Icons.link2}
            tone="present"
            value={linkingQuery.isPending ? '—' : linkedCount}
            label="Parents linked"
          />
        </div>
      </div>

      <ListCard
        isPending={studentsQuery.isPending}
        isError={studentsQuery.isError}
        errorMessage="Couldn't load students."
        onRetry={() => studentsQuery.refetch()}
      >
        {visibleStudents.length === 0 ? (
            <EmptyState
              icon={<Icons.graduationCap />}
              title={
                search.trim()
                  ? 'No matching students'
                  : roll === 'inactive'
                    ? 'No inactive students'
                    : 'No students here yet'
              }
              description={
                search.trim()
                  ? `Nothing matches “${search.trim()}”.`
                  : roll === 'inactive'
                    ? 'Students you deactivate appear here, with their history intact.'
                    : noClassrooms
                      ? 'Create a classroom first — every student belongs to one.'
                      : 'Add a student to this classroom to get started.'
              }
              {...(search.trim() || noClassrooms || roll === 'inactive'
                ? {}
                : { action: <Button onClick={() => setAddOpen(true)}>Add a student</Button> })}
            />
        ) : (
          visibleStudents.map((s, i) => {
            const linking = linkingByStudent.get(s.id)
            const inactive = s.status === 'inactive'
            return (
              <ListRow
                key={s.id}
                id={s.id}
                first={i === 0}
                muted={inactive}
                title={s.name}
                subtitle={classroomName(s.classroomId)}
                actions={
                  <>
                    {inactive ? (
                      <StatusChip status="inactive" />
                    ) : linkingQuery.isPending || linkingQuery.isError ? (
                      <StatusChip status="checking" />
                    ) : (
                      <StatusChip status={linking?.linked ? 'linked' : 'unlinked'} />
                    )}

                    <Button variant="ghost" size="sm" onClick={() => setEditing(s)}>
                      <Icons.pencil />
                      Edit
                    </Button>

                    {inactive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void onSetStatus(s, 'active')}
                      >
                        Reactivate
                      </Button>
                    ) : (
                      <ConfirmButton
                        variant="outline"
                        title={`Deactivate ${s.name}?`}
                        description="They come off every roster and stop being counted, and their attendance history stays readable. You can reactivate them later."
                        confirmLabel="Deactivate"
                        onConfirm={() => void onSetStatus(s, 'inactive')}
                      >
                        Deactivate
                      </ConfirmButton>
                    )}

                    {/* Hard delete is for a student entered twice, not for one
                        who has left — it orphans their attendance history. */}
                    <ConfirmButton
                      destructive
                      size="icon-sm"
                      aria-label={`Delete ${s.name}`}
                      title={`Permanently delete ${s.name}?`}
                      description="This is for a record entered by mistake. Their attendance history, audit trail and parent link are left pointing at a student who no longer exists, and will show as “Unknown student”. To remove a child who has left, deactivate them instead."
                      confirmLabel="Delete permanently"
                      onConfirm={() => void onDelete(s)}
                    >
                      <Icons.trash2 />
                    </ConfirmButton>
                  </>
                }
              />
            )
          })
        )}
      </ListCard>
    </PageShell>
  )
}
