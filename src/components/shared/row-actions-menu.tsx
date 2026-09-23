'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Icons } from './icons'

export interface RowAction {
  label: string
  icon?: keyof typeof Icons
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
  /** Confirm before running `onClick`, instead of running it immediately —
   *  same copy shape `ConfirmButton` takes. */
  confirm?: { title: string; description: string; confirmLabel: string }
}

/**
 * A list row's trailing actions (edit, deactivate, delete, ...) collapsed
 * into one overflow menu instead of a row of individual buttons — each row
 * in the students/classrooms/staff lists was carrying 3-4 separate button
 * elements, which read as a wall of chrome rather than a scannable list.
 */
export function RowActionsMenu({ label, actions }: { label: string; actions: readonly RowAction[] }) {
  const [pending, setPending] = useState<RowAction | null>(null)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={label}>
            <Icons.moreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => {
            const Icon = action.icon ? Icons[action.icon] : null
            return (
              <DropdownMenuItem
                key={action.label}
                disabled={action.disabled ?? false}
                variant={action.destructive ? 'destructive' : 'default'}
                onSelect={(e) => {
                  if (action.confirm) {
                    e.preventDefault()
                    setPending(action)
                  } else {
                    action.onClick()
                  }
                }}
              >
                {Icon && <Icon />}
                {action.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        {pending?.confirm && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{pending.confirm.title}</AlertDialogTitle>
              <AlertDialogDescription>{pending.confirm.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant={pending.destructive ? 'destructive' : 'default'}
                onClick={() => {
                  const action = pending
                  setPending(null)
                  action?.onClick()
                }}
              >
                {pending.confirm.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </>
  )
}
