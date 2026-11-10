import type { ReactNode } from 'react'

interface PageShellProps {
  heading: string
  description?: string
  /** Primary page action, right of the header's own row. */
  actions?: ReactNode
  /** Filters and search — shares the header row, wrapping to its own row
   *  only when the page is too narrow to fit both. */
  toolbar?: ReactNode
  children: ReactNode
}

export function PageShell({ heading, description, actions, toolbar, children }: PageShellProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b px-6 py-5">
        <div className="mr-auto">
          <h1 className="text-[19px] font-extrabold -tracking-[0.02em]">{heading}</h1>
          {description && <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{description}</p>}
        </div>
        {toolbar}
        {actions}
      </div>
      <div className="flex flex-col gap-4 p-6">{children}</div>
    </div>
  )
}
