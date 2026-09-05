import { z } from 'zod'

export const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  classroomId: z.string().optional(),
})

export type TeacherInput = z.infer<typeof teacherSchema>
