import type { Metadata } from 'next'
import { AttendanceScreen } from '@/features/attendance/components/attendance-screen'

export const metadata: Metadata = { title: 'Attendance — Attendance' }

export default function AttendancePage() {
  return <AttendanceScreen />
}
