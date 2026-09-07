'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/server'
import type { SchoolSettings } from '../types'
import type { SettingsInput } from '../schemas'

// Read responses come back camelCase (see attendance.action.ts); only request
// bodies use the API's snake_case DTO shape. The bot token is never handed to
// the client — only whether one is set.
interface SchoolSettingsResponse {
  schoolName: string
  lateCutoffMinutes: number
  absenceMessageTemplate: string
  telegramBotToken: string | null
}

export async function getSchoolSettings(): Promise<SchoolSettings> {
  const api = await apiFetch<SchoolSettingsResponse>('/school-settings')
  return {
    schoolName: api.schoolName,
    lateCutoffMinutes: api.lateCutoffMinutes,
    absenceMessageTemplate: api.absenceMessageTemplate,
    telegramBotTokenSet: !!api.telegramBotToken,
  }
}

export async function updateSchoolSettings(input: SettingsInput): Promise<{ error?: string }> {
  try {
    await apiFetch('/school-settings', {
      method: 'PATCH',
      body: JSON.stringify({
        school_name: input.schoolName,
        late_cutoff_minutes: input.lateCutoffMinutes,
        absence_message_template: input.absenceMessageTemplate,
        ...(input.telegramBotToken ? { telegram_bot_token: input.telegramBotToken } : {}),
      }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to save settings' }
  }
  revalidatePath('/settings')
  return {}
}
