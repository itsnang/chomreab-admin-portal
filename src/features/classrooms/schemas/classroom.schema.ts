import { z } from 'zod'

export const classroomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gradeLabel: z.string().optional(),
})

export type ClassroomInput = z.infer<typeof classroomSchema>
