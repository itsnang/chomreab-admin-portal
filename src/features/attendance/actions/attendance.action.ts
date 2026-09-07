'use server'

import { ApiError, apiFetch } from '@/lib/api/server'
import type { AttendanceStatus, RosterEntry, MyClassSummary, AuditLogEntry } from '../types'

// Read responses are the API's query-handler return values serialized as-is,
// so they arrive camelCase and need no mapping. Only request bodies use the
// API's snake_case DTO shape.

export async function getRoster(classroomId: string, date: string): Promise<RosterEntry[]> {
  return apiFetch<RosterEntry[]>(`/attendance/roster?classroom_id=${classroomId}&date=${date}`)
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

export async function getMyClasses(date: string): Promise<MyClassSummary[]> {
  return apiFetch<MyClassSummary[]>(`/attendance/my-classes?date=${date}`)
}

export async function getAuditLog(classroomId: string, date: string): Promise<AuditLogEntry[]> {
  return apiFetch<AuditLogEntry[]>(
    `/attendance/audit-log?classroom_id=${classroomId}&date=${date}`,
  )
}
