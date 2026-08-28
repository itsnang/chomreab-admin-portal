/**
 * Format an ISO date as a localized "Month D, YYYY" string. `month` controls
 * the month style: `'short'` (default, e.g. "Jun 24, 2026") for compact lists,
 * `'long'` (e.g. "June 24, 2026") for detail views.
 */
export function formatDate(iso: string, month: 'short' | 'long' = 'short'): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month,
    day: 'numeric',
    year: 'numeric',
  })
}
