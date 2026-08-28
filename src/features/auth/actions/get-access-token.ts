'use server'

import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE } from '../cookies'

/** The signed-in user's access token from the session cookie, or null if
 *  signed out. Lives in its own module so `@/lib/api/server` can read it
 *  without importing the auth actions (which import the API helper — that
 *  would be circular). */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null
}
