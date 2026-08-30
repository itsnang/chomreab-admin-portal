import { z } from 'zod'

export const studentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  classroomId: z.string().min(1, 'Classroom is required'),
})

export type StudentInput = z.infer<typeof studentSchema>
