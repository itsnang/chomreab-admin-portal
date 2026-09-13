'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ApiError, apiFetch } from '@/lib/api/server'
import { USER_COOKIE } from '../cookies'
import { clearSession, persistSession } from './session-store'
import type { SessionData } from './session-store'
import type { AuthUser } from '../types'
import type { LoginInput } from '../schemas'

const NETWORK_ERROR = 'Unable to reach the server. Please try again.'
const GENERIC_ERROR = 'Something went wrong. Please try again.'

/** Map a thrown `apiFetch` error to a user-facing message. `ApiError` carries
 *  the API's own message; anything else is a transport failure. */
function errorMessage(e: unknown, fallback = GENERIC_ERROR): string {
  if (e instanceof ApiError) return e.message || fallback
  return NETWORK_ERROR
}

/** There is one login form for both roles. Try the admin endpoint first; only
 *  fall back to the teacher endpoint when the API rejected the account
 *  specifically for not being an admin (a bad password fails the same way on
 *  either endpoint, so there's no point retrying it). */
async function loginRequest(input: LoginInput): Promise<SessionData> {
  try {
    return await apiFetch<SessionData>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  } catch (e) {
    if (e instanceof ApiError && e.message === 'Access restricted to admin accounts') {
      return await apiFetch<SessionData>('/auth/teacher/login', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    }
    throw e
  }
}

export async function login(input: LoginInput): Promise<{ error?: string }> {
  let data: SessionData
  try {
    data = await loginRequest(input)
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 400)) {
      return { error: e.message || 'Invalid email or password' }
    }
    return { error: errorMessage(e) }
  }
  await persistSession(data)
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  await clearSession()
  redirect('/login')
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(USER_COOKIE)?.value
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}
