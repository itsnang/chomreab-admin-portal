'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ReactNode } from 'react'
import { FormSheet } from '@/components/shared/form-sheet'
import { SelectField } from '@/components/shared/select-field'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { Classroom } from '@/features/classrooms/types'
import { studentSchema, type StudentInput } from '../schemas'

interface StudentFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Omitted when the sheet is opened from a row action. */
  trigger?: ReactNode
  title: string
  description: string
  submitLabel: string
  classrooms: Classroom[]
  /** Changing these while the sheet is closed reloads the form — the edit
   *  sheet is reused across rows rather than mounted per student. */
  defaultValues: StudentInput
  onSubmit: (values: StudentInput) => Promise<void>
}

/** The add and edit sheets differ only in their copy and what they do on
 *  submit, so they share one form. */
export function StudentFormSheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  submitLabel,
  classrooms,
  defaultValues,
  onSubmit,
}: StudentFormSheetProps) {
  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues,
  })

  const { name, classroomId } = defaultValues
  useEffect(() => {
    if (open) form.reset({ name, classroomId })
  }, [open, name, classroomId, form])

  return (
    <Form {...form}>
      <FormSheet
        open={open}
        onOpenChange={onOpenChange}
        {...(trigger ? { trigger } : {})}
        title={title}
        description={description}
        submitLabel={submitLabel}
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
                <SelectField {...field}>
                  <option value="">Select a classroom</option>
                  {classrooms.map((c) => (
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
  )
}
