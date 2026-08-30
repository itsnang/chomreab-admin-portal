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
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-end">
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
        <QueryState
          isPending={query.isPending}
          message="Couldn't load classrooms."
          onRetry={() => query.refetch()}
        />
      ) : (
        <ul className="divide-y rounded-md border">
          {query.data.map((c) => (
            <li key={c.id} className="flex items-center justify-between p-3">
              <span>
                {c.name} {c.gradeLabel && <span className="text-muted-foreground">— {c.gradeLabel}</span>}
              </span>
              <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  )
}
