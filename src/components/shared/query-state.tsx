import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QueryStateProps {
  isPending: boolean
  /** Message shown when the query errored, above a "Try again" retry button. */
  message: string
  onRetry: () => void
  /** Extra classes for the centering wrapper (e.g. vertical padding per screen). */
  className?: string
}

/**
 * Loading spinner / error+retry view for a `useQuery`-backed screen. Render it
 * whenever `isPending || isError` and put the loaded content in the else branch.
 */
export function QueryState({ isPending, message, onRetry, className }: QueryStateProps) {
  return (
    <div
      className={cn('grid place-items-center text-center', className)}
      style={{ color: 'var(--hn-sub)' }}
    >
      {isPending ? (
        <Loader2 size={22} className="animate-spin" />
      ) : (
        <div className="text-[13px]">
          {message}
          <button
            onClick={onRetry}
            className="block mx-auto mt-2 text-[12.5px] font-bold"
            style={{ color: 'var(--hn-clay)' }}
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
