import type { Metadata } from 'next'
import { StaffScreen } from '@/features/staff/components/staff-screen'

export const metadata: Metadata = { title: 'Staff — Attendance' }

export default function StaffPage() {
  return <StaffScreen />
}
