import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ACCESS_TOKEN_COOKIE, USER_COOKIE } from '@/features/auth/cookies'

// Unauthenticated (auth) route group — never gated.
const AUTH_PATHS = ['/login']

// A session is established via /auth/admin/login or /auth/teacher/login, both
// of which reject the wrong role server-side — so presence of a valid session
// is sufficient here. The dashboard layout only chooses which nav links to
// show per role; it does not redirect users away from routes their role
// shouldn't access. There is no per-route access enforcement in the app —
// enforcement is entirely server-side, via the backend API rejecting
// mutations the caller's role isn't allowed to perform.
function isAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) return false

  const rawUser = request.cookies.get(USER_COOKIE)?.value
  if (!rawUser) return false
  try {
    JSON.parse(rawUser)
    return true
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPath = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  const authed = isAuthenticated(request)

  // Keep signed-in users out of the auth pages.
  if (isAuthPath) {
    if (authed) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Everything else is protected.
  if (!authed) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run on all routes except Next internals, static assets, and metadata files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
