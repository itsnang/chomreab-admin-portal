'use client'

import { Fragment, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog, type ConfirmCopy } from './confirm-dialog'
import { Icons } from './icons'

interface BaseRowAction {
  label: string
  icon?: keyof typeof Icons
  onClick: () => void
  disabled?: boolean
}

interface SafeRowAction extends BaseRowAction {
  destructive?: false
  /** Confirm before running `onClick`, instead of running it immediately. */
  confirm?: ConfirmCopy
}

/** A destructive action has to carry its prompt — the type is what stops one
 *  from running straight off a single menu click. */
interface DestructiveRowAction extends BaseRowAction {
  destructive: true
  confirm: ConfirmCopy
}

export type RowAction = SafeRowAction | DestructiveRowAction

interface RowActionsMenuProps {
  label: string
  actions: readonly RowAction[]
  /** Swaps the trigger's icon for a spinner while one of the actions is
   *  running, since the menu itself is closed by then. */
  busy?: boolean
}

/**
 * A list row's trailing actions (edit, deactivate, delete, ...) collapsed
 * into one overflow menu instead of a row of individual buttons — each row
 * in the students/classrooms/staff lists was carrying 3-4 separate button
 * elements, which read as a wall of chrome rather than a scannable list.
 */
export function RowActionsMenu({ label, actions, busy = false }: RowActionsMenuProps) {
  const selected = useRef<RowAction | null>(null)
  // Kept after the dialog closes so its copy is still there to animate out.
  const [confirming, setConfirming] = useState<RowAction | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Runs once the menu has fully closed and handed focus back to its trigger.
  // Opening a dialog or sheet any earlier has the two modal layers fighting
  // over focus and the body's `pointer-events`.
  const runSelected = () => {
    const action = selected.current
    selected.current = null
    if (!action) return
    if (action.confirm) {
      setConfirming(action)
      setConfirmOpen(true)
    } else {
      action.onClick()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={label} aria-busy={busy}>
            {busy ? <Icons.loader2 className="animate-spin" /> : <Icons.moreVertical />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onCloseAutoFocus={runSelected}>
          {actions.map((action, i) => {
            const Icon = action.icon ? Icons[action.icon] : null
            const startsDestructiveGroup =
              action.destructive && i > 0 && !actions[i - 1]?.destructive
            return (
              <Fragment key={action.label}>
                {startsDestructiveGroup && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  disabled={action.disabled ?? false}
                  variant={action.destructive ? 'destructive' : 'default'}
                  onSelect={() => {
                    selected.current = action
                  }}
                >
                  {Icon && <Icon />}
                  {action.label}
                </DropdownMenuItem>
              </Fragment>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {confirming?.confirm && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          copy={confirming.confirm}
          onConfirm={confirming.onClick}
          destructive={confirming.destructive ?? false}
        />
      )}
    </>
  )
}
