import type { Metadata } from 'next'
import { StudentsScreen } from '@/features/students/components/students-screen'

export const metadata: Metadata = { title: 'Students — Attendance' }

export default function StudentsPage() {
  return <StudentsScreen />
}
