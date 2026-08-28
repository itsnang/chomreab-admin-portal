/**
 * Relative label from an absolute timestamp (ms) — "just now", "Xm ago",
 * "Xh ago", or "Xd ago" (all floored). For event timestamps that should read
 * naturally across minutes to days.
 */
export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
