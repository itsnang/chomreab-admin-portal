import 'server-only'

import { env } from '@/env'
import { getAccessToken } from '@/features/auth/actions/get-access-token'
import { refreshSession } from '@/features/auth/actions/refresh-session'

/** Thrown when the API responds with a non-2xx status. Carries the HTTP status
 *  and the API's own message (when present) so callers can surface it. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Every API response is wrapped by the server's `ResponseTransformInterceptor`
 *  in a `{ code, message, data }` envelope; the real payload lives in `data`. */
export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

/** Shape of a paginated list endpoint's `data` payload (the envelope's
 *  `_links` are omitted here — callers drive paging off `meta.total_pages`). */
export interface ApiPaginated<T> {
  items: T[]
  meta: { total: number; page: number; limit: number; total_pages: number }
}

/**
 * Server-only fetch against `attendance-api`. Prepends `API_BASE_URL`, attaches
 * the signed-in user's `Authorization: Bearer` token from the session cookie,
 * unwraps the `{ code, message, data }` response envelope, and returns `data`.
 * Throws `ApiError` on a non-2xx response. Intended to be called from
 * `'use server'` action files so the token never reaches the client.
 */
function request(path: string, init: RequestInit | undefined, token: string | null): Promise<Response> {
  return fetch(`${env.API_BASE_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken()

  let res = await request(path, init, token)

  // The access token lasts ~15 min; on expiry the API answers 401. Retry once
  // with a refreshed token before giving up.
  //
  // Deliberately not conditional on having *sent* a token: the access cookie
  // expires with the token inside it, so the case worth handling most is the
  // one where there was nothing to send. Gating this on `token` meant a
  // request made after those 15 minutes never even attempted a refresh.
  if (res.status === 401) {
    const refreshed = await refreshSession()
    if (refreshed) res = await request(path, init, refreshed)
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(res.status, body?.message ?? `Request failed (${res.status})`)
  }

  if (res.status === 204) return undefined as T
  const body = (await res.json()) as ApiEnvelope<T>
  return body.data
}
