'use client'

import { useQuery } from '@tanstack/react-query'
import { listStudents, getLinkingStatus } from '../actions'

export function useStudents(classroomId?: string, includeInactive = false) {
  return useQuery({
    queryKey: ['students', classroomId ?? 'all', includeInactive],
    queryFn: () => listStudents(classroomId, includeInactive),
  })
}

export function useLinkingStatus() {
  return useQuery({ queryKey: ['linking-status'], queryFn: getLinkingStatus })
}
