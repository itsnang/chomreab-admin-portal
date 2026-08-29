export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface RosterEntry {
  studentId: string
  studentName: string
  status: AttendanceStatus | null
  note: string | null
}
