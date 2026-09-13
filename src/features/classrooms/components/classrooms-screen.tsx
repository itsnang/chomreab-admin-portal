'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { EmptyState } from '@/components/shared/empty-state'
import { ConfirmButton } from '@/components/shared/confirm-button'
import { FormSheet } from '@/components/shared/form-sheet'
import { Icons } from '@/components/shared/icons'
import { SelectField } from '@/components/shared/select-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { cn } from '@/lib/utils'
// Cross-slice import: the classroom form assigns a teacher, and staff owns
// that list. Documented alongside the other exceptions in CLAUDE.md.
import { useTeachers } from '@/features/staff/hooks/use-staff'
import { useClassrooms } from '../hooks/use-classrooms'
import { createClassroom, updateClassroom, deleteClassroom } from '../actions'
import { classroomSchema, type ClassroomInput } from '../schemas'
import type { Classroom } from '../types'

export function ClassroomsScreen() {
  const query = useClassrooms()
  const teachersQuery = useTeachers()
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState<Classroom | null>(null)
  const [teacherId, setTeacherId] = useState('')

  const form = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
    defaultValues: { name: '', gradeLabel: '' },
  })

  const onSubmit = async (values: ClassroomInput) => {
    const result = await createClassroom(values)
    if (result.error) {
      toast.error(result.error)
      return
    }
    form.reset({ name: '', gradeLabel: '' })
    setAddOpen(false)
    toast.success(`${values.name} created.`)
    await queryClient.invalidateQueries({ queryKey: ['classrooms'] })
  }

  const editForm = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
    defaultValues: { name: '', gradeLabel: '' },
  })

  const openEdit = (classroom: Classroom) => {
    setEditing(classroom)
    setTeacherId(classroom.teacherId ?? '')
    editForm.reset({
      name: classroom.name,
      gradeLabel: classroom.gradeLabel ?? '',
    })
  }

  const onEdit = async (values: ClassroomInput) => {
    if (!editing) return
    const result = await updateClassroom(editing.id, { ...values, teacherId })
    if (result.error) {
      toast.error(result.error)
      return
    }
    setEditing(null)
    toast.success(`${values.name} updated.`)
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['classrooms'] }),
      // The rail of teachers' assigned classes changes with this.
      queryClient.invalidateQueries({ queryKey: ['teachers'] }),
      queryClient.invalidateQueries({ queryKey: ['my-classes'] }),
    ])
  }

  const teacherName = (id: string | null) =>
    id ? (teachersQuery.data?.find((t) => t.id === id)?.name ?? 'Unknown teacher') : null

  const onDelete = async (id: string, name: string) => {
    const result = await deleteClassroom(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`${name} deleted.`)
    await queryClient.invalidateQueries({ queryKey: ['classrooms'] })
  }

  return (
    <PageShell
      heading="Classrooms"
      description="Create classes and assign teachers."
      actions={
        <Form {...form}>
          <FormSheet
            open={addOpen}
            onOpenChange={setAddOpen}
            trigger={
              <Button>
                <Icons.plus />
                Add classroom
              </Button>
            }
            title="Add a classroom"
            description="Students and attendance rosters are organised by classroom."
            submitLabel="Add classroom"
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
                    <Input placeholder="Grade 3A" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gradeLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="Grade 3" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSheet>
        </Form>
      }
    >
      {/* One edit sheet reused across rows. */}
      <Form {...editForm}>
        <FormSheet
          open={editing !== null}
          onOpenChange={(open) => !open && setEditing(null)}
          title={`Edit ${editing?.name ?? 'classroom'}`}
          description="Renaming a classroom leaves its attendance history intact."
          submitLabel="Save changes"
          isSubmitting={editForm.formState.isSubmitting}
          onSubmit={editForm.handleSubmit(onEdit)}
        >
          <FormField
            control={editForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Grade 3A" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="gradeLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <FormControl>
                  <Input placeholder="Grade 3" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <label
              htmlFor="classroom-teacher"
              className="mb-2 block text-sm leading-none font-medium"
            >
              Assigned teacher
            </label>
            <SelectField
              id="classroom-teacher"
              value={teacherId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTeacherId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {teachersQuery.data?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </SelectField>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Only the assigned teacher sees this classroom on their attendance screen.
            </p>
          </div>
        </FormSheet>
      </Form>

      {query.isPending || query.isError ? (
        <QueryState
          isPending={query.isPending}
          message="Couldn't load classrooms."
          onRetry={() => query.refetch()}
          className="py-14"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-card-sm">
          {query.data.length === 0 ? (
            <EmptyState
              icon={<Icons.building2 />}
              title="No classrooms yet"
              description="Create your first classroom, then add students to it."
              action={<Button onClick={() => setAddOpen(true)}>Add a classroom</Button>}
            />
          ) : (
            query.data.map((c, i) => (
              <div
                key={c.id}
                className={cn('flex items-center gap-3 px-5 py-3.5', i > 0 && 'border-t')}
              >
                <InitialAvatar id={c.id} name={c.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{c.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {[c.gradeLabel, teacherName(c.teacherId) ?? 'No teacher assigned']
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                  <Icons.pencil />
                  Edit
                </Button>
                <ConfirmButton
                  destructive
                  title={`Delete ${c.name}?`}
                  description="The classroom is removed for everyone. Students in it must be reassigned before they can be marked again."
                  confirmLabel="Delete classroom"
                  onConfirm={() => void onDelete(c.id, c.name)}
                >
                  <Icons.trash2 />
                  Delete
                </ConfirmButton>
              </div>
            ))
          )}
        </div>
      )}
    </PageShell>
  )
}
