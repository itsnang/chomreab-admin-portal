import { cn } from '@/lib/utils'

/** Plain segmented progress bar for the sign-up wizard — one filled segment
 *  per step reached, no numbers or labels needed on top of it. */
export function AuthStepper({
  steps,
  current,
}: {
  steps: readonly string[]
  current: number
}) {
  return (
    <div className="mb-6 flex items-center gap-1.5" aria-hidden="true">
      {steps.map((_, i) => (
        <span
          key={i}
          className={cn('h-1 flex-1 rounded-full transition-colors', i <= current ? 'bg-primary' : 'bg-muted')}
        />
      ))}
    </div>
  )
}
