import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_COOKIE } from '@/features/auth/cookies'
import {
  ACCESS_FALLBACK_MAX_AGE,
  REFRESH_FALLBACK_MAX_AGE,
  maxAgeFromExpiry,
} from '@/features/auth/jwt-expiry'

// Unauthenticated (auth) route group — never gated.
const AUTH_PATHS = ['/login']

// Read straight from `process.env` rather than through `@/env`, which imports
// `server-only` and so cannot be pulled into the proxy bundle. Same default.
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8091'

interface RefreshedTokens {
  accessToken: string
  refreshToken: string
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

function hasUser(request: NextRequest): boolean {
  const rawUser = request.cookies.get(USER_COOKIE)?.value
  if (!rawUser) return false
  try {
    JSON.parse(rawUser)
    return true
  } catch {
    return false
  }
}

/** Exchange a refresh token for a new pair. Returns null when the API refuses
 *  it (expired, already used, revoked) or cannot be reached. */
async function exchangeRefreshToken(refreshToken: string): Promise<RefreshedTokens | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return null
    const body = (await res.json()) as {
      data?: { access_token?: string; refresh_token?: string }
    }
    const accessToken = body.data?.access_token
    const rotatedRefreshToken = body.data?.refresh_token
    if (!accessToken || !rotatedRefreshToken) return null
    return { accessToken, refreshToken: rotatedRefreshToken }
  } catch {
    return null
  }
}

function applyTokens(response: NextResponse, tokens: RefreshedTokens): NextResponse {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    cookieOptions(maxAgeFromExpiry(tokens.accessToken, ACCESS_FALLBACK_MAX_AGE)),
  )
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    cookieOptions(maxAgeFromExpiry(tokens.refreshToken, REFRESH_FALLBACK_MAX_AGE)),
  )
  return response
}

function signedOut(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.delete(ACCESS_TOKEN_COOKIE)
  response.cookies.delete(REFRESH_TOKEN_COOKIE)
  response.cookies.delete(USER_COOKIE)
  return response
}

/**
 * Gates the dashboard, and keeps a session alive across the access token's
 * short life.
 *
 * The access token lasts 15 minutes and its cookie expires with it; the
 * refresh token lasts 7 days. Treating a missing access cookie as "signed
 * out" therefore threw people back to the login screen a quarter-hour after
 * they last clicked anything, with six and a half days of valid session still
 * sitting in the next cookie along. So a missing access token is not the
 * question — whether the refresh token can still buy a new one is.
 *
 * The exchange happens here rather than deeper in the app because the proxy is
 * one of the few places allowed to write cookies. A Server Component render
 * cannot, and the API rotates refresh tokens on use: refreshing somewhere that
 * cannot persist the result destroys the old token and drops the new one,
 * which locks the user out for real.
 *
 * Role is not checked here. Both login endpoints reject the wrong role
 * server-side, and every mutation is authorised by the API; the dashboard
 * layout only decides which nav links to render.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPath = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  const userPresent = hasUser(request)

  // A session that still has a usable access token, or none at all, needs no
  // call to the API — the common case stays a pure cookie read.
  const liveSession = !!accessToken && userPresent
  const renewable = !accessToken && !!refreshToken && userPresent

  if (isAuthPath) {
    // Never refresh on the login route. It would turn a rejected token into a
    // redirect back to a page that refreshes again, and the only thing at
    // stake is whether an already-signed-in user gets bounced to the
    // dashboard — not worth spending a single-use refresh token on.
    if (liveSession || renewable) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (liveSession) return NextResponse.next()

  if (!renewable) return signedOut(request)

  // Prefetches are not refreshed. The API deletes a refresh token the moment
  // it is used, so two requests racing with the same one means the loser is
  // signed out — and Next fires prefetches alongside real navigations all the
  // time. Let the prefetch through unrefreshed; the navigation that follows
  // does the exchange, and any API call meanwhile still has `apiFetch`'s
  // 401 retry behind it.
  if (request.headers.get('Next-Router-Prefetch') === '1') {
    return NextResponse.next()
  }

  const tokens = await exchangeRefreshToken(refreshToken)
  if (!tokens) return signedOut(request)

  return applyTokens(NextResponse.next(), tokens)
}

export const config = {
  // Run on all routes except Next internals, static assets, and metadata files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
