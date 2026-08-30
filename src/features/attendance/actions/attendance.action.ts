'use server'

import { ApiError, apiFetch } from '@/lib/api/server'
import type { AttendanceStatus, RosterEntry } from '../types'

interface RosterEntryApi {
  student_id: string
  student_name: string
  status: AttendanceStatus | null
  note: string | null
}

function toRosterEntry(api: RosterEntryApi): RosterEntry {
  return { studentId: api.student_id, studentName: api.student_name, status: api.status, note: api.note }
}

export async function getRoster(classroomId: string, date: string): Promise<RosterEntry[]> {
  const items = await apiFetch<RosterEntryApi[]>(
    `/attendance/roster?classroom_id=${classroomId}&date=${date}`,
  )
  return items.map(toRosterEntry)
}

export async function markAttendance(
  studentId: string,
  classroomId: string,
  date: string,
  status: AttendanceStatus,
  note?: string,
): Promise<{ error?: string }> {
  try {
    await apiFetch('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, classroom_id: classroomId, date, status, note }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to mark attendance' }
  }
  return {}
}

export async function bulkMarkAttendance(
  studentIds: string[],
  classroomId: string,
  date: string,
  status: AttendanceStatus,
): Promise<{ error?: string }> {
  try {
    await apiFetch('/attendance/bulk-mark', {
      method: 'POST',
      body: JSON.stringify({ student_ids: studentIds, classroom_id: classroomId, date, status }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to bulk-mark attendance' }
  }
  return {}
}
