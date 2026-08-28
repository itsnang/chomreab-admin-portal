import 'server-only'
import { z } from 'zod'

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  API_BASE_URL: z.string().url().default('http://localhost:8091'),
  // DATABASE_URL: z.string().url(),
  // AUTH_SECRET: z.string().min(1),
})

const serverEnv = serverSchema.safeParse(process.env)

if (!serverEnv.success) {
  console.error('Invalid server environment variables:', serverEnv.error.format())
  throw new Error('Invalid server environment variables', { cause: serverEnv.error })
}

export const env = serverEnv.data
