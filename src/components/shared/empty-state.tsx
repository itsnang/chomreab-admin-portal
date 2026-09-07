import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  /** A lucide icon element, e.g. `<Icons.users />`. */
  icon?: ReactNode
  title: string
  description?: string
  /** A primary action — "Add the first student". */
  action?: ReactNode
  className?: string
}

/** Shown in place of a list that has no rows, so an empty screen explains
 *  itself instead of rendering a bare bordered box. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2 px-6 py-14 text-center', className)}>
      {icon && (
        <div className="mb-1 grid size-11 place-items-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="max-w-xs text-[13px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
