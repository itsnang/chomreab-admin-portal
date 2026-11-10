'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { ListCard } from '@/components/shared/list-card'
import { ListRow } from '@/components/shared/list-row'
import { EmptyState } from '@/components/shared/empty-state'
import { RowActionsMenu } from '@/components/shared/row-actions-menu'
import { FormSheet } from '@/components/shared/form-sheet'
import { TempPasswordPanel, type CreatedTeacherCredentials } from './temp-password-panel'
import { Icons } from '@/components/shared/icons'
import { SelectField } from '@/components/shared/select-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import { useTeachers } from '../hooks/use-staff'
import { createTeacher, updateTeacher, resetTeacherPassword, deleteTeacher } from '../actions'
import { teacherSchema, type TeacherInput } from '../schemas'
import type { Teacher } from '../types'

export function StaffScreen() {
  const classroomsQuery = useClassrooms()
  const teachersQuery = useTeachers()
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [credentials, setCredentials] = useState<CreatedTeacherCredentials | null>(null)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)

  const editForm = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { name: '', email: '', classroomId: '' },
  })

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher)
    editForm.reset({ name: teacher.name, email: teacher.email, classroomId: '' })
  }

  const onEdit = async (values: TeacherInput) => {
    if (!editing) return
    const result = await updateTeacher(editing.id, {
      name: values.name,
      email: values.email,
    })
    if (result.error) {
      toast.error(result.error)
      return
    }
    setEditing(null)
    toast.success(`${values.name} updated.`)
    await queryClient.invalidateQueries({ queryKey: ['teachers'] })
  }

  const onResetPassword = async (teacher: Teacher) => {
    setResettingId(teacher.id)
    const result = await resetTeacherPassword(teacher.id)
    setResettingId(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    // Same one-time panel as account creation — the password is shown once and
    // only its hash is stored.
    setCredentials({
      name: teacher.name,
      password: result.temporaryPassword ?? '',
      classroomAssignmentFailed: false,
    })
  }

  const form = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { name: '', email: '', classroomId: '' },
  })

  const onSubmit = async (values: TeacherInput) => {
    const result = await createTeacher(values)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setCredentials({
      name: values.name,
      password: result.temporaryPassword ?? '',
      classroomAssignmentFailed: result.classroomAssignmentFailed ?? false,
    })
    form.reset({ name: '', email: '', classroomId: '' })
    setAddOpen(false)
    await queryClient.invalidateQueries({ queryKey: ['teachers'] })
    await queryClient.invalidateQueries({ queryKey: ['classrooms'] })
  }

  const onDelete = async (id: string, name: string) => {
    const result = await deleteTeacher(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`${name} removed.`)
    await queryClient.invalidateQueries({ queryKey: ['teachers'] })
  }

  return (
    <>
    <TempPasswordPanel credentials={credentials} onDismiss={() => setCredentials(null)} />
    <PageShell
      heading="Staff"
      description="Add teacher accounts and see what each one teaches."
      actions={
        <Form {...form}>
          <FormSheet
            open={addOpen}
            onOpenChange={setAddOpen}
            trigger={
              <Button>
                <Icons.plus />
                Add teacher
              </Button>
            }
            title="Add a teacher"
            description="They sign in with the temporary password shown after you save."
            submitLabel="Add teacher"
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
                    <Input placeholder="Chenda Ly" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="chenda@school.edu" autoComplete="off" {...field} />
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
                    <SelectField {...field}>
                      <option value="">Unassigned</option>
                      {classroomsQuery.data?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </SelectField>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSheet>
        </Form>
      }
    >

      <Form {...editForm}>
        <FormSheet
          open={editing !== null}
          onOpenChange={(open) => !open && setEditing(null)}
          title={`Edit ${editing?.name ?? 'teacher'}`}
          description="Email is their sign-in, so changing it changes how they log in. Their current session stays active."
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
                  <Input placeholder="Chenda Ly" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="chenda@school.edu" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSheet>
      </Form>

      <ListCard
        isPending={teachersQuery.isPending}
        isError={teachersQuery.isError}
        errorMessage="Couldn't load staff."
        onRetry={() => teachersQuery.refetch()}
      >
        {(teachersQuery.data ?? []).length === 0 ? (
          <EmptyState
            icon={<Icons.users />}
            title="No teacher accounts yet"
            description="Add a teacher so they can sign in and mark their classrooms."
            action={<Button onClick={() => setAddOpen(true)}>Add a teacher</Button>}
          />
        ) : (
          (teachersQuery.data ?? []).map((t, i) => (
            <ListRow
              key={t.id}
              id={t.id}
              first={i === 0}
              title={t.name}
              subtitle={t.email}
              actions={
                <>
                  <span className="hidden w-[200px] truncate text-xs text-muted-foreground md:block">
                    {t.classroomNames.length > 0 ? t.classroomNames.join(', ') : 'Unassigned'}
                  </span>
                  <RowActionsMenu
                    label={`Actions for ${t.name}`}
                    busy={resettingId === t.id}
                    actions={[
                      { label: 'Edit', icon: 'pencil', onClick: () => openEdit(t) },
                      {
                        label: 'Reset password',
                        icon: 'key',
                        disabled: resettingId === t.id,
                        onClick: () => void onResetPassword(t),
                        confirm: {
                          title: `Reset ${t.name}'s password?`,
                          description:
                            'Issues a new temporary password, shown to you once. Their current password stops working immediately and they are signed out everywhere.',
                          confirmLabel: 'Reset password',
                        },
                      },
                      {
                        label: 'Remove teacher',
                        icon: 'trash2',
                        destructive: true,
                        onClick: () => void onDelete(t.id, t.name),
                        confirm: {
                          title: `Remove ${t.name}?`,
                          description:
                            'Their account is deleted and they lose access immediately. Attendance they recorded is kept.',
                          confirmLabel: 'Remove teacher',
                        },
                      },
                    ]}
                  />
                </>
              }
            />
          ))
        )}
      </ListCard>
    </PageShell>
    </>
  )
}
