import type { Metadata } from 'next'
import { ClassroomsScreen } from '@/features/classrooms/components/classrooms-screen'

export const metadata: Metadata = { title: 'Classrooms — Chomreab' }

export default function ClassroomsPage() {
  return <ClassroomsScreen />
}
