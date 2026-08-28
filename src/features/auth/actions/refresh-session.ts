import 'server-only'

import { cookies } from 'next/headers'
import { env } from '@/env'
import type { ApiEnvelope } from '@/lib/api/server'
import { REFRESH_TOKEN_COOKIE } from '../cookies'
import { clearSession, persistTokens } from './session-store'

/**
 * Exchange the stored refresh token for a fresh token pair via `POST /auth/refresh`.
 * Returns the new access token (and persists the rotated pair to cookies), or
 * `null` when there is no refresh token, the exchange fails, or cookies can't be
 * written (e.g. called during a render rather than a Server Action).
 *
 * Uses a raw `fetch` rather than `apiFetch` so it never recurses through the
 * 401-refresh path it backs.
 */
export async function refreshSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) return null

  let res: Response
  try {
    res = await fetch(`${env.API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  } catch {
    return null // transport error — keep the session, let the caller surface the 401
  }

  if (!res.ok) {
    // The refresh token is invalid or expired: drop the dead session so the
    // proxy redirects to /login on the next navigation.
    await clearSession().catch(() => {})
    return null
  }

  const body = (await res.json()) as ApiEnvelope<{ access_token: string; refresh_token: string }>
  const { access_token, refresh_token } = body.data
  try {
    await persistTokens(access_token, refresh_token)
  } catch {
    // Cookie writes are only allowed in Server Actions / Route Handlers; during a
    // render they throw. The retry still uses the new access token below.
  }
  return access_token
}
