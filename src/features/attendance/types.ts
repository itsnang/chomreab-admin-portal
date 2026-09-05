export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface RosterEntry {
  studentId: string
  studentName: string
  status: AttendanceStatus | null
  note: string | null
}

export interface MyClassSummary {
  classroomId: string
  name: string
  gradeLabel: string | null
  studentCount: number
  unmarkedCount: number
}

export interface AuditLogEntry {
  changedAt: string
  studentName: string
  changedByName: string
  previousStatus: AttendanceStatus
  newStatus: AttendanceStatus
}
