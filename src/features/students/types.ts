export interface Student {
  id: string
  name: string
  classroomId: string
  status: 'active' | 'inactive'
}

export interface LinkingStatus {
  studentId: string
  studentName: string
  linked: boolean
  activeCode: string | null
}
