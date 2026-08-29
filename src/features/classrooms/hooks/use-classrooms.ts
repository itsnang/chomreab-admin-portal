'use client'

import { useQuery } from '@tanstack/react-query'
import { listClassrooms } from '../actions'

export function useClassrooms() {
  return useQuery({ queryKey: ['classrooms'], queryFn: listClassrooms })
}
