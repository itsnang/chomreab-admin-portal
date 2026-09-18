'use server'

import { ApiError, apiFetch } from '@/lib/api/server'
import type { SignupInput } from '../schemas'

interface SignupResult {
  school_id: string
  email: string
}

/**
 * Creates the School and its founding admin. Unlike `login`, this never
 * persists a session — the API returns no tokens, since the account can't
 * sign in until the verification email is confirmed (`verifyEmail` below).
 */
export async function signup(input: SignupInput): Promise<{ error?: string; email?: string }> {
  try {
    const result = await apiFetch<SignupResult>('/schools/signup', {
      method: 'POST',
      body: JSON.stringify({
        school_name: input.schoolName,
        admin_name: input.adminName,
        admin_email: input.adminEmail,
        password: input.password,
      }),
    })
    return { email: result.email }
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to create your school. Please try again.' }
  }
}

export async function verifyEmail(token: string): Promise<{ error?: string }> {
  try {
    await apiFetch('/schools/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
    return {}
  } catch (e) {
    return {
      error: e instanceof ApiError ? e.message : 'Invalid or expired verification link.',
    }
  }
}
