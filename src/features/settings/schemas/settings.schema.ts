import { z } from 'zod'

export const settingsSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  // A required numeric field bound to an <input type="number">, which RHF
  // delivers as a string — z.coerce is the correct tool here regardless of
  // this repo's general caution around it for *optional* fields; this one
  // is required, so `exactOptionalPropertyTypes` doesn't interact with it.
  // Pin the coercion's input generic to `number` — zod v4's `z.coerce.number()`
  // otherwise defaults its input type to `unknown`, which makes zodResolver's
  // inferred `Resolver<Input, ...>` mismatch `useForm<SettingsInput>` under
  // this repo's `exactOptionalPropertyTypes`/strict tsconfig.
  lateCutoffMinutes: z.coerce.number<number>().int().min(0, 'Must be 0 or more'),
  absenceMessageTemplate: z.string().min(1, 'Template is required'),
  telegramBotToken: z.string().optional(),
})

export type SettingsInput = z.infer<typeof settingsSchema>
