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
import { useClassrooms } from '../hooks/use-classrooms'
import { createClassroom, deleteClassroom } from '../actions'
import { classroomSchema, type ClassroomInput } from '../schemas'

export function ClassroomsScreen() {
  const query = useClassrooms()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ClassroomInput>({
    resolver: zodResolver(classroomSchema),
    defaultValues: { name: '', gradeLabel: '' },
  })

  const onSubmit = async (values: ClassroomInput) => {
    setIsSubmitting(true)
    const result = await createClassroom(values)
    setIsSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    form.reset({ name: '', gradeLabel: '' })
    await queryClient.invalidateQueries({ queryKey: ['classrooms'] })
  }

  const onDelete = async (id: string) => {
    const result = await deleteClassroom(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    await queryClient.invalidateQueries({ queryKey: ['classrooms'] })
  }

  return (
    <PageShell heading="Classrooms" description="Create classes and assign teachers.">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-2 items-end rounded-xl p-4"
          style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Grade 3A" {...field} />
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
                  <Input placeholder="Grade 3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            Add classroom
          </Button>
        </form>
      </Form>

      {query.isPending || query.isError ? (
        <QueryState isPending={query.isPending} message="Couldn't load classrooms." onRetry={() => query.refetch()} />
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
          {query.data.map((c, i) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-5 py-3.5"
              style={i > 0 ? { borderTop: '1px solid var(--hn-line-2)' } : undefined}
            >
              <div
                className="w-9 h-9 rounded-full flex-none flex items-center justify-center text-sm font-bold text-white"
                style={{ background: avatarColor(c.id) }}
              >
                {initials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{c.name}</div>
                {c.gradeLabel && (
                  <div className="text-xs" style={{ color: 'var(--hn-sub)' }}>
                    {c.gradeLabel}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
