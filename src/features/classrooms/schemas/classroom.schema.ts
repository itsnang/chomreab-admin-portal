import { z } from 'zod'

export const classroomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gradeLabel: z.string().optional(),
  /** Empty string means unassigned — a native select has no null. */
  teacherId: z.string().optional(),
})

export type ClassroomInput = z.infer<typeof classroomSchema>
