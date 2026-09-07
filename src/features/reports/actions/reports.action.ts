'use server'

import { apiFetch } from '@/lib/api/server'
import type { ReportsSummary } from '../types'

// Read responses come back camelCase (see attendance.action.ts), matching
// `ReportsSummary` exactly, so no mapping is needed.

export async function getReportsSummary(): Promise<ReportsSummary> {
  return apiFetch<ReportsSummary>('/reports/summary')
}
