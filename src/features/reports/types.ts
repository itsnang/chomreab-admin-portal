export interface StudentReportRow {
  studentId: string
  studentName: string
  classroomName: string
  present: number
  late: number
  absent: number
  ratePct: number
  chronic: boolean
}

export interface ClassDailySummary {
  classroomId: string
  classroomName: string
  present: number
  late: number
  absent: number
  unmarked: number
}

export interface ReportsSummary {
  overallRatePct: number
  chronicCount: number
  dailySummary: ClassDailySummary[]
  studentRows: StudentReportRow[]
}
