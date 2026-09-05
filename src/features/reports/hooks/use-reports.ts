'use client'

import { useQuery } from '@tanstack/react-query'
import { getReportsSummary } from '../actions'

export function useReportsSummary() {
  return useQuery({ queryKey: ['reports-summary'], queryFn: getReportsSummary })
}
