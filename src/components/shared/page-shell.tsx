import type { ReactNode } from 'react'

interface PageShellProps {
  heading: string
  description?: string
  /** Primary page action, right of the heading. */
  actions?: ReactNode
  /** Filters and search, on their own row beneath the heading. */
  toolbar?: ReactNode
  children: ReactNode
}

export function PageShell({ heading, description, actions, toolbar, children }: PageShellProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-extrabold -tracking-[0.02em]">{heading}</h1>
          {description && (
            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {toolbar}
      {children}
    </div>
  )
}
