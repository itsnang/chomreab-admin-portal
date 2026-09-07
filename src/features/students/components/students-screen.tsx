'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { StatusChip } from '@/components/shared/status-chip'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmButton } from '@/components/shared/confirm-button'
import { FormSheet } from '@/components/shared/form-sheet'
import { SegmentedControl } from '@/components/shared/segmented-control'
import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { cn } from '@/lib/utils'
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import { useStudents, useLinkingStatus } from '../hooks/use-students'
import { createStudent, deleteStudent } from '../actions'
import { studentSchema, type StudentInput } from '../schemas'

const ALL = 'all'

export function StudentsScreen() {
  const [classFilter, setClassFilter] = useState<string>(ALL)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const classroomsQuery = useClassrooms()
  // The API filters by classroom, so the chips drive the query rather than
  // trimming a full list on the client.
  const studentsQuery = useStudents(classFilter === ALL ? undefined : classFilter)
  const linkingQuery = useLinkingStatus()
  const queryClient = useQueryClient()

  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: '', classroomId: '' },
  })

  const classroomName = (id: string) => classroomsQuery.data?.find((c) => c.id === id)?.name ?? '—'

  const linkingByStudent = useMemo(
    () => new Map((linkingQuery.data ?? []).map((l) => [l.studentId, l])),
    [linkingQuery.data],
  )
  const linkedCount = (linkingQuery.data ?? []).filter((l) => l.linked).length

  const visibleStudents = useMemo(() => {
    const students = studentsQuery.data ?? []
    const term = search.trim().toLowerCase()
    if (!term) return students
    return students.filter((s) => s.name.toLowerCase().includes(term))
  }, [studentsQuery.data, search])

  const onSubmit = async (values: StudentInput) => {
    const result = await createStudent(values)
    if (result.error) {
      toast.error(result.error)
      return
    }
    form.reset({ name: '', classroomId: '' })
    setAddOpen(false)
    toast.success(`${values.name} added.`)
    await queryClient.invalidateQueries({ queryKey: ['students'] })
  }

  const onDelete = async (id: string, name: string) => {
    const result = await deleteStudent(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`${name} removed.`)
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['students'] }),
      queryClient.invalidateQueries({ queryKey: ['linking-status'] }),
    ])
  }

  const noClassrooms = (classroomsQuery.data?.length ?? 0) === 0

  return (
    <PageShell
      heading="Students"
      description="Add students and keep them assigned to the right classroom."
      actions={
        <Form {...form}>
          <FormSheet
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
            isSubmitting={form.formState.isSubmitting}
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sokha" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classroomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classroom</FormLabel>
                  <FormControl>
                    <select
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      {...field}
                    >
                      <option value="">Select a classroom</option>
                      {classroomsQuery.data?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSheet>
        </Form>
      }
      toolbar={
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            aria-label="Filter by classroom"
            segments={[
              { value: ALL, label: 'All classrooms' },
              ...(classroomsQuery.data ?? []).map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={classFilter}
            onChange={setClassFilter}
            size="sm"
            className="flex-wrap"
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
      <div className="flex gap-3">
        <div className="min-w-[140px] rounded-xl border bg-card px-5 py-4 shadow-card-sm">
          <div className="font-mono text-[28px] font-semibold">{visibleStudents.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">Students shown</div>
        </div>
        <div className="min-w-[140px] rounded-xl border bg-card px-5 py-4 shadow-card-sm">
          <div className="font-mono text-[28px] font-semibold text-present">
            {linkingQuery.isPending ? '—' : linkedCount}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Parents linked</div>
        </div>
      </div>

      {studentsQuery.isPending || studentsQuery.isError ? (
        <QueryState
          isPending={studentsQuery.isPending}
          message="Couldn't load students."
          onRetry={() => studentsQuery.refetch()}
          className="py-14"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-card-sm">
          {visibleStudents.length === 0 ? (
            <EmptyState
              icon={<Icons.graduationCap />}
              title={search.trim() ? 'No matching students' : 'No students here yet'}
              description={
                search.trim()
                  ? `Nothing matches “${search.trim()}”.`
                  : noClassrooms
                    ? 'Create a classroom first — every student belongs to one.'
                    : 'Add a student to this classroom to get started.'
              }
              {...(search.trim() || noClassrooms
                ? {}
                : { action: <Button onClick={() => setAddOpen(true)}>Add a student</Button> })}
            />
          ) : (
            visibleStudents.map((s, i) => {
              const linking = linkingByStudent.get(s.id)
              return (
                <div
                  key={s.id}
                  className={cn('flex items-center gap-3 px-5 py-3.5', i > 0 && 'border-t')}
                >
                  <InitialAvatar id={s.id} name={s.name} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{s.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {classroomName(s.classroomId)}
                    </div>
                  </div>
                  {/* Codes are issued and copied on the Linking codes page; the
                      chip here is a read-only summary. */}
                  {linkingQuery.isPending || linkingQuery.isError ? (
                    <StatusChip status="checking" />
                  ) : (
                    <StatusChip status={linking?.linked ? 'linked' : 'unlinked'} />
                  )}
                  <ConfirmButton
                    destructive
                    title={`Remove ${s.name}?`}
                    description="They come off every roster. Past attendance records are kept."
                    confirmLabel="Remove student"
                    onConfirm={() => void onDelete(s.id, s.name)}
                  >
                    <Icons.trash2 />
                    Remove
                  </ConfirmButton>
                </div>
              )
            })
          )}
        </div>
      )}
    </PageShell>
  )
}
