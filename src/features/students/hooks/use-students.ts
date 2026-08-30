'use client'

import { useQuery } from '@tanstack/react-query'
import { listStudents, getLinkingStatus } from '../actions'

export function useStudents(classroomId?: string) {
  return useQuery({
    queryKey: ['students', classroomId ?? 'all'],
    queryFn: () => listStudents(classroomId),
  })
}

export function useLinkingStatus() {
  return useQuery({ queryKey: ['linking-status'], queryFn: getLinkingStatus })
}
