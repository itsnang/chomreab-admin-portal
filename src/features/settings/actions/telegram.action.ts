'use server'

import { apiFetch } from '@/lib/api/server'

interface LinkingStatusApi {
  linked: boolean
}

/** How many parents are currently receiving messages through the saved bot.
 *
 *  Read straight from the API rather than through the `students` slice's
 *  hook: that slice already imports from `settings`, and importing back would
 *  close a cycle the dependency rule exists to prevent. Endpoints belong to
 *  no slice. */
export async function getLinkedParentCount(): Promise<number> {
  try {
    const rows = await apiFetch<LinkingStatusApi[]>('/parent-links/status')
    return rows.filter((row) => row.linked).length
  } catch {
    // Only ever used to make a warning concrete. If it cannot be fetched the
    // warning still shows, just without a number.
    return 0
  }
}
