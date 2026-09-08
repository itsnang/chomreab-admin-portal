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
import { TempPasswordPanel, type CreatedTeacherCredentials } from './temp-password-panel'
import { Icons } from '@/components/shared/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { InitialAvatar } from '@/components/shared/initial-avatar'
import { cn } from '@/lib/utils'
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import { useTeachers } from '../hooks/use-staff'
import { createTeacher, deleteTeacher } from '../actions'
import { teacherSchema, type TeacherInput } from '../schemas'

export function StaffScreen() {
  const classroomsQuery = useClassrooms()
  const teachersQuery = useTeachers()
  const queryClient = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [credentials, setCredentials] = useState<CreatedTeacherCredentials | null>(null)

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
                    <select
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      {...field}
                    >
                      <option value="">Unassigned</option>
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
    >

      {teachersQuery.isPending || teachersQuery.isError ? (
        <QueryState
          isPending={teachersQuery.isPending}
          message="Couldn't load staff."
          onRetry={() => teachersQuery.refetch()}
          className="py-14"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-card-sm">
          {teachersQuery.data.length === 0 ? (
            <EmptyState
              icon={<Icons.users />}
              title="No teacher accounts yet"
              description="Add a teacher so they can sign in and mark their classes."
              action={<Button onClick={() => setAddOpen(true)}>Add a teacher</Button>}
            />
          ) : (
            teachersQuery.data.map((t, i) => (
              <div
                key={t.id}
                className={cn('flex items-center gap-3 px-5 py-3.5', i > 0 && 'border-t')}
              >
                <InitialAvatar id={t.id} name={t.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{t.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{t.email}</div>
                </div>
                <div className="w-[200px] truncate text-xs text-muted-foreground">
                  {t.classroomNames.length > 0 ? t.classroomNames.join(', ') : 'Unassigned'}
                </div>
                <ConfirmButton
                  destructive
                  title={`Remove ${t.name}?`}
                  description="Their account is deleted and they lose access immediately. Attendance they recorded is kept."
                  confirmLabel="Remove teacher"
                  onConfirm={() => void onDelete(t.id, t.name)}
                >
                  <Icons.trash2 />
                  Remove
                </ConfirmButton>
              </div>
            ))
          )}
        </div>
      )}
    </PageShell>
    </>
  )
}
