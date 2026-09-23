'use client'

import { Suspense, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import { PrototypeShellSwitcher } from './prototype-shell-switcher'

interface PageShellProps {
  heading: string
  description?: string
  /** Primary page action, right of the heading. */
  actions?: ReactNode
  /** Filters and search, on their own row beneath the heading. */
  toolbar?: ReactNode
  children: ReactNode
}

// PROTOTYPE for ticket #23 (tighten PageShell density conventions) — delete
// the variant functions and switcher below once one is chosen, keeping only
// the winner's body as the real `PageShell`.
// https://github.com/itsnang/attendance-admin/issues/23

function ShellCurrent({ heading, description, actions, toolbar, children }: PageShellProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-extrabold -tracking-[0.02em]">{heading}</h1>
          {description && <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {toolbar}
      {children}
    </div>
  )
}

/** Smaller scale across the board: tighter outer padding, smaller heading,
 *  less air between the header row and everything below it. Same structure
 *  as today, just turned down. */
function ShellTight({ heading, description, actions, toolbar, children }: PageShellProps) {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-[17px] font-bold -tracking-[0.01em]">{heading}</h1>
          {description && <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      {toolbar}
      {children}
    </div>
  )
}

/** Same scale as today, but a hairline under the header block gives the page
 *  an explicit boundary instead of relying on whitespace alone to separate
 *  "what page is this" from "what's on it". */
function ShellDivided({ heading, description, actions, toolbar, children }: PageShellProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-6 py-5">
        <div>
          <h1 className="text-[19px] font-extrabold -tracking-[0.02em]">{heading}</h1>
          {description && <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      <div className="flex flex-col gap-4 p-6">
        {toolbar}
        {children}
      </div>
    </div>
  )
}

/** The toolbar moves onto the heading's own row instead of stacking beneath
 *  it — one row of chrome instead of two — collapsing to its own row only
 *  when the page is too narrow to fit both. */
function ShellCompactToolbar({ heading, description, actions, toolbar, children }: PageShellProps) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[19px] font-extrabold -tracking-[0.02em]">{heading}</h1>
          {description && <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
          {actions}
        </div>
      </div>
      {children}
    </div>
  )
}

function PageShellVariant(props: PageShellProps) {
  const searchParams = useSearchParams()
  const variant = searchParams.get('shell') ?? 'current'

  if (variant === 'tight') return <ShellTight {...props} />
  if (variant === 'divided') return <ShellDivided {...props} />
  if (variant === 'compact-toolbar') return <ShellCompactToolbar {...props} />
  return <ShellCurrent {...props} />
}

export function PageShell(props: PageShellProps) {
  return (
    <>
      <Suspense fallback={<ShellCurrent {...props} />}>
        <PageShellVariant {...props} />
      </Suspense>
      <Suspense fallback={null}>
        <PrototypeShellSwitcher />
      </Suspense>
    </>
  )
}
