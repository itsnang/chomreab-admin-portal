'use client'

import { useQuery } from '@tanstack/react-query'
import { getRoster } from '../actions'

export function useRoster(classroomId: string, date: string) {
  return useQuery({
    queryKey: ['roster', classroomId, date],
    queryFn: () => getRoster(classroomId, date),
    enabled: !!classroomId,
  })
}
