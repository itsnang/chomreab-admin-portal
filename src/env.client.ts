import { z } from 'zod'

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3001'),
})

const parsed = clientSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid client environment variables:', parsed.error.format())
  throw new Error('Invalid client environment variables', { cause: parsed.error })
}

export const clientEnv = parsed.data
