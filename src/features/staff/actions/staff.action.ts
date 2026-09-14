'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/server'
import type { Teacher } from '../types'
import type { TeacherInput } from '../schemas'

interface TeacherApi {
  id: string
  name: string
  email: string
  classroom_names: string[]
}

function toTeacher(api: TeacherApi): Teacher {
  return { id: api.id, name: api.name, email: api.email, classroomNames: api.classroom_names }
}

export async function listTeachers(): Promise<Teacher[]> {
  const items = await apiFetch<TeacherApi[]>('/staff')
  return items.map(toTeacher)
}

interface CreateTeacherApi {
  id: string
  name: string
  email: string
  temporary_password: string
}

export async function createTeacher(input: TeacherInput): Promise<{ temporaryPassword?: string; error?: string; classroomAssignmentFailed?: boolean }> {
  let created: CreateTeacherApi
  try {
    created = await apiFetch<CreateTeacherApi>('/staff', {
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
  return { temporaryPassword: created.temporary_password, classroomAssignmentFailed }
}

export async function updateTeacher(
  id: string,
  input: { name: string; email: string },
): Promise<{ error?: string }> {
  try {
    await apiFetch(`/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: input.name, email: input.email }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to update teacher' }
  }
  revalidatePath('/staff')
  return {}
}

interface ResetPasswordApi {
  temporary_password: string
}

/** The only recovery path for a locked-out teacher: reset-by-email mints a
 *  token that `EmailService` never sends. */
export async function resetTeacherPassword(
  id: string,
): Promise<{ temporaryPassword?: string; error?: string }> {
  let result: ResetPasswordApi
  try {
    result = await apiFetch<ResetPasswordApi>(`/staff/${id}/reset-password`, {
      method: 'POST',
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to reset password' }
  }
  revalidatePath('/staff')
  return { temporaryPassword: result.temporary_password }
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
