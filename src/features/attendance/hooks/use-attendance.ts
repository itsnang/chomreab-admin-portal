'use client'

import { useQuery } from '@tanstack/react-query'
import { getRoster, getMyClasses, getAuditLog } from '../actions'

export function useRoster(classroomId: string, date: string) {
  return useQuery({
    queryKey: ['roster', classroomId, date],
    queryFn: () => getRoster(classroomId, date),
    enabled: !!classroomId,
  })
}

export function useMyClasses(date: string) {
  return useQuery({ queryKey: ['my-classes', date], queryFn: () => getMyClasses(date) })
}

export function useAuditLog(classroomId: string, date: string) {
  return useQuery({
    queryKey: ['audit-log', classroomId, date],
    queryFn: () => getAuditLog(classroomId, date),
    enabled: !!classroomId,
  })
}
