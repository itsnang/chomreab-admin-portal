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
import { useClassrooms } from '@/features/classrooms/hooks/use-classrooms'
import { useStudents, useLinkingStatus } from '../hooks/use-students'
import { createStudent, deleteStudent, generateLinkingCode } from '../actions'
import { studentSchema, type StudentInput } from '../schemas'

export function StudentsScreen() {
  const classroomsQuery = useClassrooms()
  const studentsQuery = useStudents()
  const linkingQuery = useLinkingStatus()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: '', classroomId: '' },
  })

  const classroomName = (id: string) => classroomsQuery.data?.find((c) => c.id === id)?.name ?? id
  const linkingByStudent = new Map((linkingQuery.data ?? []).map((l) => [l.studentId, l]))

  const onSubmit = async (values: StudentInput) => {
    setIsSubmitting(true)
    const result = await createStudent(values)
    setIsSubmitting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    form.reset({ name: '', classroomId: '' })
    await queryClient.invalidateQueries({ queryKey: ['students'] })
  }

  const onDelete = async (id: string) => {
    const result = await deleteStudent(id)
    if (result.error) {
      toast.error(result.error)
      return
    }
    await queryClient.invalidateQueries({ queryKey: ['students'] })
  }

  const onGenerateCode = async (studentId: string) => {
    const result = await generateLinkingCode(studentId)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success(`Linking code: ${result.code}`)
    await queryClient.invalidateQueries({ queryKey: ['linking-status'] })
  }

  return (
    <PageShell heading="Students" description="Add students and generate parent linking codes.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-end">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Sokha" {...field} />
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
          <Button type="submit" disabled={isSubmitting}>
            Add student
          </Button>
        </form>
      </Form>

      {studentsQuery.isPending || studentsQuery.isError ? (
        <QueryState
          isPending={studentsQuery.isPending}
          message="Couldn't load students."
          onRetry={() => studentsQuery.refetch()}
        />
      ) : (
        <ul className="divide-y rounded-md border">
          {studentsQuery.data.map((s) => {
            const linking = linkingByStudent.get(s.id)
            return (
              <li key={s.id} className="flex items-center justify-between p-3">
                <span>
                  {s.name} <span className="text-muted-foreground">— {classroomName(s.classroomId)}</span>{' '}
                  {linkingQuery.isPending || linkingQuery.isError ? (
                    <span className="text-xs text-muted-foreground">checking...</span>
                  ) : linking?.linked ? (
                    <span className="text-xs text-green-600">linked</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      unlinked{linking?.activeCode ? ` (code: ${linking.activeCode})` : ''}
                    </span>
                  )}
                </span>
                <span className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onGenerateCode(s.id)}>
                    Generate code
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(s.id)}>
                    Delete
                  </Button>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </PageShell>
  )
}
