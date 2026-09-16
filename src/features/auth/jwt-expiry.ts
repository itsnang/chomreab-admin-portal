/** Reads a JWT's `exp` claim without verifying the signature — we are only
 *  deciding how long to keep a cookie, and the API is the thing that actually
 *  validates the token.
 *
 *  Deliberately `atob` rather than `Buffer`: the proxy runs on the Edge
 *  runtime where `Buffer` does not exist, and this has to give the same answer
 *  there as it does in a Node server action. One implementation, two runtimes.
 */
function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = (4 - (base64.length % 4)) % 4
  return atob(base64 + '='.repeat(padding))
}

export function jwtExpiry(token: string): number | null {
  const payload = token.split('.')[1]
  if (!payload) return null
  try {
    const json = JSON.parse(decodeBase64Url(payload)) as { exp?: number }
    return typeof json.exp === 'number' ? json.exp : null
  } catch {
    return null
  }
}

/** Cookie lifetime matched to the token's own `exp`, falling back to a sane
 *  default when the token is unreadable. */
export function maxAgeFromExpiry(token: string, fallbackSeconds: number): number {
  const exp = jwtExpiry(token)
  if (exp === null) return fallbackSeconds
  const remaining = exp - Math.floor(Date.now() / 1000)
  return remaining > 0 ? remaining : fallbackSeconds
}

export const ACCESS_FALLBACK_MAX_AGE = 60 * 15 // 15 minutes
export const REFRESH_FALLBACK_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
