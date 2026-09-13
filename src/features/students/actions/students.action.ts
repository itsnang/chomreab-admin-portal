'use server'

import { revalidatePath } from 'next/cache'
import { ApiError, apiFetch } from '@/lib/api/server'
import type { LinkingStatus, Student } from '../types'
import type { StudentInput } from '../schemas'

interface StudentApi {
  id: string
  name: string
  classroom_id: string
  status: 'active' | 'inactive'
}

function toStudent(api: StudentApi): Student {
  return { id: api.id, name: api.name, classroomId: api.classroom_id, status: api.status }
}

export async function listStudents(
  classroomId?: string,
  includeInactive = false,
): Promise<Student[]> {
  const params = new URLSearchParams()
  if (classroomId) params.set('classroom_id', classroomId)
  if (includeInactive) params.set('include_inactive', 'true')
  const query = params.toString()
  const items = await apiFetch<StudentApi[]>(`/students${query ? `?${query}` : ''}`)
  return items.map(toStudent)
}

export async function updateStudent(
  id: string,
  input: StudentInput,
): Promise<{ error?: string }> {
  try {
    await apiFetch(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: input.name, classroom_id: input.classroomId }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to update student' }
  }
  revalidatePath('/students')
  return {}
}

/** Deactivating is how a student leaves. It keeps their attendance history
 *  readable, which deleting them does not — nothing cascades, so a deleted
 *  student's records survive pointing at nobody. */
export async function setStudentStatus(
  id: string,
  status: Student['status'],
): Promise<{ error?: string }> {
  try {
    await apiFetch(`/students/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to update student' }
  }
  revalidatePath('/students')
  return {}
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

interface LinkingStatusApi {
  student_id: string
  student_name: string
  linked: boolean
  active_code: string | null
}

export async function getLinkingStatus(): Promise<LinkingStatus[]> {
  const items = await apiFetch<LinkingStatusApi[]>('/parent-links/status')
  return items.map((i) => ({
    studentId: i.student_id,
    studentName: i.student_name,
    linked: i.linked,
    activeCode: i.active_code,
  }))
}

interface LinkingCodeApi {
  code: string
}

export async function generateLinkingCode(studentId: string): Promise<{ code?: string; error?: string }> {
  let result: LinkingCodeApi
  try {
    result = await apiFetch<LinkingCodeApi>('/parent-links/codes', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
    })
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Failed to generate code' }
  }
  revalidatePath('/students')
  return { code: result.code }
}
