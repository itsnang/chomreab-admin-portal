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
  /** Empty string on the first mark of the day — there was no previous status. */
  previousStatus: AttendanceStatus | ''
  newStatus: AttendanceStatus
}

/** A mark the teacher has changed but not yet saved. Nothing reaches a parent
 *  until these are committed by `saveRoster`. */
export interface StagedMark {
  studentId: string
  status: AttendanceStatus
  note: string | null
}
