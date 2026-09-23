// PROTOTYPE for ticket #22 (regroup the admin nav rail) — delete once a
// variant is chosen. https://github.com/itsnang/attendance-admin/issues/22
//
// Groups by slicing on ADMIN_NAV's existing order (layout.tsx), which is
// already contiguous by theme: Classrooms/Students/Linking codes/Staff run
// day-to-day operation, Reports/Billing are the numbers, Settings stands
// alone.
export const NAV_GROUP_SIZES = [4, 2, 1] as const
export const NAV_GROUP_LABELS = ['Operate', 'Grow', 'Configure'] as const

export function groupNavItems<T>(items: readonly T[]): T[][] {
  let i = 0
  return NAV_GROUP_SIZES.map((size) => items.slice(i, (i += size))).filter((group) => group.length > 0)
}

export type NavVariant = 'A' | 'B' | 'C'

export const NAV_VARIANTS: readonly { key: NavVariant; name: string }[] = [
  { key: 'A', name: 'Divided' },
  { key: 'B', name: 'Labelled' },
  { key: 'C', name: 'Frequency tiers' },
]
