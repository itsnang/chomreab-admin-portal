'use client'

import { useQuery } from '@tanstack/react-query'
import { getBillingStatus } from '../actions'

export function useBillingStatus() {
  return useQuery({ queryKey: ['billing-status'], queryFn: getBillingStatus })
}
