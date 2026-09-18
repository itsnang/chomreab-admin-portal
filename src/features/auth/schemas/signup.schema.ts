import { z } from 'zod'

export const signupSchema = z
  .object({
    schoolName: z.string().min(1, 'Enter your school or tutoring centre name'),
    adminName: z.string().min(1, 'Enter your name'),
    adminEmail: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof signupSchema>
