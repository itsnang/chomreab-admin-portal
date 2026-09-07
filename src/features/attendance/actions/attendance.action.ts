'use server'

import { ApiError, apiFetch } from '@/lib/api/server'
import type { AttendanceStatus, RosterEntry, MyClassSummary, AuditLogEntry } from '../types'

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

interface MyClassSummaryApi {
  classroom_id: string
  name: string
  grade_label: string | null
  student_count: number
  unmarked_count: number
}

function toMyClassSummary(api: MyClassSummaryApi): MyClassSummary {
  return {
    classroomId: api.classroom_id,
    name: api.name,
    gradeLabel: api.grade_label,
    studentCount: api.student_count,
    unmarkedCount: api.unmarked_count,
  }
}

export async function getMyClasses(date: string): Promise<MyClassSummary[]> {
  const items = await apiFetch<MyClassSummaryApi[]>(`/attendance/my-classes?date=${date}`)
  return items.map(toMyClassSummary)
}

interface AuditLogEntryApi {
  changed_at: string
  student_name: string
  changed_by_name: string
  previous_status: AttendanceStatus
  new_status: AttendanceStatus
}

function toAuditLogEntry(api: AuditLogEntryApi): AuditLogEntry {
  return {
    changedAt: api.changed_at,
    studentName: api.student_name,
    changedByName: api.changed_by_name,
    previousStatus: api.previous_status,
    newStatus: api.new_status,
  }
}

export async function getAuditLog(classroomId: string, date: string): Promise<AuditLogEntry[]> {
  const items = await apiFetch<AuditLogEntryApi[]>(
    `/attendance/audit-log?classroom_id=${classroomId}&date=${date}`,
  )
  return items.map(toAuditLogEntry)
}
