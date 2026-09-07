/** Parse a `YYYY-MM-DD` string as a *local* date. `new Date(iso)` reads it as
 *  UTC midnight, which lands on the previous day west of Greenwich. */
function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1)
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Today in the viewer's timezone, as the `YYYY-MM-DD` the API expects. */
export function today(): string {
  return toIsoDate(new Date())
}

/** Shift an ISO date by whole days — the attendance date stepper. */
export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

export function isToday(iso: string): boolean {
  return iso === today()
}

/**
 * Format an ISO date as a localized "Month D, YYYY" string. `month` controls
 * the month style: `'short'` (default, e.g. "Jun 24, 2026") for compact lists,
 * `'long'` (e.g. "June 24, 2026") for detail views.
 */
export function formatDate(iso: string, month: 'short' | 'long' = 'short'): string {
  return parseIsoDate(iso).toLocaleDateString('en-US', {
    month,
    day: 'numeric',
    year: 'numeric',
  })
}

/** "Mon, Sep 7" — where the weekday matters more than the year. */
export function formatWeekday(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
