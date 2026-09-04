const AVATAR_PALETTE = ['#0066CC', '#4B6B8A', '#46935E', '#C2605F']

/** Deterministic color per entity id, matching the design's avatar rotation. */
export function avatarColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]!
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter((c): c is string => Boolean(c))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
