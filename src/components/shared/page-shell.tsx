import type { ReactNode } from 'react'

interface PageShellProps {
  heading: string
  description?: string
  children: ReactNode
}

export function PageShell({ heading, description, children }: PageShellProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
