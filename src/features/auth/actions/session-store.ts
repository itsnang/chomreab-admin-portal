import 'server-only'

import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_COOKIE } from '../cookies'
import type { AuthUser } from '../types'

const ACCESS_FALLBACK_MAX_AGE = 60 * 15 // 15 minutes
const REFRESH_FALLBACK_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function decodeJwtExpiry(token: string): number | null {
  const payload = token.split('.')[1]
  if (!payload) return null
  try {
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as { exp?: number }
    return typeof json.exp === 'number' ? json.exp : null
  } catch {
    return null
  }
}

/** Cookie lifetime matched to the JWT's own `exp`, falling back to a sane default. */
function maxAgeFromExpiry(token: string, fallbackSeconds: number): number {
  const exp = decodeJwtExpiry(token)
  if (exp === null) return fallbackSeconds
  const remaining = exp - Math.floor(Date.now() / 1000)
  return remaining > 0 ? remaining : fallbackSeconds
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  }
}

/** The token + user payload returned by login/register (after envelope unwrap). */
export interface SessionData {
  access_token: string
  refresh_token: string
  user: AuthUser
}

/** Write the access + refresh token cookies. Used on login and on token refresh
 *  (the refresh endpoint rotates the refresh token, so both must be re-written).
 *  Returns the cookie store and refresh max-age so callers can reuse them. */
export async function persistTokens(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()
  const refreshMaxAge = maxAgeFromExpiry(refreshToken, REFRESH_FALLBACK_MAX_AGE)
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    cookieOptions(maxAgeFromExpiry(accessToken, ACCESS_FALLBACK_MAX_AGE)),
  )
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions(refreshMaxAge))
  return { cookieStore, refreshMaxAge }
}

/** Write the full session (tokens + user) after login or register. */
export async function persistSession(data: SessionData): Promise<void> {
  const { cookieStore, refreshMaxAge } = await persistTokens(data.access_token, data.refresh_token)
  cookieStore.set(USER_COOKIE, JSON.stringify(data.user), cookieOptions(refreshMaxAge))
}

/** Remove every session cookie (logout, or when a refresh token is rejected). */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
  cookieStore.delete(USER_COOKIE)
}
