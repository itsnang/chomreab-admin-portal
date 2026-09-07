'use server'

import { apiFetch } from '@/lib/api/server'
import type { ReportsSummary } from '../types'

interface ReportsSummaryApi {
  overall_rate_pct: number
  chronic_count: number
  daily_summary: {
    classroom_id: string
    classroom_name: string
    present: number
    late: number
    absent: number
    unmarked: number
  }[]
  student_rows: {
    student_id: string
    student_name: string
    classroom_name: string
    present: number
    late: number
    absent: number
    rate_pct: number
    chronic: boolean
  }[]
}

export async function getReportsSummary(): Promise<ReportsSummary> {
  const api = await apiFetch<ReportsSummaryApi>('/reports/summary')
  return {
    overallRatePct: api.overall_rate_pct,
    chronicCount: api.chronic_count,
    dailySummary: api.daily_summary.map((d) => ({
      classroomId: d.classroom_id,
      classroomName: d.classroom_name,
      present: d.present,
      late: d.late,
      absent: d.absent,
      unmarked: d.unmarked,
    })),
    studentRows: api.student_rows.map((r) => ({
      studentId: r.student_id,
      studentName: r.student_name,
      classroomName: r.classroom_name,
      present: r.present,
      late: r.late,
      absent: r.absent,
      ratePct: r.rate_pct,
      chronic: r.chronic,
    })),
  }
}
