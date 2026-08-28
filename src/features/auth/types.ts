import { z } from 'zod'

export type UserRole = 'admin' | 'teacher'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>
