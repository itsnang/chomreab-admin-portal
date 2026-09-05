'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { PageShell } from '@/components/shared/page-shell'
import { QueryState } from '@/components/shared/query-state'
import { StatusChip } from '@/components/shared/status-chip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { avatarColor, initials } from '@/lib/avatar'
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
  const [search, setSearch] = useState('')

  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: '', classroomId: '' },
  })

  const classroomName = (id: string) => classroomsQuery.data?.find((c) => c.id === id)?.name ?? id
  const linkingByStudent = new Map((linkingQuery.data ?? []).map((l) => [l.studentId, l]))
  const linkedCount = (linkingQuery.data ?? []).filter((l) => l.linked).length

  const visibleStudents = (studentsQuery.data ?? []).filter((s) =>
    s.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

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
      <div className="flex gap-3">
        <div className="rounded-[18px] px-5 py-4 min-w-[140px]" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
          <div className="font-mono text-[28px] font-semibold">{studentsQuery.data?.length ?? 0}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--hn-sub)' }}>
            Total students
          </div>
        </div>
        <div className="rounded-[18px] px-5 py-4 min-w-[140px]" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
          <div className="font-mono text-[28px] font-semibold" style={{ color: 'var(--hn-success)' }}>
            {linkedCount}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--hn-sub)' }}>
            Linked
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-2 items-end rounded-[18px] p-[15px]"
          style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}
        >
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

      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" className="max-w-[240px]" />

      {studentsQuery.isPending || studentsQuery.isError ? (
        <QueryState isPending={studentsQuery.isPending} message="Couldn't load students." onRetry={() => studentsQuery.refetch()} />
      ) : (
        <div className="rounded-[18px] overflow-hidden" style={{ background: 'var(--hn-surface)', border: '1px solid var(--hn-line)' }}>
          {visibleStudents.length === 0 ? (
            <p className="text-sm p-5" style={{ color: 'var(--hn-sub)' }}>
              {search.trim() ? 'No students match your search.' : 'No students yet.'}
            </p>
          ) : (
            visibleStudents.map((s, i) => {
              const linking = linkingByStudent.get(s.id)
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                  style={i > 0 ? { borderTop: '1px solid var(--hn-line-2)' } : undefined}
                >
                  <div
                    className="w-9 h-9 rounded-full flex-none flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: avatarColor(s.id) }}
                  >
                    {initials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{s.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--hn-sub)' }}>
                      {classroomName(s.classroomId)}
                    </div>
                  </div>
                  {linkingQuery.isPending || linkingQuery.isError ? (
                    <StatusChip status="checking" />
                  ) : linking?.linked ? (
                    <StatusChip status="linked" />
                  ) : (
                    <StatusChip status="unlinked" label={linking?.activeCode ? `Unlinked · ${linking.activeCode}` : 'Unlinked'} />
                  )}
                  <span className="flex gap-2 flex-none">
                    <Button variant="outline" size="sm" onClick={() => onGenerateCode(s.id)}>
                      Generate code
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(s.id)}>
                      Delete
                    </Button>
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}
    </PageShell>
  )
}
