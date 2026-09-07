'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/server'
import type { LinkingStatus, Student } from '../types'
import type { StudentInput } from '../schemas'

// Read responses come back camelCase (see attendance.action.ts); only request
// bodies use the API's snake_case DTO shape.

export async function listStudents(classroomId?: string): Promise<Student[]> {
  const query = classroomId ? `?classroom_id=${classroomId}` : ''
  return apiFetch<Student[]>(`/students${query}`)
}

export async function createStudent(input: StudentInput): Promise<{ error?: string }> {
  try {
    await apiFetch('/students', {
      method: 'POST',
      body: JSON.stringify({ name: input.name, classroom_id: input.classroomId }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to add student' }
  }
  revalidatePath('/students')
  return {}
}

export async function deleteStudent(id: string): Promise<{ error?: string }> {
  try {
    await apiFetch(`/students/${id}`, { method: 'DELETE' })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to remove student' }
  }
  revalidatePath('/students')
  return {}
}

export async function getLinkingStatus(): Promise<LinkingStatus[]> {
  return apiFetch<LinkingStatus[]>('/parent-links/status')
}

interface LinkingCode {
  code: string
}

export async function generateLinkingCode(studentId: string): Promise<{ code?: string; error?: string }> {
  let result: LinkingCode
  try {
    result = await apiFetch<LinkingCode>('/parent-links/codes', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to generate code' }
  }
  revalidatePath('/students')
  return { code: result.code }
}
