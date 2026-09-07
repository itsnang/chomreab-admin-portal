'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/server'
import type { Classroom } from '../types'
import type { ClassroomInput } from '../schemas'

// Read responses come back camelCase (see attendance.action.ts); only request
// bodies use the API's snake_case DTO shape.

export async function listClassrooms(): Promise<Classroom[]> {
  return apiFetch<Classroom[]>('/classrooms')
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
  revalidatePath('/classrooms')
  return {}
}

export async function deleteClassroom(id: string): Promise<{ error?: string }> {
  try {
    await apiFetch(`/classrooms/${id}`, { method: 'DELETE' })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to delete classroom' }
  }
  revalidatePath('/classrooms')
  return {}
}
