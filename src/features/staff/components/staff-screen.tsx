'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { avatarColor, initials } from '@/lib/avatar'
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import { useTeachers } from '../hooks/use-staff'
import { createTeacher, deleteTeacher } from '../actions'
import { teacherSchema, type TeacherInput } from '../schemas'

export function StaffScreen() {
  const classroomsQuery = useClassrooms()
  const teachersQuery = useTeachers()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TeacherInput>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { name: '', email: '', classroomId: '' },
  })

  const onSubmit = async (values: TeacherInput) => {
    setIsSubmitting(true)
    const result = await createTeacher(values)
    setIsSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.classroomAssignmentFailed) {
      toast.warning(
        `Teacher added (password: ${result.temporaryPassword}), but classroom assignment failed. Assign from the Classrooms screen.`
      )
    } else {
      toast.success(`Teacher added. Temporary password: ${result.temporaryPassword}`)
    }
    form.reset({ name: '', email: '', classroomId: '' })
    await queryClient.invalidateQueries({ queryKey: ['teachers'] })
    await queryClient.invalidateQueries({ queryKey: ['classrooms'] })
  }

  const onDelete = async (id: string) => {
    const result = await deleteTeacher(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    await queryClient.invalidateQueries({ queryKey: ['teachers'] })
  }

  return (
    <PageShell heading="Staff" description="Add teacher accounts and see what each one teaches.">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-2 items-end flex-wrap rounded-xl p-4"
          style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Chenda Ly" {...field} />
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
                  <Input placeholder="chenda@school.edu" {...field} />
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
                  <select className="h-9 rounded-md border bg-background px-3 text-sm" {...field}>
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
          <Button type="submit" disabled={isSubmitting}>
            Add teacher
          </Button>
        </form>
      </Form>

      {teachersQuery.isPending || teachersQuery.isError ? (
        <QueryState isPending={teachersQuery.isPending} message="Couldn't load staff." onRetry={() => teachersQuery.refetch()} />
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
          {teachersQuery.data.map((t, i) => (
            <div
              key={t.id}
              className="flex items-center gap-3 px-5 py-3.5"
              style={i > 0 ? { borderTop: '1px solid var(--hn-line-2)' } : undefined}
            >
              <div
                className="w-9 h-9 rounded-full flex-none flex items-center justify-center text-sm font-bold text-white"
                style={{ background: avatarColor(t.id) }}
              >
                {initials(t.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{t.name}</div>
                <div className="text-xs truncate" style={{ color: 'var(--hn-sub)' }}>
                  {t.email}
                </div>
              </div>
              <div className="text-xs w-[200px] truncate" style={{ color: 'var(--hn-sub)' }}>
                {t.classroomNames.length > 0 ? t.classroomNames.join(', ') : 'Unassigned'}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onDelete(t.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
