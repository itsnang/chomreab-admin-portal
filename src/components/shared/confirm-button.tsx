'use client'

import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog, type ConfirmCopy } from './confirm-dialog'

interface ConfirmButtonProps extends ConfirmCopy {
  onConfirm: () => void
  /** The trigger's own label and appearance. */
  children: ReactNode
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  disabled?: boolean
  /** Styles the confirming button as destructive. */
  destructive?: boolean
  'aria-label'?: string
}

/** A button whose action is confirmed first, so it can't quietly skip the
 *  prompt. */
export function ConfirmButton({
  title,
  description,
  confirmLabel,
  onConfirm,
  children,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  destructive = false,
  ...props
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-label={props['aria-label']}
      >
        {children}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        copy={{ title, description, confirmLabel }}
        onConfirm={onConfirm}
        destructive={destructive}
      />
    </>
  )
}
