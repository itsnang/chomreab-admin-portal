'use server'

import { ApiError, apiFetch } from '@/lib/api/server'
import type { TelegramStatus, TelegramWebhookStatus } from '../types'

interface TelegramStatusApi {
  status: TelegramWebhookStatus
  detail: string | null
  expected_url: string | null
  actual_url: string | null
}

export async function getTelegramStatus(): Promise<TelegramStatus | { error: string }> {
  try {
    const api = await apiFetch<TelegramStatusApi>('/school-settings/telegram-status')
    return {
      status: api.status,
      detail: api.detail,
      expectedUrl: api.expected_url,
      actualUrl: api.actual_url,
    }
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Could not check the connection' }
  }
}

export async function registerTelegramWebhook(): Promise<{ error?: string }> {
  try {
    await apiFetch('/school-settings/telegram-webhook', { method: 'POST' })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Could not connect the bot' }
  }
  return {}
}

interface LinkingStatusApi {
  linked: boolean
}

/** How many parents are currently receiving messages through the saved bot.
 *
 *  Read straight from the API rather than through the `students` slice's
 *  hook: that slice already imports from `settings`, and importing back would
 *  close a cycle the dependency rule exists to prevent. Endpoints belong to
 *  no slice. */
export async function getLinkedParentCount(): Promise<number> {
  try {
    const rows = await apiFetch<LinkingStatusApi[]>('/parent-links/status')
    return rows.filter((row) => row.linked).length
  } catch {
    // Only ever used to make a warning concrete. If it cannot be fetched the
    // warning still shows, just without a number.
    return 0
  }
}
