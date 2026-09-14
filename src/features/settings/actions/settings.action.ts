'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/server'
import type { SchoolSettings } from '../types'
import type { SettingsInput } from '../schemas'

interface SchoolSettingsApi {
  school_name: string
  late_cutoff_minutes: number
  absence_message_template: string
  telegram_bot_token: string | null
  telegram_bot_username: string | null
}

export async function getSchoolSettings(): Promise<SchoolSettings> {
  const api = await apiFetch<SchoolSettingsApi>('/school-settings')
  return {
    schoolName: api.school_name,
    lateCutoffMinutes: api.late_cutoff_minutes,
    absenceMessageTemplate: api.absence_message_template,
    telegramBotTokenSet: !!api.telegram_bot_token,
    telegramBotUsername: api.telegram_bot_username,
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
