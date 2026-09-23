import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Numbered stepper for the sign-up wizard — a completed step shows a
 * checkmark and its connecting line fills in, so progress reads at a glance
 * instead of relying only on the "Step X of Y" line.
 */
export function AuthStepper({
  steps,
  current,
}: {
  steps: readonly string[]
  current: number
}) {
  return (
    <div className="mb-6" role="group" aria-label={`Step ${current + 1} of ${steps.length}`}>
      <p className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
        Step {current + 1} of {steps.length}
      </p>
      <div className="flex items-start">
        {steps.map((label, i) => {
          const done = i < current
          const active = i === current
          const reached = done || active
          return (
            <div key={label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                    reached
                      ? 'bg-primary text-primary-foreground'
                      : 'border bg-muted text-muted-foreground'
                  )}
                >
                  {done ? <Check size={13} /> : i + 1}
                </div>
                <span
                  className={cn(
                    'max-w-[80px] text-center text-[10.5px] leading-tight font-semibold',
                    reached ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-[2px] flex-1 rounded-full transition-colors',
                    done ? 'bg-primary' : 'bg-border'
                  )}
                  style={{ marginBottom: '18px' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
