'use client'

import { useQuery } from '@tanstack/react-query'
import { listTeachers } from '../actions'

export function useTeachers() {
  return useQuery({ queryKey: ['teachers'], queryFn: listTeachers })
}
