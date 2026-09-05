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
        <h1 className="text-[21px] font-extrabold -tracking-[0.02em]" style={{ color: 'var(--hn-ink)' }}>
          {heading}
        </h1>
        {description && (
          <p className="text-[12px] font-semibold mt-0.5" style={{ color: 'var(--hn-sub)' }}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
