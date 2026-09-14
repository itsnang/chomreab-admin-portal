'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { QueryState } from './query-state'

interface ListCardProps {
  /** The screen's primary query, gated in one place instead of per screen. */
  isPending: boolean
  isError: boolean
  /** Shown in place of the list when the query failed. */
  errorMessage: string
  onRetry: () => void
  children: ReactNode
  className?: string
}

/**
 * The card every list sits in, with its loading and error states. Seven screens
 * repeated `isPending || isError ? <QueryState/> : <div className="card">` with
 * slightly different padding each time.
 */
export function ListCard({
  isPending,
  isError,
  errorMessage,
  onRetry,
  children,
  className,
}: ListCardProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card shadow-card-sm', className)}>
      {isPending || isError ? (
        <QueryState
          isPending={isPending}
          message={errorMessage}
          onRetry={onRetry}
          className="py-14"
        />
      ) : (
        children
      )}
    </div>
  )
}
