import { z } from 'zod'

export const settingsSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  // Required numeric field from an <input type="number">; see CLAUDE.md on
  // z.coerce. The `<number>` generic is load-bearing — without it zod v4 infers
  // an `unknown` input and zodResolver stops matching `useForm<SettingsInput>`.
  lateCutoffMinutes: z.coerce.number<number>().int().min(0, 'Must be 0 or more'),
  absenceMessageTemplate: z.string().min(1, 'Template is required'),
})

export type SettingsInput = z.infer<typeof settingsSchema>
