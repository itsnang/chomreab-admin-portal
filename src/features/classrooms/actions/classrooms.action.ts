'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/server'
import type { Classroom } from '../types'
import type { ClassroomInput } from '../schemas'

interface ClassroomApi {
  id: string
  name: string
  grade_label: string | null
  teacher_id: string | null
}

function toClassroom(api: ClassroomApi): Classroom {
  return { id: api.id, name: api.name, gradeLabel: api.grade_label, teacherId: api.teacher_id }
}

export async function listClassrooms(): Promise<Classroom[]> {
  const items = await apiFetch<ClassroomApi[]>('/classrooms')
  return items.map(toClassroom)
}

export async function createClassroom(input: ClassroomInput): Promise<{ error?: string }> {
  try {
    await apiFetch('/classrooms', {
      method: 'POST',
      body: JSON.stringify({ name: input.name, grade_label: input.gradeLabel || null }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to create classroom' }
  }
  revalidatePath('/dashboard/classrooms')
  return {}
}

export async function deleteClassroom(id: string): Promise<{ error?: string }> {
  try {
    await apiFetch(`/classrooms/${id}`, { method: 'DELETE' })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to delete classroom' }
  }
  revalidatePath('/dashboard/classrooms')
  return {}
}
