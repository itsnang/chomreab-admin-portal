import type { ComponentProps } from 'react'
import { Icons } from '@/components/shared/icons'
import { cn } from '@/lib/utils'

/** Styled wrapper around a native `<select>` — matches `Input`'s height, radius
 *  and border, with a trailing chevron. No shadcn Select is installed; this
 *  keeps the three form sheets from each hand-rolling the same markup. */
export function SelectField({ className, children, ref, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        ref={ref}
        data-slot="select-field"
        className={cn(
          'h-9 w-full appearance-none rounded-md border bg-background px-3 pr-9 text-sm',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <Icons.chevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
