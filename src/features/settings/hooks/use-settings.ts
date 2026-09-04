'use client'

import { useQuery } from '@tanstack/react-query'
import { getSchoolSettings } from '../actions'

export function useSchoolSettings() {
  return useQuery({ queryKey: ['school-settings'], queryFn: getSchoolSettings })
}
