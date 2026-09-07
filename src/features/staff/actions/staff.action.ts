'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/server'
import type { Teacher } from '../types'
import type { TeacherInput } from '../schemas'

// Read responses come back camelCase (see attendance.action.ts); only request
// bodies use the API's snake_case DTO shape.

export async function listTeachers(): Promise<Teacher[]> {
  return apiFetch<Teacher[]>('/staff')
}

interface CreatedTeacher {
  id: string
  name: string
  email: string
  temporaryPassword: string
}

export async function createTeacher(input: TeacherInput): Promise<{ temporaryPassword?: string; error?: string; classroomAssignmentFailed?: boolean }> {
  let created: CreatedTeacher
  try {
    created = await apiFetch<CreatedTeacher>('/staff', {
      method: 'POST',
      body: JSON.stringify({ name: input.name, email: input.email }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to add teacher' }
  }

  let classroomAssignmentFailed = false
  if (input.classroomId) {
    try {
      await apiFetch(`/classrooms/${input.classroomId}`, {
        method: 'PATCH',
        body: JSON.stringify({ teacher_id: created.id }),
      })
    } catch (e) {
      // Teacher account was created; the classroom assignment failing isn't
      // fatal — the admin can assign it from the Classrooms screen instead.
      console.error(`Failed to assign teacher ${created.id} to classroom ${input.classroomId}:`, e)
      classroomAssignmentFailed = true
    }
  }

  revalidatePath('/staff')
  revalidatePath('/classrooms')
  return { temporaryPassword: created.temporaryPassword, classroomAssignmentFailed }
}

export async function deleteTeacher(id: string): Promise<{ error?: string }> {
  try {
    await apiFetch(`/staff/${id}`, { method: 'DELETE' })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to remove teacher' }
  }
  revalidatePath('/staff')
  revalidatePath('/classrooms')
  return {}
}
