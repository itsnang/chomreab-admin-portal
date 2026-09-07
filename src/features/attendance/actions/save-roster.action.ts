'use server'

import { ApiError, apiFetch } from '@/lib/api/server'
import type { AttendanceStatus, StagedMark } from '../types'

/**
 * Commit a batch of staged marks in as few requests as possible.
 *
 * `/attendance/bulk-mark` takes one status for many students but carries no
 * note, so plain marks are grouped by status into at most three requests and
 * only the noted ones fall back to `/attendance/mark` one at a time. The
 * teacher's identity comes from the session cookie inside `apiFetch`; it is
 * never accepted from the caller.
 */
export async function saveRoster(
  classroomId: string,
  date: string,
  marks: StagedMark[],
): Promise<{ error?: string }> {
  if (marks.length === 0) return {}

  const byStatus = new Map<AttendanceStatus, string[]>()
  const noted: StagedMark[] = []

  for (const mark of marks) {
    if (mark.note) {
      noted.push(mark)
      continue
    }
    const group = byStatus.get(mark.status)
    if (group) group.push(mark.studentId)
    else byStatus.set(mark.status, [mark.studentId])
  }

  try {
    for (const [status, studentIds] of byStatus) {
      await apiFetch('/attendance/bulk-mark', {
        method: 'POST',
        body: JSON.stringify({
          student_ids: studentIds,
          classroom_id: classroomId,
          date,
          status,
        }),
      })
    }

    for (const mark of noted) {
      await apiFetch('/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({
          student_id: mark.studentId,
          classroom_id: classroomId,
          date,
          status: mark.status,
          note: mark.note,
        }),
      })
    }
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to save attendance' }
  }

  return {}
}
