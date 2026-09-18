import 'server-only'

import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_COOKIE } from '../cookies'
import {
  ACCESS_FALLBACK_MAX_AGE,
  REFRESH_FALLBACK_MAX_AGE,
  maxAgeFromExpiry,
} from '../jwt-expiry'
import type { AuthUser } from '../types'

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  }
}

/** The token + user payload returned by login (after envelope unwrap). Keys
 *  are snake_case: the API's SnakeCaseInterceptor rewrites every response. */
export interface SessionData {
  access_token: string
  refresh_token: string
  user: {
    id: string
    name: string
    email: string
    role: AuthUser['role']
    must_change_password: boolean
    school_id: string
  }
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
  const user: AuthUser = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role,
    mustChangePassword: data.user.must_change_password,
    schoolId: data.user.school_id,
  }
  cookieStore.set(USER_COOKIE, JSON.stringify(user), cookieOptions(refreshMaxAge))
}

/** Remove every session cookie (logout, or when a refresh token is rejected). */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
  cookieStore.delete(USER_COOKIE)
}
